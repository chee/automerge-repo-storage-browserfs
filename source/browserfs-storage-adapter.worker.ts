/// <reference lib="webworker" />

import type {Chunk, StorageKey} from "@automerge/automerge-repo/slim"

const rootPromise = navigator.storage.getDirectory()

const {promise: storage, resolve} =
	Promise.withResolvers<AutomergeStorageManager>()

onmessage = async event => {
	const message = event.data
	switch (message.type) {
		case "start": {
			resolve(
				new AutomergeStorageManager(
					rootPromise.then(dir =>
						dir.getDirectoryHandle(message.directory, {create: true})
					)
				)
			)
			return
		}
		case "load": {
			const bytes = await (await storage).load(message.key)
			if (!bytes) {
				globalThis.postMessage({
					type: "load",
					key: message.key,
					bytes,
				})
				return
			}
			globalThis.postMessage(
				{
					type: "load",
					key: message.key,
					bytes,
				},
				bytes ? [bytes.buffer] : []
			)
			return
		}
		case "save": {
			storage.then(storage => {
				storage
					.save(message.key, message.bytes)
					.then(() => {
						globalThis.postMessage({
							type: "save",
							key: message.key,
						})
					})
					.catch(e => {
						console.info("fail?", e, storage)
					})
			})

			return
		}
		case "remove": {
			await (await storage).remove(message.key)
			globalThis.postMessage({
				type: "remove",
				key: message.key,
			})
			return
		}
		case "loadRange": {
			const chunks = await (await storage).loadRange(message.prefix)
			globalThis.postMessage(
				{
					type: "loadRange",
					prefix: message.prefix,
					chunks,
				},
				chunks.map(chunk => chunk.data?.buffer).filter(Boolean) as Uint8Array[]
			)
			return
		}
		case "removeRange": {
			await (await storage).removeRange(message.prefix)
			globalThis.postMessage({
				type: "removeRange",
				prefix: message.prefix,
			})
			return
		}
		default:
	}
}

class AutomergeStorageManager {
	constructor(private readonly directory: Promise<FileSystemDirectoryHandle>) {}

	async load(storageKey: StorageKey): Promise<Uint8Array | undefined> {
		const path = getFilePath(storageKey)
		const key = path.join("/")
		const handle = await getFileHandle(await this.directory, path)
		const file = await handle!.getFile()
		if (file.size) {
			const bytes = new Uint8Array(await file.arrayBuffer())
			return bytes
		} else {
			return undefined
		}
	}

	async save(storageKey: StorageKey, data: Uint8Array): Promise<void> {
		const path = getFilePath(storageKey)
		const key = path.join("/")
		const handle = await getFileHandle(await this.directory, path)
		let sync = await handle!.createSyncAccessHandle()
		while (!(sync instanceof FileSystemSyncAccessHandle)) {
			console.log("waiting for file handle to be released")
			await new Promise(yay => setTimeout(yay))
			sync = await handle!.createSyncAccessHandle()
		}

		sync.truncate(0)
		sync.write(data)
		sync.flush()
		sync.close()
	}

	async remove(storageKey: StorageKey): Promise<void> {
		const path = getFilePath(storageKey)
		const dirpath = path.slice(0, -1)
		const filename = path[path.length - 1]
		const handle = await getDirectoryHandle(await this.directory, dirpath)
		await handle.removeEntry(filename, {recursive: true}).catch(() => {})
	}
	async loadRange(storageKeyPrefix: StorageKey): Promise<Chunk[]> {
		const path = getFilePath(storageKeyPrefix)
		const chunks: Chunk[] = []
		const dir = await getDirectoryHandle(await this.directory, path)
		const handles = await getFileHandlesRecursively(dir, path)
		for (const {key, handle} of handles) {
			const bytes = new Uint8Array(await (await handle.getFile()).arrayBuffer())
			chunks.push({
				key: ungetFilePath(key),
				data: bytes,
			})
		}
		return chunks
	}
	async removeRange(storageKeyPrefix: StorageKey): Promise<void> {
		const path = getFilePath(storageKeyPrefix)
		const parent = await getDirectoryHandle(
			await this.directory,
			path.slice(0, -1)
		)
		await parent.removeEntry(path[path.length - 1], {recursive: true})
	}
}

function getFilePath(keyArray: string[]): string[] {
	const [firstKey, ...remainingKeys] = keyArray
	return [firstKey.slice(0, 2), firstKey.slice(2), ...remainingKeys]
}

function ungetFilePath(path: string[]) {
	const [firstKey, secondKey, ...remainingKeys] = path
	return [firstKey + secondKey, ...remainingKeys]
}

async function getFileHandle(dir: FileSystemDirectoryHandle, path: string[]) {
	path = path.slice()
	let part
	while ((part = path.shift())) {
		if (path.length) {
			dir = await dir.getDirectoryHandle(part, {create: true})
		} else {
			return await dir.getFileHandle(part, {create: true})
		}
	}
}

async function getDirectoryHandle(
	dir: FileSystemDirectoryHandle,
	path: string[]
) {
	path = path.slice()
	let part
	while ((part = path.shift())) {
		dir = await dir.getDirectoryHandle(part, {create: true})
	}
	return dir
}

async function getFileHandlesRecursively(
	dir: FileSystemDirectoryHandle,
	prefix: string[]
) {
	let handles: {key: string[]; handle: FileSystemFileHandle}[] = []

	for await (const [name, handle] of dir.entries()) {
		let next = prefix.concat(name)
		if (handle.kind == "directory") {
			handles = handles.concat(
				await getFileHandlesRecursively(
					handle as FileSystemDirectoryHandle,
					next
				)
			)
		} else {
			handles.push({
				key: next,
				handle: handle as FileSystemFileHandle,
			})
		}
	}

	return handles
}
