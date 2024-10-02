import type {
	Chunk,
	StorageAdapterInterface,
	StorageKey,
} from "@automerge/automerge-repo/slim"

export default class BrowserFileSystemStorageAdapter
	implements StorageAdapterInterface
{
	constructor(
		directory:
			| string
			| FileSystemDirectoryHandle
			| Promise<FileSystemDirectoryHandle>
	) {
		if (typeof directory == "string") {
			this.directory = navigator.storage
				.getDirectory()
				.then(dir => dir.getDirectoryHandle(directory, {create: true}))
		} else {
			this.directory = directory
		}
	}
	private directory:
		| Promise<FileSystemDirectoryHandle>
		| FileSystemDirectoryHandle
	private cache: Map<string, Uint8Array> = new Map()
	// todo caching these may or may not be sensible
	// private fileHandleCache: Map<string, FileSystemFileHandle>
	// private directoryHandleCache: Map<string, FileSystemDirectoryHandle>

	async load(storageKey: StorageKey): Promise<Uint8Array | undefined> {
		const path = getFilePath(storageKey)
		const key = getCacheKeyFromFilePath(path)
		if (this.cache.has(key)) return this.cache.get(key)
		const handle = await getFileHandle(await this.directory, path)
		const file = await handle!.getFile()
		if (file.size) {
			return new Uint8Array(await file.arrayBuffer())
		} else {
			return undefined
		}
	}

	async save(storageKey: StorageKey, data: Uint8Array): Promise<void> {
		const path = getFilePath(storageKey)
		const key = getCacheKeyFromFilePath(path)
		this.cache.set(key, data)
		const handle = await getFileHandle(await this.directory, path)
		// todo this part needs to happen in a worker in Safari
		const writable = await handle!.createWritable({keepExistingData: false})
		await writable.write(data)
		await writable.close()
	}
	async remove(storageKey: StorageKey): Promise<void> {
		const path = getFilePath(storageKey)
		const key = getCacheKeyFromFilePath(path)
		this.cache.delete(key)
		const dirpath = path.slice(0, -1)
		const filename = path[path.length - 1]
		const handle = await getDirectoryHandle(await this.directory, dirpath)
		await handle.removeEntry(filename, {recursive: true})
	}
	async loadRange(storageKeyPrefix: StorageKey): Promise<Chunk[]> {
		const path = getFilePath(storageKeyPrefix)
		const cacheKeyPrefix = getCacheKeyFromFilePath(path)

		const chunks: Chunk[] = []
		const skip: string[] = []
		for (const [key, data] of this.cache.entries()) {
			if (key.startsWith(cacheKeyPrefix)) {
				skip.push(key)
				chunks.push({key: ungetFilePath(key.split("/")), data})
			}
		}
		const dir = await getDirectoryHandle(await this.directory, path)
		const handles = await getFileHandlesRecursively(dir, path)
		for (const {key, handle} of handles) {
			const fileCacheKey = getCacheKeyFromFilePath(key)
			if (skip.includes(fileCacheKey)) continue
			chunks.push({
				key: ungetFilePath(key),
				data: new Uint8Array(await (await handle.getFile()).arrayBuffer()),
			})
		}
		return chunks
	}
	async removeRange(storageKeyPrefix: StorageKey): Promise<void> {
		const path = getFilePath(storageKeyPrefix)
		const cacheKeyPrefix = getCacheKeyFromFilePath(path)
		for (const key of this.cache.keys()) {
			if (key.startsWith(cacheKeyPrefix)) {
				this.cache.delete(key)
			}
		}
		const parent = await getDirectoryHandle(
			await this.directory,
			path.slice(0, -1)
		)
		await parent.removeEntry(path[path.length - 1], {recursive: true})
	}
}

function getCacheKeyFromFilePath(key: string[]) {
	return key.join("/")
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
