export type { SyncOperation, CacheEntry } from './database.js';
export type { SyncStoreState } from './sync-store.js';

export interface SyncConfig {
  apiBaseUrl: string;
  pullIntervalMs?: number;
  pushDebounceMs?: number;
  maxRetries?: number;
}

export interface SyncEventCallback {
  type: string;
  data?: unknown;
}
