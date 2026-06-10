import { Context, Next } from 'hono';
import { jwtVerify } from 'jose';
import type { Env } from '../types';

interface AuthOptions { optional?: boolean; roles?: string[]; }

export async function authMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next,
  options: AuthOptions = {}
) {
  const authHeader = c.req.header('Authorization') || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    if (options.optional) return next();
    return c.json({ error: 'Unauthorized — no token provided' }, 401);
  }

  try {
    const secret = new TextEncoder().encode(c.env.NEXIO_JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Attach user context
    c.set('user', {
      id: payload.sub as string,
      tenant_id: payload.tenant_id as string,
      role: payload.role as string,
    });

    // Role check
    if (options.roles && !options.roles.includes(payload.role as string)) {
      return c.json({ error: 'Forbidden — insufficient permissions' }, 403);
    }

    await next();
  } catch (err) {
    if (options.optional) return next();
    return c.json({ error: 'Unauthorized — invalid or expired token' }, 401);
  }
}
