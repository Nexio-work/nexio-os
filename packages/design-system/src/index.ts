// ═══════════════════════════════════════════════════
// @nexio/design-system — Barrel Export
// ═══════════════════════════════════════════════════

// Tokens
export * from './tokens/color.js';
export * from './tokens/typography.js';
export * from './tokens/elevation.js';
export * from './tokens/shape.js';
export * from './tokens/motion.js';

// Glass
export * from './glass/config.js';
export { default as GlassEffect } from './glass/GlassEffect.svelte';

// Themes (CSS files — import directly)
import './themes/light.css';
import './themes/dark.css';

// Material Web components
export * from './material/register.js';
