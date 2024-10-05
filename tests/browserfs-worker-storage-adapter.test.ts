import {describe, expect} from "vitest"
import {runStorageAdapterTests} from "./storage-adapter-tests.ts"

describe("BrowserFileSystemAdapter", function () {
	if (!globalThis.Worker) {
		expect(true).toBe(true)
		return
	}
	runStorageAdapterTests(async function () {
		if (!globalThis.navigator.storage) {
			const fileSystemAccess = await import("file-system-access")
			const nodeAdapter = await import(
				"file-system-access/lib/adapters/node.js"
			)

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
		const BrowserFileSystemAdapter = await import(
			"../source/browserfs-worker-storage-adapter.ts"
		).then(module => module.default)
		const adapter = new BrowserFileSystemAdapter(rootDirectoryName)

		return {
			adapter,
			async teardown() {
				await opfs.removeEntry(rootDirectoryName, {recursive: true})
			},
		}
	})
})
