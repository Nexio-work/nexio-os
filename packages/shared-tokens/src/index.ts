import colors from '../colors.json' with { type: 'json' };
import typography from '../typography.json' with { type: 'json' };
import shape from '../shape.json' with { type: 'json' };
import elevation from '../elevation.json' with { type: 'json' };
import motion from '../motion.json' with { type: 'json' };
import glass from '../glass.json' with { type: 'json' };
import density from '../density.json' with { type: 'json' };

export const Colors = colors as typeof colors;
export const Typography = typography as typeof typography;
export const Shape = shape as typeof shape;
export const Elevation = elevation as typeof elevation;
export const Motion = motion as typeof motion;
export const Glass = glass as typeof glass;
export const Density = density as typeof density;

// Re-export all as default bundle
export const tokens = {
  colors,
  typography,
  shape,
  elevation,
  motion,
  glass,
  density,
} as const;
