export interface GlassConfig {
  blur: number;           // Gaussian blur radius
  scale: number;          // Displacement scale (0-1)
  depth: number;          // Z-depth offset
  gaussianBlur: number;   // Pre-blur for displacement map
  chromaticAberration: number; // RGB split intensity
  specularAngle: number;   // Specular highlight angle
  edgeHighlight: number;   // Edge brightness boost
  glow: number;            // Ambient glow opacity
  inlay: number;           // Inlay refraction strength
  quadrantSymmetry: boolean; // Use quadrant rendering (perf opt)
}

export const defaultGlassConfig: GlassConfig = {
  blur: 40,
  scale: 0.10,
  depth: 0,
  gaussianBlur: 40,
  chromaticAberration: 0.15,
  specularAngle: 45,
  edgeHighlight: 0.20,
  glow: 0.08,
  inlay: 1.00,
  quadrantSymmetry: true,
};
