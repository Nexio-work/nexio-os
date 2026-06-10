export const shape = {
  none: 0,         // px
  extraSmall: 4,   // xs
  small: 8,        // sm
  medium: 12,      // md
  large: 16,       // lg
  extraLarge: 28,  // xl
  full: 9999,      // pill/circle
} as const;

export type ShapeRadius = keyof typeof shape;
