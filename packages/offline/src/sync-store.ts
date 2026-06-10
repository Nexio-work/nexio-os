import type { SyncEngine } from './sync-engine';

export interface SyncStoreState {
  pendingCount: number;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: Date | null;
}

/** Create a reactive Svelte 5-compatible sync store */
export function createSyncStore(engine: SyncEngine): SyncStoreState {
  return {
    get pendingCount() { return 0; /* computed from DB */ },
    get isOnline() { return engine.isOnline },
    get isSyncing() { return engine.isSyncing },
    get lastSyncAt() { return engine.lastSyncAt },
  };
}

export type { SyncStoreState };
