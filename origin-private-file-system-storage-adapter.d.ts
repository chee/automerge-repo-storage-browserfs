import type { Chunk, StorageAdapterInterface, StorageKey } from "@automerge/automerge-repo/slim";
export default class OPFSStorageAdapter implements StorageAdapterInterface {
    private directory;
    private cache;
    constructor(name?: string);
    load(storageKey: StorageKey): Promise<Uint8Array | undefined>;
    save(storageKey: StorageKey, data: Uint8Array): Promise<void>;
    remove(storageKey: StorageKey): Promise<void>;
    loadRange(storageKeyPrefix: StorageKey): Promise<Chunk[]>;
    removeRange(storageKeyPrefix: StorageKey): Promise<void>;
}
