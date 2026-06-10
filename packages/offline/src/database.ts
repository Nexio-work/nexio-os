import Dexie, { type EntityTable } from 'dexie';

export class NexusDB extends Dexie {
  syncQueue!: EntityTable<SyncOperation, 'id'>;
  cacheContacts!: EntityTable<CacheEntry<any>, 'id'>;
  cacheKontiaEntries!: EntityTable<CacheEntry<any>, 'id'>;
  cacheProjects!: EntityTable<CacheEntry<any>, 'id'>;
  cacheTasks!: EntityTable<CacheEntry<any>, 'id'>;
  cacheBrainDocs!: EntityTable<CacheEntry<any>, 'id'>;

  constructor(tenantId: string) {
    super(`nexus_os_${tenantId}`);
    this.version(1).stores({
      syncQueue: '++id, table, action, tenantId, status, createdAt',
      cacheContacts: '++id, tenantId, updatedAt',
      cacheKontiaEntries: '++id, tenantId, date',
      cacheProjects: '++id, tenantId, updatedAt',
      cacheTasks: '++id, tenantId, projectId, updatedAt',
      cacheBrainDocs: '++id, tenantId, sourceType',
    });
  }
}

export interface SyncOperation {
  id?: number;
  table: string;
  action: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  tenantId: string;
  status?: 'pending' | 'synced' | 'error' | 'conflict';
  errorMessage?: string;
  retryCount?: number;
  clientCreatedAt: Date;
  syncedAt?: Date;
}

export interface CacheEntry<T> {
  id?: number;
  data: T;
  tenantId: string;
  updatedAt: Date;
}
