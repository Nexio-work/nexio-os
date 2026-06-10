<script lang="ts">
  /**
   * GlassEffect — Aave Glass refraction component
   * Uses SVG feDisplacementMap for cross-browser real refraction.
   * NOT backdrop-filter CSS — this is actual light displacement.
   */
  import type { GlassConfig } from './config.js';
  import { defaultGlassConfig } from './config.js';

  interface Props {
    lensW?: number;
    lensH?: number;
    borderRadius?: number;
    x?: number;        // position 0-1
    y?: number;        // position 0-1
    strength?: number;
    config?: Partial<GlassConfig>;
  }

  let {
    lensW = 200,
    lensH = 200,
    borderRadius = 20,
    x = 0.5,
    y = 0.5,
    strength = 0.1,
    config = {},
  }: Props = $props();

  const cfg: GlassConfig = { ...defaultGlassConfig, ...config };
  const filterId = `glass-filter-${Math.random().toString(36).slice(2, 8)}`;
</script>

<div class="glass-container" style="--glass-br:{borderRadius}px;">
  <!-- SVG filter definition (hidden) -->
  <svg class="glass-svg" aria-hidden="true" style={`
    width:${lensW}px;height:${lensH}px;
    position:absolute;top:0;left:0;pointer-events:none;z-index:0;
  `}>
    <defs>
      <filter id={filterId} filterUnits="userSpaceOnUse"
        width="100%" height="100%" x="0" y="0">
        <!-- Generate displacement map with noise pattern -->
        <feTurbulence type="fractalNoise" baseFrequency="0.02"
          numOctaves="3" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise"
          scale={strength * cfg.scale * 100}
          xChannelSelector="R" yChannelSelector="G" />
        <!-- Chromatic aberration: slight RGB shift at edges -->
        <feOffset dx={cfg.chromaticAberration * 2} dy="0" result="red-shift" />
        <feOffset dx={-cfg.chromaticAberration * 2} dy="0" result="blue-shift" />
        <!-- Specular highlight -->
        <feSpecularLighting surfaceScale={cfg.specularAngle}
          specularConstant={cfg.edgeHighlight}
          specularExponent="20" lighting-color="#ffffff"
          result="specular">
          <fePointLight x={x * lensW} y={y * lensH} z="100" />
        </feSpecularLighting>
        <feComposite in="specular" in2="SourceGraphic"
          operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
      </filter>
    </defs>
  </svg>

  <!-- Content slot gets filtered -->
  <div class="glass-content" style={`filter:url(#${filterId});`}>
    {@render children?.()}
  </div>

  <!-- Glow overlay -->
  <div class="glass-glow" style={`opacity:${cfg.glow};`} />
</div>

<style>
  .glass-container {
    position: relative;
    overflow: hidden;
    border-radius: var(--glass-br, 20px);
    isolation: isolate;
  }
  .glass-content {
    position: relative;
    z-index: 1;
    border-radius: inherit;
  }
  .glass-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at center,
      rgba(99, 102, 241, 0.15),
      transparent 70%
    );
    pointer-events: none;
    z-index: 2;
    border-radius: inherit;
  }
</style>
