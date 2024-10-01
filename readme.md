## automerge-repo-storage-origin-private-file-system

An [Automerge](https://automerge.org/)
[Repo](https://automerge.org/docs/repositories)
[Storage adapter](https://automerge.org/docs/repositories/storage/) for using
the browser's [Origin private file system](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system) as storage.

it uses the same speedy optimized filesystem layout as Automerge's own [nodefs
adapter](https://automerge.org/docs/repositories/storage/#file-system), and is
tested against the same storage adapter tests as the adapters that come with
automerge-repo in Chromium and Firefox.

## usage

```bash
pnpm add automerge-repo-storage-origin-private-file-system
```

```ts
import {BrowserWebSocketClientAdapter} from "@automerge/automerge-repo-network-websocket"
import OriginPrivateFileSystemAdapter from "automerge-repo-storage-origin-private-file-system"
import {Repo} from "@automerge/automerge-repo"

export default async function startAutomerge() {
	const repo = new Repo({
		storage: new OriginPrivateFileSystemAdapter("automerge"),
		network: [new BrowserWebSocketClientAdapter("wss://sync.automerge.org")],
	})
	return repo
}
```

for more info see the fabulous [automerge website](https://automerge.org/)

## weaknesses and drawbacks

because of a [missing
API](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)
in Safari's implementation of the Origin private file system, this storage
mechanism does not currently work in Safari. there appears to be no indication
that they will ever add support for it, but who knows.

perhaps you would find it enjoyable to submit a pull request that uses a
WebWorker to do the writing in Safari?
