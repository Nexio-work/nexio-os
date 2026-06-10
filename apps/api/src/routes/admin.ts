import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { getDb } from '../lib/db';

export const adminRoutes = new Hono<{ Bindings: Env }>();

// All routes require superadmin
adminRoutes.use('*', authMiddleware, async (c, next) => {
  if (c.get('user')?.role !== 'superadmin') return c.json({ error: 'Forbidden' }, 403);
  await next();
});

/** GET /stats — Platform overview */
adminRoutes.get('/stats', async (c) => {
  const db = getDb(c.env.DB);

  const [tenants, revenue, activeUsers] = await Promise.all([
    db.one<{ count: number }>("SELECT COUNT(*) as count FROM tenants WHERE status = 'active'"),
    db.one<{ total: number }>("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'completed'"),
    db.one<{ count: number }>('SELECT COUNT(*) as count FROM users'),
  ]);

  return c.json({
    activeTenants: tenants?.count ?? 0,
    totalRevenue: revenue?.total ?? 0,
    totalUsers: activeUsers?.count ?? 0,
  });
});

/** GET /tenants — Full list with subscription status */
adminRoutes.get('/tenants', async (c) => {
  const db = getDb(c.env.DB);
  const tenants = await db.many("SELECT t.*, s.status as sub_status FROM tenants t LEFT JOIN subscriptions s ON s.tenant_id = t.id WHERE t.status != 'deleted'");
  return c.json(tenants);
});

/** POST /tenants/:id/suspend */
adminRoutes.post('/tenants/:id/suspend', async (c) => {
  const db = getDb(c.env.DB);
  await db.execute("UPDATE tenants SET status = 'suspended', updated_at = datetime('now') WHERE id = ?", c.req.param('id'));
  return c.json({ success: true });
});

/** POST /tenants/:id/activate */
adminRoutes.post('/tenants/:id/activate', async (c) => {
  const db = getDb(c.env.DB);
  await db.execute("UPDATE tenants SET status = 'active', updated_at = datetime('now') WHERE id = ?", c.req.param('id'));
  return c.json({ success: true });
});
