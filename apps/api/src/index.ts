import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoutes } from './routes/auth';
import { tenantRoutes } from './routes/tenants';
import { moduleRoutes } from './routes/modules';
import { syncRoutes } from './routes/sync';
import { publicRoutes } from './routes/public';
import { adminRoutes } from './routes/admin';
import { paymentRouter } from './payments/unified/router';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'DELETE'] }));

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Route groups
app.route('/api/auth', authRoutes);
app.route('/api/tenants', tenantRoutes);
app.route('/api/modules', moduleRoutes);
app.route('/api/sync', syncRoutes);
app.route('/api/portals', publicRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/payments', paymentRouter);

// Global error handler
app.onError((err, c) => {
  console.error('[API Error]', err.message, err.stack);
  const status = (err as any).status || 500;
  return c.json({ error: err.message, status }, status as any);
});

// 404
app.notFound((c) => c.json({ error: 'Not Found', path: c.req.path }, 404));

export default app;
