import { createContext } from 'svelte';
import type { NexioModule } from '$lib/plugins/types';

export interface TenantContext {
  id: string;
  name: string;
  slug: string;
  plan: string;
  activeModules: string[];
  accentColor: string;
}

const TenantContext = createContext<TenantContext>();

export function createTenantContext(initial: TenantContext) {
  return {
    getContext: () => TenantContext,
    setContext: (ctx: TenantContext) => TenantContext.set(ctx),
    context: initial,
  };
}

export { TenantContext };
