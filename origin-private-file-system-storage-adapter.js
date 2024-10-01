"use strict";
export default class OPFSStorageAdapter {
  directory;
  cache = /* @__PURE__ */ new Map();
  constructor(name = "automerge") {
    const directory = navigator.storage.getDirectory().then(async (root) => {
      return root.getDirectoryHandle(name, {
        create: true
      });
    });
    this.directory = directory;
  }
  async load(storageKey) {
    const path = getFilePath(storageKey);
    const key = getCacheKeyFromFilePath(path);
    if (this.cache.has(key)) return this.cache.get(key);
    const handle = await this.directory.then((dir) => getFileHandle(dir, path));
    const file = await handle.getFile();
    if (file.size) {
      return new Uint8Array(await file.arrayBuffer());
    } else {
      return void 0;
    }
  }
  async save(storageKey, data) {
    const path = getFilePath(storageKey);
    const key = getCacheKeyFromFilePath(path);
    this.cache.set(key, data);
    const handle = await this.directory.then((dir) => getFileHandle(dir, path));
    const writable = await handle.createWritable({ keepExistingData: false });
    await writable.write(data);
    await writable.close();
  }
  async remove(storageKey) {
    const path = getFilePath(storageKey);
    const key = getCacheKeyFromFilePath(path);
    this.cache.delete(key);
    const dirpath = path.slice(0, -1);
    const filename = path[path.length - 1];
    const handle = await this.directory.then(
      (dir) => getDirectoryHandle(dir, dirpath)
    );
    await handle.removeEntry(filename, { recursive: true });
  }
  async loadRange(storageKeyPrefix) {
    const path = getFilePath(storageKeyPrefix);
    const cacheKeyPrefix = getCacheKeyFromFilePath(path);
    const chunks = [];
    const skip = [];
    for (const [key, data] of this.cache.entries()) {
      if (key.startsWith(cacheKeyPrefix)) {
        skip.push(key);
        chunks.push({ key: ungetFilePath(key.split("/")), data });
      }
    }
    const dir = await getDirectoryHandle(await this.directory, path);
    const handles = await getFileHandlesRecursively(dir, path);
    for (const { key, handle } of handles) {
      const fileCacheKey = getCacheKeyFromFilePath(key);
      if (skip.includes(fileCacheKey)) continue;
      chunks.push({
        key: ungetFilePath(key),
        data: new Uint8Array(await (await handle.getFile()).arrayBuffer())
      });
    }
    return chunks;
  }
  async removeRange(storageKeyPrefix) {
    const path = getFilePath(storageKeyPrefix);
    const cacheKeyPrefix = getCacheKeyFromFilePath(path);
    for (const key of this.cache.keys()) {
      if (key.startsWith(cacheKeyPrefix)) {
        this.cache.delete(key);
      }
    }
    const parent = await this.directory.then(
      (dir) => getDirectoryHandle(dir, path.slice(0, -1))
    );
    await parent.removeEntry(path[path.length - 1], { recursive: true });
  }
}
function getCacheKeyFromFilePath(key) {
  return key.join("/");
}
function getFilePath(keyArray) {
  const [firstKey, ...remainingKeys] = keyArray;
  return [firstKey.slice(0, 2), firstKey.slice(2), ...remainingKeys];
}
function ungetFilePath(path) {
  const [firstKey, secondKey, ...remainingKeys] = path;
  return [firstKey + secondKey, ...remainingKeys];
}
async function getFileHandle(dir, path) {
  path = path.slice();
  let part;
  while (part = path.shift()) {
    if (path.length) {
      dir = await dir.getDirectoryHandle(part, { create: true });
    } else {
      return await dir.getFileHandle(part, { create: true });
    }
  }
}
async function getDirectoryHandle(dir, path) {
  path = path.slice();
  let part;
  while (part = path.shift()) {
    dir = await dir.getDirectoryHandle(part, { create: true });
  }
  return dir;
}
async function getFileHandlesRecursively(dir, prefix) {
  let handles = [];
  for await (const [name, handle] of dir.entries()) {
    let next = prefix.concat(name);
    if (handle.kind == "directory") {
      handles = handles.concat(
        await getFileHandlesRecursively(
          handle,
          next
        )
      );
    } else {
      handles.push({
        key: next,
        handle
      });
    }
  }
  return handles;
}
