import {BrowserWebSocketClientAdapter} from "@automerge/automerge-repo-network-websocket"
import BrowserFileSystemAdapter from "../../source/browserfs-worker-storage-adapter.ts"
import {Repo} from "@automerge/automerge-repo"

export default function startAutomerge(directory: string) {
	const repo = new Repo({
		network: [new BrowserWebSocketClientAdapter(`wss://galaxy.observer`)],
		storage: new BrowserFileSystemAdapter(directory),
	})
	return repo
}
