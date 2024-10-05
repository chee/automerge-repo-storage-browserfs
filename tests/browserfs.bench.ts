import {bench, describe} from "vitest"
import BrowserFileSystemStorageAdapter from "../source/browserfs-storage-adapter.ts"
import BrowserFileSystemWorkerStorageAdapter from "../source/browserfs-worker-storage-adapter.ts"
import {IndexedDBStorageAdapter} from "@automerge/automerge-repo-storage-indexeddb"
import {Repo, splice} from "@automerge/automerge-repo"
import {edits} from "./editing-trace.js"

if (!globalThis.navigator.storage) {
	const fileSystemAccess = await import("file-system-access")
	const nodeAdapter = await import("file-system-access/lib/adapters/node.js")

	// @ts-expect-error we're in node w/ jsdom and this isn't there
	globalThis.navigator.storage ??= {}
	globalThis.navigator.storage.getDirectory = () =>
		fileSystemAccess.getOriginPrivateDirectory(
			nodeAdapter,
			"./tests/navigator.storage"
		)
}

const opfs = await globalThis.navigator.storage.getDirectory()
const rootDirectoryName = "automerge"
const root = await opfs.getDirectoryHandle(rootDirectoryName, {
	create: true,
})
const browserfs = new BrowserFileSystemStorageAdapter(root)
const worker = new BrowserFileSystemWorkerStorageAdapter(rootDirectoryName)
const idb = new IndexedDBStorageAdapter("root")
const repos = {
	browserfs: new Repo({
		storage: browserfs,
	}),
	worker: new Repo({
		storage: worker,
	}),
	idb: new Repo({
		storage: idb,
	}),
}

const array = Array.from(Array(1000), () => Math.random())
const created = {
	browserfs: repos.browserfs.create({array}),
	idb: repos.idb.create({array}),
	worker: repos.worker.create({array}),
}

describe("create", () => {
	bench("browserfs", () => {
		repos.browserfs.create({array})
	})
	bench("worker", () => {
		repos.worker.create({array})
	})
	bench("idb", () => {
		repos.idb.create({array})
	})
})

describe("find", () => {
	bench("browserfs", () => {
		repos.browserfs.find(created.browserfs.url)
	})
	bench("worker", () => {
		repos.worker.find(created.worker.url)
	})
	bench("idb", () => {
		repos.idb.find(created.idb.url)
	})
})

describe("change", () => {
	bench("browserfs", () => {
		created.browserfs.change(doc => {
			doc.array[10] = 10
			doc.array[25] = 25
			doc.array[125] = 125
			doc.array[500] = 500
		})
	})
	bench("worker", () => {
		created.worker.change(doc => {
			doc.array[10] = 10
			doc.array[25] = 25
			doc.array[125] = 125
			doc.array[500] = 500
		})
	})
	bench("idb", () => {
		created.idb.change(doc => {
			doc.array[10] = 10
			doc.array[25] = 25
			doc.array[125] = 125
			doc.array[500] = 500
		})
	})
})

describe("editing trace", () => {
	bench("browserfs", () => {
		const handle = repos.browserfs.create({text: ""})
		handle.change(doc => {
			for (let i = 0; i < edits.length; i++) {
				let [index, del, newtext] = edits[i]
				splice(doc, ["text"], index, del, newtext)
			}
		})
	})
	bench("worker", () => {
		const handle = repos.worker.create({text: ""})
		handle.change(doc => {
			for (let i = 0; i < edits.length; i++) {
				let [index, del, newtext] = edits[i]
				splice(doc, ["text"], index, del, newtext)
			}
		})
	})
	bench("idb", () => {
		const handle = repos.idb.create({text: ""})
		handle.change(doc => {
			for (let i = 0; i < edits.length; i++) {
				let [index, del, newtext] = edits[i]
				splice(doc, ["text"], index, del, newtext)
			}
		})
	})
})
