<script lang="ts">
  import type { NexioModule } from '$lib/plugins/types';
  import { goto } from '$app/navigation';

  interface Props {
    module: NexioModule;
  }

  let { module }: Props = $props();

  function handleClick() {
    goto(`/app/${module.id}`);
  }
</script>

<button
  class="nexio-card module-card"
  onclick={handleClick}
  style="
    text-align:left;
    padding:24px 16px;
    border:none;
    cursor:pointer;
    width:100%;
    display:flex;flex-direction:column;align-items:center;gap:8px;
    background:var(--md-sys-color-surface);
  "
>
  <!-- Icon circle with module accent -->
  <div style="
    width:56px;height:56px;border-radius:16px;
    display:flex;align-items:center;justify-content:center;
    font-size:28px;
    background:{module.color}15;
  ">📊</div>

  <strong style="
    font-size:15px;font-weight:600;
    color:var(--md-sys-color-on-surface);
  ">{module.name}</strong>

  <span style="
    font-size:12px;color:var(--md-sys-color-on-surface-variant);
    text-align:center;line-height:1.4;
  ">{module.description}</span>

  {#if module.active}
    <span style="
      margin-top:auto;padding:2px 8px;border-radius:8px;
      font-size:11px;font-weight:500;
      background:#10b98115;color:#059669;
    ">✓ Actif</span>
  {:else}
    <span style="
      margin-top:auto;padding:2px 8px;border-radius:8px;
      font-size:11px;font-weight:500;
      background:#f3f4f6;color:#9ca3af;
    ">🔒 Activer</span>
  {/if}
</button>

<style>
  .module-card:hover {
    box-shadow: 0 12px 32px rgba(99,102,241,0.18);
  }
</style>
