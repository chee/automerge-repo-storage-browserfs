import {describe} from "vitest"
import {runStorageAdapterTests} from "./storage-adapter-tests.ts"
import OriginPrivateFileSystemAdapter from "../source/origin-private-file-system-storage-adapter.ts"

describe("OriginPrivateFileSystemAdapter", () => {
	const setup = async () => {
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

		const adapter = new OriginPrivateFileSystemAdapter("automerge")
		const opfs = await globalThis.navigator.storage.getDirectory()
		return {
			adapter,
			async teardown() {
				await opfs
					.getDirectoryHandle("automerge")
					.then(() => {
						return opfs.removeEntry("automerge", {recursive: true})
					})
					.catch(() => {})
			},
		}
	}

	runStorageAdapterTests(setup)
})
