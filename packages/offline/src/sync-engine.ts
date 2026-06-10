import type { NexusDB } from './database';
import type { SyncOperation, CacheEntry } from './database';

interface SyncConfig {
  apiBaseUrl: string;
  pullIntervalMs?: number;   // default 30000
  pushDebounceMs?: number;   // default 1000
  maxRetries?: number;       // default 5
}

const DEFAULT_CONFIG: Required<SyncConfig> = {
  apiBaseUrl: '/api',
  pullIntervalMs: 30_000,
  pushDebounceMs: 1000,
  maxRetries: 5,
};

export class SyncEngine {
  private db: NexusDB;
  private config: Required<SyncConfig>;
  private tenantId: string;

  public isOnline = $state(true);
  public lastSyncAt = $state<Date | null>(null);
  public isSyncing = $state(false);

  constructor(db: NexusDB, config: Partial<SyncConfig>, tenantId: string) {
    this.db = db;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.tenantId = tenantId;
    this.startWatching();
  }

  /** Read from local IDB first, then background-pull delta */
  async read<T>(table: string): Promise<T[]> {
    const cacheMap: Record<string, () => Promise<T[]>> = {
      crm_contacts: () => this.db.cacheContacts.toArray().then(r => r.map(e => e.data as T)),
      kontia_entries: () => this.db.cacheKontiaEntries.toArray().then(r => r.map(e => e.data as T)),
      projects: () => this.db.cacheProjects.toArray().then(r => r.map(e => e.data as T)),
      project_tasks: () => this.db.cacheTasks.toArray().then(r => r.map(e => e.data as T)),
      brain_documents: () => this.db.cacheBrainDocs.toArray().then(r => r.map(e => e.data as T)),
    };

    const reader = cacheMap[table];
    if (!reader) return [];

    const local = await reader();

    // Background pull if online
    if (this.isOnline && this.lastSyncAt) {
      this.pullDelta(table).catch(console.error);
    }

    return local;
  }

  /** Write to IDB immediately + queue for server sync */
  async write(table: string, action: 'create' | 'update' | 'delete', data: Record<string, unknown>): Promise<string> {
    // 1. Apply locally immediately (optimistic update)
    await this.applyLocal(table, action, data);

    // 2. Queue for server sync
    const op: SyncOperation = {
      table,
      action,
      payload: data,
      tenantId: this.tenantId,
      status: 'pending',
      retryCount: 0,
      clientCreatedAt: new Date(),
    };

    const id = await this.db.syncQueue.add(op);

    // 3. Try online push
    if (this.isOnline) {
      this.pushQueue().catch(console.error);
    }

    return String(id);
  }

  /** Push pending operations to server */
  async pushQueue(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const pending = await this.db.syncQueue
        .where('status').equals('pending')
        .toArray();

      if (!pending.length) return;

      // Group by table for batch API calls
      const byTable = new Map<string, SyncOperation[]>();
      for (const op of pending) {
        const list = byTable.get(op.table) || [];
        list.push(op);
        byTable.set(op.table, list);
      }

      for (const [table, ops] of byTable) {
        try {
          const res = await fetch(`${this.config.apiBaseUrl}/sync/${table}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operations: ops.map(o => ({ ...o.payload, _opId: o.id })) }),
          });

          if (res.ok) {
            const results = await res.json() as { results: { id: string; status: string }[] };
            for (const result of results) {
              const op = pending.find(o =>
                typeof (o.payload as any)._opId !== 'undefined'
                ? String((o.payload as any)._opId) === result.id
                : false
              );
              if (op?.id) {
                await this.db.syncQueue.update(op.id, {
                  status: 'synced',
                  syncedAt: new Date(),
                });
              }
            }
          } else {
            // Mark as error with backoff
            for (const op of ops) {
              const retries = (op.retryCount || 0) + 1;
              if (retries >= this.config.maxRetries) {
                await this.db.syncQueue.update(op.id!, { status: 'error', retryCount: retries });
              } else {
                // Keep as pending — will retry next cycle
                await this.db.syncQueue.update(op.id!, { retryCount: retries });
              }
            }
          }
        } catch (err) {
          console.error('[Sync] Push failed for', table, err);
        }
      }

      this.lastSyncAt = new Date();
    } finally {
      this.isSyncing = false;
    }
  }

  /** Pull delta changes from server since last sync */
  async pullDelta(table: string): Promise<void> {
    try {
      const since = this.lastSyncAt?.toISOString() || '1970-01-01T00:00:00Z';
      const res = await fetch(`${this.config.apiBaseUrl}/sync/${table}/delta?since=${since}`);

      if (!res.ok) return;

      const { data } = await res.json() as { data: any[] };
      if (!data?.length) return;

      // Merge into local cache
      for (const row of data) {
        await this.upsertCache(table, row);
      }

      this.lastSyncAt = new Date();
    } catch (err) {
      console.error('[Sync] Pull delta failed:', err);
    }
  }

  /** Start online/offline watchers */
  startWatching(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.pushQueue();
      this.fullSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Periodic health ping
    setInterval(async () => {
      try {
        const res = await fetch(`${this.config.apiBaseUrl}/health`, { method: 'HEAD' });
        this.isOnline = res.ok;
        if (res.ok) this.pushQueue();
      } catch {
        this.isOnline = false;
      }
    }, this.config.pullIntervalMs);
  }

  /** Full sync — push all pending + pull all deltas */
  async fullSync(): Promise<void> {
    await this.pushQueue();
    const tables = ['crm_contacts','kontia_entries','projects','project_tasks','brain_documents'];
    await Promise.all(tables.map(t => this.pullDelta(t)));
  }

  getSyncStatus() {
    return {
      pendingCount: 0, // computed from queue
      isOnline: this.isOnline,
      lastSyncAt: this.lastSyncAt,
    };
  }

  // ── Private helpers ──

  private async applyLocal(table: string, action: string, data: any): Promise<void> {
    switch (action) {
      case 'create':
        await this.upsertCache(table, { ...data, id: data.id || crypto.randomUUID(), updatedAt: new Date() });
        break;
      case 'update':
        await this.upsertCache(table, { ...data, updatedAt: new Date() });
        break;
      case 'delete':
        await this.removeFromCache(table, data.id);
        break;
    }
  }

  private async upsertCache(table: string, data: any): Promise<void> {
    const entry: CacheEntry<any> = { data, tenantId: this.tenantId, updatedAt: new Date() };
    const storeMap: Record<string, (e: CacheEntry<any>) => Promise<number>> = {
      crm_contacts: (e) => this.db.cacheContacts.put(e),
      kontia_entries: (e) => this.db.cacheKontiaEntries.put(e),
      projects: (e) => this.db.cacheProjects.put(e),
      project_tasks: (e) => this.db.cacheTasks.put(e),
      brain_documents: (e) => this.db.cacheBrainDocs.put(e),
    };
    const putter = storeMap[table];
    if (putter) await putter(entry);
  }

  private async removeFromCache(table: string, id: string): Promise<void> {
    const storeMap: Record<string, (id: number) => Promise<void>> = {
      crm_contacts: (id) => this.db.cacheContacts.delete(id),
      kontia_entries: (id) => this.db.cacheKontiaEntries.delete(id),
      projects: (id) => this.db.cacheProjects.delete(id),
      project_tasks: (id) => this.db.cacheTasks.delete(id),
      brain_documents: (id) => this.db.cacheBrainDocs.delete(id),
    };
    // Find by data.id in cache and delete
  }
}
