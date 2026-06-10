<script lang="ts">
  import type { TenantContext } from '$lib/tenant/context';
  import Dock from './Dock.svelte';

  interface Props {
    ctx: TenantContext;
    darkMode: boolean;
    onthemechange?: () => void;
  }

  let { ctx, darkMode, onthemechange }: Props = $props();

  let dockCollapsed = $state(false);
</script>

<div class="shell-layout">
  <!-- Top App Bar -->
  <header class="app-bar" style="
    position: sticky; top: 0; z-index: 100;
    height: var(--nexio-header-height, 56px);
    display: flex; align-items: center;
    padding: 0 16px;
    background: var(--md-sys-color-surface);
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
    gap: 12px;
  ">
    <!-- Hamburger / Dock toggle -->
    <button
      class="icon-btn"
      onclick={() => (dockCollapsed = !dockCollapsed)}
      aria-label="Toggle sidebar"
      style="
        width:40px;height:40px;border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        border:none;background:none;cursor:pointer;
        font-size:20px;color:var(--md-sys-color-on-surface);
      "
    >☰</button>

    <!-- Logo -->
    <h1 style="
      font-size:18px;font-weight:700;
      color:var(--md-sys-color-primary);
      letter-spacing:-0.5px;margin:0;
    ">NEXIO OS</h1>

    <!-- Spacer -->
    <div style="flex:1" />

    <!-- Tenant selector -->
    <div style="
      padding:6px 12px;border-radius:20px;
      background:var(--md-sys-color-surface-container-low);
      font-size:13px;font-weight:500;
      color:var(--md-sys-color-on-surface-variant);
      cursor:pointer;display:flex;align-items:center;gap:4px;
    ">
      🏢 {ctx.name}
      <span style="font-size:10px">▾</span>
    </div>

    <!-- Actions -->
    <button class="icon-btn" aria-label="Notifications" style="
      width:40px;height:40px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      border:none;background:none;cursor:pointer;
      font-size:18px;
    ">🔔</button>

    <button class="icon-btn" aria-label="Settings" style="
      width:40px;height:40px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      border:none;background:none;cursor:pointer;
      font-size:18px;
    ">⚙️</button>

    <!-- Dark mode toggle -->
    <button class="icon-btn" onclick={onthemechange} aria-label="Toggle theme" style="
      width:40px;height:40px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      border:none;background:none;cursor:pointer;
      font-size:18px;
    ">{darkMode ? '🌙' : '☀️'}</button>
  </header>

  <!-- Body: Dock + Content -->
  <div class="shell-body" style="display:flex">
    <!-- Collapsible Dock -->
    <Dock {ctx} collapsed={dockCollapsed} />

    <!-- Main content area -->
    <main class="shell-main" style="
      flex:1; min-width:0;
      padding: var(--nexio-grid-gap, 16px);
    ">
      {@render children?.()}
    </main>
  </div>
</div>

<style>
  .shell-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
