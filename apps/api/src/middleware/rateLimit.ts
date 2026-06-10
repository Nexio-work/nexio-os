import { Context, Next } from 'hono';
import type { Env } from '../types';

export async function rateLimitMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next,
  opts: { limit?: number; windowMs?: number } = {}
) {
  const limit = opts.limit || 60;
  const ip = c.req.header('CF-Connecting-IP') || 'unknown';
  const key = `ratelimit:${ip}`;

  try {
    const current = await c.env.KV.get(key);
    const count = parseInt(current || '0', 10);

    if (count >= limit) {
      return c.json(
        { error: 'Too Many Requests', retryAfter: 60 },
        429,
        { 'Retry-After': '60' }
      );
    }

    await c.env.KV.put(key, String(count + 1), { expirationTtl: 60 });
  } catch {
    // KV unavailable — skip rate limiting gracefully
  }

  await next();
}
