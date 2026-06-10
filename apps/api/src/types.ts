// ══════════════════════════════════════════════
// Nexio OS — TypeScript Interfaces matching D1 schema
// ══════════════════════════════════════════════

/** Cloudflare Worker environment bindings */
interface Env {
  DB: D1Database;
  KV: KVNamespace;
  NEXIO_JWT_SECRET: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  WISE_API_KEY?: string;
  REDOTPAY_API_KEY?: string;
  REDOTPAY_WEBHOOK_SECRET?: string;
}

export interface ITenant {
  id: string; name: string; slug: string;
  plan: string; status: string;
  modules: string; config: string;
  owner_email: string | null; max_users: number;
  domain_custom: string | null;
  created_at: string; updated_at: string;
}

export interface IUser {
  id: string; tenant_id: string; email: string;
  name: string | null; password_hash: string;
  role: string; avatar_url: string | null;
  last_login_at: string | null;
  created_at: string; updated_at: string;
}

export interface ISession {
  id: string; user_id: string; tenant_id: string;
  token_hash: string; refresh_token: string | null;
  device_info: string | null; ip_address: string | null;
  expires_at: string; created_at: string;
}

export interface ISubscription {
  id: string; tenant_id: string; plan_id: string;
  status: string; source: string; source_id: string | null;
  current_period_start: string | null; current_period_end: string | null;
  cancel_at: string | null; trial_ends_at: string | null;
  created_at: string; updated_at: string;
}

export interface IPayment {
  id: string; tenant_id: string; source: string;
  source_id: string | null; amount: number; currency: string;
  status: string; plan_id: string | null;
  subscription_id: string | null; metadata: string;
  invoice_number: string | null;
  created_at: string; paid_at: string | null;
}

export interface IContact {
  id: string; tenant_id: string;
  first_name: string | null; last_name: string | null;
  email: string | null; phone: string | null;
  company: string | null; job_title: string | null;
  tags: string; notes: string | null;
  status: string; source: string | null;
  assigned_to: string | null; created_by: string | null;
  created_at: string; updated_at: string;
}

export interface IProject {
  id: string; tenant_id: string; name: string;
  description: string | null; status: string;
  color: string | null; lead: string | null;
  start_date: string | null; due_date: string | null;
  budget: number | null;
  created_at: string; updated_at: string;
}

export interface ITask {
  id: string; project_id: string; tenant_id: string;
  title: string; description: string | null;
  status: string; priority: string;
  assignee_id: string | null; reporter_id: string | null;
  due_date: string | null; completed_at: string | null;
  order_index: number; tags: string;
  created_at: string; updated_at: string;
}

export interface ISyncOp {
  id: string; tenant_id: string; table_name: string;
  action: string; payload: string;
  status: string; error_message: string | null;
  retry_count: number; client_created_at: string;
  synced_at: string | null; created_at: string;
}

export interface IBrainDoc {
  id: string; tenant_id: string; title: string;
  content: string; source_type: string;
  embedding_id: string | null; metadata: string;
  version: number; created_by: string | null;
  created_at: string; updated_at: string;
}

export type { Env };
