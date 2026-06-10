import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { getDb } from '../lib/db';

const ALLOWED_TABLES = new Set([
  'crm_contacts','kontia_entries','projects','project_tasks',
  'brain_documents'
]);

export const syncRoutes = new Hono<{ Bindings: Env }>();
syncRoutes.use('*', authMiddleware);

/** POST /sync/:table — Receive offline operations batch */
syncRoutes.post('/:table', async (c) => {
  const table = c.req.param('table');
  if (!ALLOWED_TABLES.has(table)) return c.json({ error: 'Invalid table' }, 400);

  const { operations } = await c.req.json() as { operations: any[] };
  if (!operations?.length) return c.json({ results: [] });

  const db = getDb(c.env.DB);
  const tenantId = c.get('user')?.tenant_id;
  const results = [];

  for (const op of operations) {
    try {
      switch (op.action) {
        case 'create':
          await db.execute(`INSERT INTO ${table} (id, tenant_id, ${Object.keys(op.payload).join(',')}) VALUES (?, ?, ${Object.keys(op.payload).map(() => '?').join(',')})`,
            crypto.randomUUID(), tenantId, ...Object.values(op.payload));
          break;
        case 'update':
          await db.execute(`UPDATE ${table} SET ${Object.entries(op.payload).map(([k]) => `${k}=?`).join(',')} WHERE id = ? AND tenant_id = ?`,
            ...Object.values(op.payload), op.id, tenantId);
          break;
        case 'delete':
          await db.execute(`DELETE FROM ${table} WHERE id = ? AND tenant_id = ?`, op.id, tenantId);
          break;
      }
      results.push({ id: op.id, status: 'synced' });
    } catch (err: any) {
      results.push({ id: op.id, status: 'error', message: err.message });
    }
  }

  return c.json({ results, syncedAt: new Date().toISOString() });
});

/** GET /sync/:table/delta?since=ISO — Pull changes since timestamp */
syncRoutes.get('/:table/delta', async (c) => {
  const table = c.req.param('table');
  if (!ALLOWED_TABLES.has(table)) return c.json({ error: 'Invalid table' }, 400);

  const since = c.req.query('since') || '1970-01-01T00:00:00Z';
  const tenantId = c.get('user')?.tenant_id;
  const db = getDb(c.env.DB);

  const rows = await db.many<any>(
    `SELECT * FROM ${table} WHERE tenant_id = ? AND updated_at > ? ORDER BY updated_at ASC LIMIT 500`,
    tenantId, since
  );

  return c.json({ data: rows, count: rows.length, since });
});
