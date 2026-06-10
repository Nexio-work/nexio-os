import { Context, Next } from 'hono';
import type { Env } from '../types';

/**
 * Tenant resolution from subdomain.
 * Extracts slug from *.nexio.work → looks up tenant in D1.
 * Sets c.set('tenant', ...) for downstream handlers.
 */
export async function tenantMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const host = c.req.header('Host') || '';
  // Extract subdomain: client.nexio.work → "client"
  const match = host.match(/^([a-z0-9-]+)\.nexio\.work/);

  if (match?.[1]) {
    const slug = match[1];
    try {
      const result = await c.env.DB.prepare(
        'SELECT * FROM tenants WHERE slug = ? AND status != ?'
      ).bind(slug, 'deleted').first();

      if (result) {
        c.set('tenant', result);
      }
    } catch (err) {
      console.error('[Tenant] Lookup error:', err);
    }
  }

  // No subdomain = public portal (nexio.work root)
  await next();
}
