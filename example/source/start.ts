import {BrowserWebSocketClientAdapter} from "@automerge/automerge-repo-network-websocket"
import OriginPrivateFileSystemAdapter from "../.."
import {Repo} from "@automerge/automerge-repo"

export default async function startAutomerge() {
	const repo = new Repo({
		network: [new BrowserWebSocketClientAdapter(`wss://galaxy.observer`)],
		storage: new OriginPrivateFileSystemAdapter("root"),
	})
	return repo
}
