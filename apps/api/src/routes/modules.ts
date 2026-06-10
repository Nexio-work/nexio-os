import { Hono } from 'hono';

// Module registry (same as frontend for consistency)
const MODULES = [
  { id:'kontia', name:'Kontia', desc:'Compta IA OHADA', icon:'📊', color:'#3b82f6', requiredPlan:'free' },
  { id:'crm', name:'CRM', desc:'Gestion contacts', icon:'👥', color:'#10b981', requiredPlan:'free' },
  { id:'tanala', name:'Tanala', desc:'Web Builder', icon:'🎨', color:'#f59e0b', requiredPlan:'starter' },
  { id:'agents', name:'Agents', desc:'Agents IA', icon:'🤖', color:'#8b5cf6', requiredPlan:'pro' },
  { id:'projects', name:'Projets', desc:'Gestion projets', icon:'📁', color:'#ec4899', requiredPlan:'starter' },
  { id:'stocks', name:'Stocks', desc:'Inventaire', icon:'📈', color:'#06b6d4', requiredPlan:'starter' },
  { id:'comms', name:'Comms', desc:'Communication', icon:'✉️', color:'#f97316', requiredPlan:'starter' },
  { id:'insights', name:'Insights', desc:'Analytics IA', icon:'📊', color:'#14b8a6', requiredPlan:'pro' },
];

export const moduleRoutes = new Hono();

moduleRoutes.get('/', (c) => c.json({ modules: MODULES }));
moduleRoutes.get('/:id', (c) => {
  const mod = MODULES.find(m => m.id === c.req.param('id'));
  return mod ? c.json(mod) : c.json({ error: 'Module not found' }, 404);
});
