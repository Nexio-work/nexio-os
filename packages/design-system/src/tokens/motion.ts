export const easing = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  decelerated: 'cubic-bezier(0, 0, 0, 1)',
  accelerated: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
} as const;

export const duration = {
  short: 150,      // ms
  medium: 300,
  long: 500,
  extraLong: 700,
} as const;

export const motion = { easing, duration } as const;
