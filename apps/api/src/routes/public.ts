import { Hono } from 'hono';

export const publicRoutes = new Hono();

/** GET /portals/:slug — Return portal config JSON */
publicRoutes.get('/portals/:slug', async (c) => {
  const slug = c.req.param('slug');

  // In production, read from KV or static file. For now, stub.
  const portals: Record<string, any> = {
    fataplus: { slug: 'fataplus', domain: 'fata.plus', title: 'FATAPLUS', accentColor: '#f59e0b' },
    nexio:   { slug: 'nexio', domain: 'nexio.work', title: 'Nexio OS', accentColor: '#6366f1' },
    agribot: { slug: 'agribot', domain: 'agribot.space', title: 'AgriBot', accentColor: '#10b981' },
    apollonlab: { slug: 'apollonlab', domain: 'apollonlab.com', title: 'ApollonLab', accentColor: '#ec4899' },
    portfolio: { slug: 'portfolio', domain: 'fenohery.space', title: 'Fenohery Fanomezanirina', accentColor: '#1a1a2e' },
  };

  const portal = portals[slug];
  if (!portal) return c.json({ error: 'Portal not found' }, 404);

  // Cache for 60s
  c.header('Cache-Control', 'public, max-age=60');
  return c.json(portal);
});
