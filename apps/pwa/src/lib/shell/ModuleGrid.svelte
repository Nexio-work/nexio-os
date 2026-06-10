<script lang="ts">
  import type { NexioModule } from '$lib/plugins/types';
  import ModuleCard from './ModuleCard.svelte';

  interface Props {
    modules: NexioModule[];
  }

  let { modules }: Props = $props();
</script>

<section class="module-grid grid-auto-fit">
  {#each modules as module (module.id)}
    <ModuleCard {module} />
  {/each}
</section>
