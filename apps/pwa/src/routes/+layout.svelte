<script lang="ts">
  import '@nexio/design-system';
  import { ShellLayout } from '$lib/shell/ShellLayout.svelte';
  import { createTenantContext } from '$lib/tenant/context';

  const ctx = createTenantContext({
    id: 'fataplus',
    name: 'FATAPLUS',
    slug: 'fataplus',
    plan: 'enterprise',
    activeModules: ['kontia','crm','tanala','agents','projects','stocks','comms','insights'],
    accentColor: '#6366f1',
  });

  let darkMode = $state(false);

  function toggleTheme() {
    darkMode = !darkMode;
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }
</script>

<svelte:head>
  <title>Nexio OS</title>
</svelte:head>

<ShellLayout {ctx} {darkMode} onthemechange={toggleTheme}>
  <slot />
</ShellLayout>
