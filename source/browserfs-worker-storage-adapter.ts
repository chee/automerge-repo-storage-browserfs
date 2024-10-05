import type {
	Chunk,
	StorageAdapterInterface,
	StorageKey,
} from "@automerge/automerge-repo/slim"

export default class BrowserFileSystemStorageAdapter
	implements StorageAdapterInterface
{
	private worker: Worker
	constructor(directory: string) {
		this.worker = new Worker(
			new URL("./browserfs-storage-adapter.worker.ts", import.meta.url)
		)
		this.worker.postMessage({
			type: "start",
			directory,
		})
	}

	async load(storageKey: StorageKey): Promise<Uint8Array | undefined> {
		const key = getCacheKeyFromStorageKey(storageKey)
		const {resolve, promise} = Promise.withResolvers<Uint8Array>()
		const onmessage = event => {
			if (
				event.data.type == "load" &&
				getCacheKeyFromStorageKey(event.data.key) == key
			) {
				this.worker.removeEventListener("message", onmessage)
				resolve(event.data.bytes)
			}
		}
		this.worker.addEventListener("message", onmessage)
		this.worker.postMessage({
			type: "load",
			key: storageKey,
		})
		return await promise
	}

	async save(storageKey: StorageKey, data: Uint8Array): Promise<void> {
		const key = getCacheKeyFromStorageKey(storageKey)
		const {resolve, promise} = Promise.withResolvers<void>()
		const onmessage = event => {
			if (
				event.data.type == "save" &&
				getCacheKeyFromStorageKey(event.data.key) == key
			) {
				this.worker.removeEventListener("message", onmessage)
				resolve()
			}
		}
		this.worker.addEventListener("message", onmessage)
		this.worker.postMessage(
			{
				type: "save",
				key: storageKey,
				bytes: data,
			},
			[data.buffer]
		)
		await promise
	}
	async remove(storageKey: StorageKey): Promise<void> {
		const key = getCacheKeyFromStorageKey(storageKey)
		const {resolve, promise} = Promise.withResolvers<void>()
		const onmessage = event => {
			if (
				event.data.type == "remove" &&
				getCacheKeyFromStorageKey(event.data.key) == key
			) {
				this.worker.removeEventListener("message", onmessage)
				resolve()
			}
		}
		this.worker.addEventListener("message", onmessage)
		this.worker.postMessage({
			type: "remove",
			key: storageKey,
		})
		await promise
	}

	async loadRange(storageKeyPrefix: StorageKey): Promise<Chunk[]> {
		const prefix = getCacheKeyFromStorageKey(storageKeyPrefix)
		const {resolve, promise} = Promise.withResolvers<Chunk[]>()
		const onmessage = event => {
			if (
				event.data.type == "loadRange" &&
				getCacheKeyFromStorageKey(event.data.prefix) == prefix
			) {
				this.worker.removeEventListener("message", onmessage)
				resolve(event.data.chunks)
			}
		}
		this.worker.addEventListener("message", onmessage)
		this.worker.postMessage({
			type: "loadRange",
			prefix: storageKeyPrefix,
		})
		return await promise
	}
	async removeRange(storageKeyPrefix: StorageKey): Promise<void> {
		const prefix = getCacheKeyFromStorageKey(storageKeyPrefix)
		const {resolve, promise} = Promise.withResolvers<void>()
		const onmessage = event => {
			if (
				event.data.type == "removeRange" &&
				getCacheKeyFromStorageKey(event.data.prefix) == prefix
			) {
				this.worker.removeEventListener("message", onmessage)
				resolve()
			}
		}
		this.worker.addEventListener("message", onmessage)
		this.worker.postMessage({
			type: "removeRange",
			prefix: storageKeyPrefix,
		})
		await promise
	}
}

function getCacheKeyFromFilePath(key: string[]) {
	return key.join("/")
}

function getFilePath(keyArray: string[]): string[] {
	const [firstKey, ...remainingKeys] = keyArray
	return [firstKey.slice(0, 2), firstKey.slice(2), ...remainingKeys]
}

function getCacheKeyFromStorageKey(key: string[]): string {
	return getCacheKeyFromFilePath(getFilePath(key))
}
