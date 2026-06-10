// ══════════════════════════════════════════════
// Nexio OS Color Tokens — Single Source of Truth
// Consumed by CSS themes + Svelte components + Flutter (via shared-tokens JSON)
// ══════════════════════════════════════════════

export interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
  error: string;
  warning: string;
  success: string;
}

export interface SurfaceColors {
  background: string;
  surface: string;
  surfaceDim: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
}

export interface ModuleAccent {
  base: string;        // Main color
  container: string;   // Light bg tint
  onBase: string;      // Text/icon on colored bg
}

export const brandColors: ColorPalette = {
  primary: '#6366f1',   // Indigo — Nexio identity
  secondary: '#8b5cf6', // Violet — premium feel
  tertiary: '#a78bfa',  // Light violet
  error: '#ef4444',     // Red — errors/alerts
  warning: '#f59e0b',   // Amber — warnings/caution
  success: '#10b981',   // Green — success/confirmations
};

export const surfaceLight: SurfaceColors = {
  background: '#fef7ff',
  surface: '#ffffff',
  surfaceDim: '#ded8e0',
  surfaceContainerLow: '#fdf0ff',
  surfaceContainer: '#faeeff',
  surfaceContainerHigh: '#f4e3ff',
  surfaceContainerHighest: '#ede9fe',
};

export const surfaceDark: SurfaceColors = {
  background: '#1c1b1f',
  surface: '#211f26',
  surfaceDim: '#1b191c',
  surfaceContainerLow: '#25232b',
  surfaceContainer: '#2b2930',
  surfaceContainerHigh: '#35323a',
  surfaceContainerHighest: '#3f3b45',
};

export const moduleAccents: Record<string, ModuleAccent> = {
  kontia:  { base: '#3b82f6', container: '#dbeafe', onBase: '#ffffff' },
  crm:     { base: '#10b981', container: '#d1fae5', onBase: '#ffffff' },
  tanala:  { base: '#f59e0b', container: '#fef3c7', onBase: '#000000' },
  agents:  { base: '#8b5cf6', container: '#ede9fe', onBase: '#ffffff' },
  projects:{ base: '#ec4899', container: '#fce7f3', onBase: '#ffffff' },
  stocks:  { base: '#06b6d4', container: '#cffafe', onBase: '#000000' },
  comms:   { base: '#f97316', container: '#ffedd5', onBase: '#000000' },
  insights:{ base: '#14b8a6', container: '#ccfbf1', onBase: '#000000' },
};

/** Generate CSS custom properties string for a given theme */
export function cssCustomProperties(
  mode: 'light' | 'dark',
  accent?: ModuleAccent
): string {
  const surfaces = mode === 'light' ? surfaceLight : surfaceDark;
  const lines = [
    `--md-sys-color-primary: ${brandColors.primary};`,
    `--md-sys-color-on-primary: #ffffff;`,
    `--md-sys-color-secondary: ${brandColors.secondary};`,
    `--md-sys-color-error: ${brandColors.error};`,
    `--md-sys-color-background: ${surfaces.background};`,
    `--md-sys-color-surface: ${surfaces.surface};`,
    `--md-sys-color-surface-dim: ${surfaces.surfaceDim};`,
    `--md-sys-color-outline: #79747e;`,
    `--md-sys-color-outline-variant: #cac4d0;`,
    `--md-sys-color-on-surface: ${mode === 'light' ? '#1c1b1f' : '#e6e1e5'};`,
    `--md-sys-color-on-surface-variant: ${mode === 'light' ? '#49454f' : '#c4c7d5'};`,
  ];
  if (accent) {
    lines.push(`--nexio-module-accent: ${accent.base};`);
    lines.push(`--nexio-module-container: ${accent.container};`);
  }
  return lines.join('\n');
}

/** JS object export of all colors */
export const colors = {
  brand: brandColors,
  light: surfaceLight,
  dark: surfaceDark,
  modules: moduleAccents,
} as const;
