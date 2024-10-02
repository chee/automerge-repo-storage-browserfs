## automerge-repo-storage-browserfs

An [Automerge](https://automerge.org/)
[Repo](https://automerge.org/docs/repositories)
[Storage adapter](https://automerge.org/docs/repositories/storage/) for using
a [Directory](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle) of the browser's [File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) as storage.

it uses the same speedy optimized filesystem layout as Automerge's own [nodefs
adapter](https://automerge.org/docs/repositories/storage/#file-system), and is
tested against the same storage adapter tests as the adapters that come with
automerge-repo in Chromium and Firefox.

## usage

```bash
pnpm add automerge-repo-storage-browser-file-system
```

```ts
import {BrowserWebSocketClientAdapter} from "@automerge/automerge-repo-network-websocket"
import BrowserFileSystemAdapter from "automerge-repo-storage-browser-file-system"
import {Repo} from "@automerge/automerge-repo"

export default async function startAutomerge() {
	const repo = new Repo({
		storage: new BrowserFileSystemAdapter("automerge"), // or pass a FileSystemDirectoryHandle
		network: [new BrowserWebSocketClientAdapter("wss://sync.automerge.org")],
	})
	return repo
}
```

for general info on automerge repo, see the fabulous [automerge website](https://automerge.org/)

## browser differences

- In Chromium the directory can provided by the
  [`showDirectoryPicker`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker)
  or the [Origin private file
  system](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system)'s
  `navigator.storage.getDirectory()`.
- In Firefox only the origin private file system is available.
- In Safari, the main thread cannot write to even the OPFS. If you'd like to submit a Pull Request that uses a Web Worker to perform the rights in safari, i would like to read it.

## weaknesses and drawbacks

because of a [missing
API](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)
in Safari's implementation of the Origin private file system, this storage
mechanism does not currently work in Safari. there appears to be no indication
that they will ever add support for it, but who knows.

perhaps you would find it enjoyable to submit a pull request that uses a
WebWorker to do the writing in Safari?
