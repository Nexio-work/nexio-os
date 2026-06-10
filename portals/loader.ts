import fataplus from './fataplus.json' with { type: 'json' };
import nexio from './nexio.json' with { type: 'json' };
import agribot from './agribot.json' with { type: 'json' };
import apollonlab from './apollonlab.json' with { type: 'json' };
import portfolio from './portfolio.json' with { type: 'json' };

const PORTALS = { fataplus, nexio, agribot, apollonlab, portfolio } as const;

export interface NavLink { label: string; href: string; }
export interface Section {
  type: string;
  title?: string;
  content?: string;
  items?: Array<Record<string, string> | { icon?: string; name?: string; title?: string; desc?: string; step?: string; metric?: string; label?: string; topic?: string; category?: string; skills?: string[]; url?: string; plan?: string; price?: string; period?: string; highlight?: boolean }>;
}
export interface SocialLinks { linkedin?: string; github?: string; 'twitter/x'?: string; }
export interface PortalConfig {
  slug: string;
  domain: string;
  title: string;
  tagline: string;
  description: string;
  accentColor: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  ctaText: string;
  ctaUrl: string;
  contactEmail: string;
  navLinks: NavLink[];
  sections: Section[];
  socialLinks: SocialLinks;
  footerText: string;
}

/** Load a portal config by slug */
export async function loadPortal(slug: string): Promise<PortalConfig> {
  const portal = PORTALS[slug as keyof typeof PORTALS];
  if (!portal) throw new Error(`Portal not found: ${slug}`);
  return portal as unknown as PortalConfig;
}

/** List all available portal slugs */
export function listPortals(): string[] {
  return Object.keys(PORTALS);
}

export { PORTALS };
export type { PortalConfig };
