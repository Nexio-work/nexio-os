import type { NexioModule } from './types';

/** All available modules in Nexio OS */
export const ALL_MODULES: NexioModule[] = [
  {
    id: 'kontia',
    name: 'Kontia',
    description: 'Compta IA OHADA — Gestion comptable intelligente',
    icon: '📊',
    color: '#3b82f6',
    version: '0.1.0',
    active: true,
    requiredPlan: 'free',
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Gestion contacts & relations clients',
    icon: '👥',
    color: '#10b981',
    version: '0.1.0',
    active: true,
    requiredPlan: 'free',
  },
  {
    id: 'tanala',
    name: 'Tanala',
    description: 'Web Builder — Créez des sites pro en quelques clics',
    icon: '🎨',
    color: '#f59e0b',
    version: '0.1.0',
    active: false,
    requiredPlan: 'starter',
  },
  {
    id: 'agents',
    name: 'Agents',
    description: 'Agents IA & Automations — Automatisez vos workflows',
    icon: '🤖',
    color: '#8b5cf6',
    version: '0.1.0',
    active: false,
    requiredPlan: 'pro',
  },
  {
    id: 'projects',
    name: 'Projets',
    description: 'Gestion de projets & tâches collaboratives',
    icon: '📁',
    color: '#ec4899',
    version: '0.1.0',
    active: false,
    requiredPlan: 'starter',
  },
  {
    id: 'stocks',
    name: 'Stocks',
    description: 'Inventaire & gestion des stocks',
    icon: '📈',
    color: '#06b6d4',
    version: '0.1.0',
    active: false,
    requiredPlan: 'starter',
  },
  {
    id: 'comms',
    name: 'Comms',
    description: 'Mail, SMS & canaux de communication unifiés',
    icon: '✉️',
    color: '#f97316',
    version: '0.1.0',
    active: false,
    requiredPlan: 'starter',
  },
  {
    id: 'insights',
    name: 'Insights',
    description: 'Analytics IA & rapports business intelligents',
    icon: '📊',
    color: '#14b8a6',
    version: '01.0',
    active: false,
    requiredPlan: 'pro',
  },
];

/**
 * Plan hierarchy for module access.
 * Higher plans include all modules from lower plans.
 */
const PLAN_HIERARCHY: Record<string, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

/** Filter modules available for a given plan */
export function getModulesForPlan(plan: string): NexioModule[] {
  const planLevel = PLAN_HIERARCHY[plan] ?? 0;

  return ALL_MODULES.map(mod => ({
    ...mod,
    active: (PLAN_HIERARCHY[mod.requiredPlan] ?? 0) <= planLevel,
  }));
}
