<script lang="ts">
  import WidgetRow from '$lib/shell/WidgetRow.svelte';
  import ModuleGrid from '$lib/shell/ModuleGrid.svelte';
  import AIBar from '$lib/shell/AIBar.svelte';
  import { getModulesForPlan } from '$lib/plugins/plugin-registry';

  const modules = $derived(getModulesForPlan('enterprise'));
</script>

<svelte:head>
  <title>Dashboard — Nexio OS</title>
</svelte:head>

<main class="dashboard" style="
  padding: 24px;
  max-width: 1280px;
  margin: 0 auto;
  padding-bottom: 100px;
">
  <!-- Top widgets -->
  <WidgetRow />

  <!-- Module grid (ZimaOS-style) -->
  <h2 style="
    font-size: var(--md-sys-typescale-headline-medium-size, 28px);
    font-weight: 400;
    margin: 32px 0 16px;
    color: var(--md-sys-color-on-surface);
  ">Modules</h2>
  <ModuleGrid modules={modules} />

  <!-- AI Bar fixed at bottom -->
  <AIBar />
</main>
