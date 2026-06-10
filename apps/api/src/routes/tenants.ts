import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { getDb } from '../lib/db';
import type { ITenant } from '../types';

export const tenantRoutes = new Hono<{ Bindings: Env }>();

// Public: check slug availability
tenantRoutes.get('/available', async (c) => {
  const slug = c.req.query('slug');
  if (!slug) return c.json({ error: 'slug query param required' }, 400);

  const db = getDb(c.env.DB);
  const existing = await db.one<{ count: number }>(
    "SELECT COUNT(*) as count FROM tenants WHERE slug = ?", slug
  );
  return c.json({ available: (existing?.count ?? 0) === 0 });
});

// Admin CRUD (requires superadmin)
tenantRoutes.use('*', authMiddleware, async (c, next) => {
  const user = c.get('user');
  if (user?.role !== 'superadmin') return c.json({ error: 'Forbidden' }, 403);
  await next();
});

tenantRoutes.get('/', async (c) => {
  const db = getDb(c.env.DB);
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '20', 10);
  const offset = (page - 1) * limit;

  const tenants = await db.many<ITenant>(
    'SELECT * FROM tenants WHERE status != ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    'deleted', limit, offset
  );
  return c.json({ data: tenants, page, limit });
});

tenantRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const db = getDb(c.env.DB);
  await db.execute(
    'INSERT INTO tenants (id, name, slug, plan, owner_email, config) VALUES (?, ?, ?, ?, ?, ?)',
    crypto.randomUUID(), body.name, body.slug, body.plan || 'free', body.owner_email || null,
    JSON.stringify(body.config || {})
  );
  return c.json({ success: true });
});
