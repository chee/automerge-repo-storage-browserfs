import {describe} from "vitest"
import {runStorageAdapterTests} from "./storage-adapter-tests.ts"
import BrowserFileSystemAdapter from "../source/browserfs-storage-adapter.ts"

describe("BrowserFileSystemAdapter", function () {
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
		const root = await opfs.getDirectoryHandle(rootDirectoryName, {
			create: true,
		})

		const adapter = new BrowserFileSystemAdapter(root)

		return {
			adapter,
			async teardown() {
				await opfs.removeEntry(rootDirectoryName, {recursive: true})
			},
		}
	})
})
