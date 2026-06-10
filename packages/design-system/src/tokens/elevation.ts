export interface ElevationLevel {
  shadow: string;
  tonalOpacity: number;
}

export const elevation: Record<number, ElevationLevel> = {
  0: { shadow: 'none', tonalOpacity: 0 },
  1: { shadow: '0 1px 3px 1px rgba(0,0,0,0.08)', tonalOpacity: 0.05 },
  2: { shadow: '0 2px 6px 2px rgba(0,0,0,0.08)', tonalOpacity: 0.08 },
  3: { shadow: '0 4px 12px 4px rgba(0,0,0,0.08)', tonalOpacity: 0.11 },
  4: { shadow: '0 8px 24px 8px rgba(0,0,0,0.10)', tonalOpacity: 0.14 },
  5: { shadow: '0 12px 36px 16px rgba(0,0,0,0.12)', tonalOpacity: 0.18 },
};
