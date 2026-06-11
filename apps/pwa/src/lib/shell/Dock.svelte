<script lang="ts">
  import type { TenantContext } from '$lib/tenant/context';
  import { moduleAccents } from '@nexio/design-system';

  interface Props {
    ctx: TenantContext;
    collapsed: boolean;
  }

  let { ctx, collapsed }: Props = $props();

  let selectedId = $state<string | null>(null);

  const activeModules = ctx.activeModules.map(id => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    color: (moduleAccents as Record<string, any>)?.[id]?.base ?? '#6366f1',
    icon: '📦',
  }));
</script>

<aside
  class="dock"
  style="
    position:sticky;top:var(--nexio-header-height,56px);
    height:calc(100vh - var(--nexio-header-height, 56px) - var(--nexio-ai-bar-height, 64px));
    width:{collapsed ? 'var(--nexio-dock-collapsed,72px)' : 'var(--nexio-dock-expanded,200px)'};
    background:var(--md-sys-color-surface);
    border-right:1px solid var(--md-sys-color-outline-variant);
    display:flex;flex-direction:column;
    padding:12px 8px;gap:4px;
    transition:width var(--nexio-duration-medium,300ms) var(--nexio-motion-standard);
    overflow-y:auto;flex-shrink:0;z-index:50;
  "
>
  <!-- Collapse toggle -->
  <button
    style="
      width:100%;height:36px;border-radius:10px;
      border:none;background:none;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      font-size:14px;color:var(--md-sys-color-on-surface-variant);
      margin-bottom:8px;
    "
  >{collapsed ? '→' : '←'}</button>

  <!-- Module icons -->
  {#each activeModules as mod}
    <button
      class="dock-item"
      onclick={() => (selectedId = mod.id)}
      style="
        width:100%;height:48px;border-radius:12px;
        border:none;background:none;cursor:pointer;
        display:flex;align-items:center;gap:10px;
        padding:0 10px;font-size:16px;
        color:var(--md-sys-color-on-surface);
        transition:background 0.15s;
        position:relative;
      "
      onmouseenter={(e: Event) => { (e.currentTarget as HTMLElement).style.background = 'var(--md-sys-color-surface-container-low)'; }}
      onmouseleave={(e: Event) => { (e.currentTarget as HTMLElement).style.background = ''; }}
    >
      <!-- Selected indicator -->
      {#if selectedId === mod.id}
        <div style="
          position:absolute;left:0;top:8px;bottom:8px;width:3px;
          border-radius:0 3px 3px 0;background:{mod.color};
        " />
      {/if}

      <span style="font-size:20px;">{mod.icon}</span>
      {#if !collapsed}
        <span style="
          font-size:13px;font-weight:500;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        ">{mod.name}</span>
      {/if}
    </button>
  {/each}
</aside>
