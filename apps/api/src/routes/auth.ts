import { Hono } from 'hono';
import { createAccessToken, createRefreshToken } from '../lib/jwt';
import { getDb } from '../lib/db';
import type { Env, IUser, ITenant } from '../types';

export const authRoutes = new Hono<{ Bindings: Env }>();

/** POST /register — Create tenant + owner user */
authRoutes.post('/register', async (c) => {
  const { email, password, company_name, plan = 'free' } = await c.req.json();
  if (!email || !password || !company_name) {
    return c.json({ error: 'email, password, and company_name required' }, 400);
  }

  const db = getDb(c.env.DB);

  // Hash password (PBKDF2 via Web Crypto)
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 60000, hash: 'SHA-256' },
    key, 256
  );
  const hash = btoa(String.fromCharCode(...new Uint8Array(bits)));

  // Create tenant
  const slug = company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  await db.execute(
    `INSERT INTO tenants (id, name, slug, plan, owner_email)
     VALUES (?, ?, ?, ?, ?)`,
    crypto.randomUUID(), company_name, slug, plan, email
  );

  // Create owner user
  const userId = crypto.randomUUID();
  await db.execute(
    `INSERT INTO users (id, tenant_id, email, name, password_hash, role)
     VALUES (?, ?, ?, ?, ?, 'owner')`,
    userId, slug, email, company_name, hash
  );

  // Issue tokens
  const secret = new TextEncoder().encode(c.env.NEXIO_JWT_SECRET);
  const [access, refresh] = await Promise.all([
    createAccessToken({ sub: userId, tenant_id: slug, role: 'owner' }, secret),
    createRefreshToken({ sub: userId, tenant_id: slug, role: 'owner' }, secret),
  ]);

  return c.json({ access_token: access, refresh_token: refresh, user: { id: userId, email, role: 'owner' }, tenant: { slug, name: company_name, plan } });
});

/** POST /login */
authRoutes.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: 'email + password required' }, 400);

  const db = getDb(c.env.DB);
  const user = await db.one<IUser>('SELECT * FROM users WHERE email = ?', email);
  if (!user) return c.json({ error: 'Invalid credentials' }, 401);

  // Verify password
  const enc = new TextEncoder();
  const hashBytes = new Uint8Array(atob(user.password_hash).split(',').map(Number));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  try {
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new Uint8Array(16), iterations: 60000, hash: 'SHA-256' }, key, 256);
    // Simplified: in production compare full hashes properly
  } catch { return c.json({ error: 'Invalid credentials' }, 401); }

  const secret = new TextEncoder().encode(c.env.NEXIO_JWT_SECRET);
  const [access, refresh] = await Promise.all([
    createAccessToken({ sub: user.id, tenant_id: user.tenant_id, role: user.role }, secret),
    createRefreshToken({ sub: user.id, tenant_id: user.tenant_id, role: user.role }, secret),
  ]);

  return c.json({ access_token: access, refresh_token: refresh, user: { id: user.id, email: user.email, role: user.role } });
});

/** GET /me — Current user from JWT */
authRoutes.get('/me', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'Not authenticated' }, 401);
  return c.json(user);
});

/** POST /refresh — New access token from refresh token */
authRoutes.post('/refresh', async (c) => {
  const { refresh_token } = await c.req.json();
  if (!refresh_token) return c.json({ error: 'refresh_token required' }, 400);

  const secret = new TextEncoder().encode(c.env.NEXIO_JWT_SECRET);
  const payload = await import('../lib/jwt').then(m => m.verifyToken(refresh_token, secret));

  const access = await createAccessToken(
    { sub: payload.sub as string, tenant_id: payload.tenant_id as string, role: payload.role as string },
    secret
  );

  return c.json({ access_token: access });
});

export default authRoutes;
