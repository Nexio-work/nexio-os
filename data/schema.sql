-- ═══════════════════════════════════════════════════════
-- Nexio OS — Multi-Tenant D1 Database Schema v0.1.0
-- Cloudflare D1 (SQLite-compatible)
-- Every data table has tenant_id for multi-tenant isolation
-- ═══════════════════════════════════════════════════════

-- ────────────────────────────────────────────────
-- TENANTS: Organization/Company workspaces
-- Each tenant = isolated subdomain (slug.nexio.work)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,       -- URL subdomain: slug.nexio.work
    plan            TEXT NOT NULL DEFAULT 'free', -- free|starter|pro|enterprise
    status          TEXT NOT NULL DEFAULT 'active', -- active|suspended|trial|deleted
    modules         TEXT DEFAULT '[]',          -- JSON array of active module IDs
    config          TEXT DEFAULT '{}',          -- JSON: custom config per tenant
    owner_email     TEXT,
    max_users       INTEGER DEFAULT 1,
    domain_custom   TEXT,                       -- Whitelabel custom domain (Enterprise)
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);

-- ────────────────────────────────────────────────
-- USERS: User accounts (belong to a tenant)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              TEXT PRIMARY KEY,
    tenant_id       TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email           TEXT NOT NULL,
    name            TEXT,
    password_hash   TEXT NOT NULL,               -- PBKDF2-HMAC-SHA256 (Web Crypto)
    role            TEXT NOT NULL DEFAULT 'user', -- owner|admin|user|viewer
    avatar_url      TEXT,
    last_login_at   TEXT,
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now')),
    UNIQUE(tenant_id, email)
);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

-- ────────────────────────────────────────────────
-- SESSIONS: Active JWT sessions / device tokens
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id       TEXT NOT NULL,
    token_hash      TEXT NOT NULL UNIQUE,        -- Hashed session token for lookup
    refresh_token   TEXT UNIQUE,
    device_info     TEXT,                        -- UA string + IP
    ip_address      TEXT,
    expires_at      TEXT NOT NULL,
    created_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expiry ON sessions(expires_at);

-- ────────────────────────────────────────────────
-- SUBSCRIPTIONS: Active paid subscriptions per tenant
-- Source: stripe (recurring), wise (manual), redotpay (crypto)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
    id                  TEXT PRIMARY KEY,
    tenant_id           TEXT NOT NULL REFERENCES tenants(id),
    plan_id             TEXT NOT NULL,
    status              TEXT NOT NULL DEFAULT 'active', -- active|past_due|canceled|paused
    source              TEXT NOT NULL,                   -- stripe|wise|redotpay|manual
    source_id           TEXT UNIQUE,                     -- External ID (Stripe sub_xxx etc.)
    current_period_start TEXT,
    current_period_end   TEXT,
    cancel_at           TEXT,                             -- Scheduled cancellation date
    trial_ends_at        TEXT,
    created_at           TEXT DEFAULT (datetime('now')),
    updated_at           TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_subs_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subs_status ON subscriptions(status);

-- ────────────────────────────────────────────────
-- PAYMENTS: Unified payment ledger (all sources)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
    id              TEXT PRIMARY KEY,
    tenant_id       TEXT NOT NULL REFERENCES tenants(id),
    source          TEXT NOT NULL CHECK(source IN ('stripe','wise','redotpay','manual')),
    source_id       TEXT UNIQUE,                    -- External payment ID (prevent duplicates)
    amount          INTEGER NOT NULL,                -- Amount in SMALLEST UNIT (cents)
    currency        TEXT NOT NULL DEFAULT 'USD',
    status          TEXT NOT NULL DEFAULT 'pending', -- pending|completed|failed|refunded
    plan_id         TEXT,                            -- Which plan/product was purchased
    subscription_id TEXT REFERENCES subscriptions(id),
    metadata        TEXT DEFAULT '{}',
    invoice_number  TEXT,
    created_at      TEXT DEFAULT (datetime('now')),
    paid_at         TEXT
);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_source ON payments(source, source_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ────────────────────────────────────────────────
-- CRM_CONTACTS: Contact management module
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_contacts (
    id              TEXT PRIMARY KEY,
    tenant_id       TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    first_name      TEXT,
    last_name       TEXT,
    email           TEXT,
    phone           TEXT,
    company         TEXT,
    job_title       TEXT,
    tags            TEXT DEFAULT '[]',             -- JSON array of tag strings
    notes           TEXT,
    status          TEXT DEFAULT 'active',          -- active|lead|customer|churned
    source          TEXT,                           -- Where contact came from
    assigned_to     TEXT REFERENCES users(id),
    created_by      TEXT REFERENCES users(id),
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_crm_tenant ON crm_contacts(tenant_id);
CREATE INDEX idx_crm_email ON crm_contacts(email);
CREATE INDEX idx_crm_company ON crm_contacts(company);
CREATE INDEX idx_crm_tags ON crm_contacts(tenant_id, status);

-- ────────────────────────────────────────────────
-- KONTIA_ENTRIES: Accounting entries (OHADA PCG2005)
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kontia_entries (
    id              TEXT PRIMARY KEY,
    tenant_id       TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    date            TEXT NOT NULL,                   -- YYYY-MM-DD accounting date
    account_number  TEXT NOT NULL,                   -- PCG2005 account code (e.g., "512100")
    label           TEXT NOT NULL,                   -- Entry description
    debit           REAL DEFAULT 0,                 -- Débit amount (in MGA or tenant currency)
    credit          REAL DEFAULT 0,                  -- Crédit amount
    reference       TEXT,                            -- Invoice/ref number
    document_type   TEXT,                            -- invoice|payment|adjustment|opening|closing
    fiscal_year     TEXT,                             -- e.g., "2025"
    period          INTEGER,                          -- 1-12 month
    created_by      TEXT REFERENCES users(id),
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_kontia_tenant ON kontia_entries(tenant_id);
CREATE INDEX idx_kontia_date ON kontia_entries(tenant_id, date);
CREATE INDEX idx_kontia_account ON kontia_entries(tenant_id, account_number);
CREATE INDEX idx_kontia_period ON kontia_entries(tenant_id, fiscal_year, period);

-- ────────────────────────────────────────────────
-- PROJECTS: Project management module
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    id              TEXT PRIMARY KEY,
    tenant_id       TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    status          TEXT DEFAULT 'active',          -- active|completed|archived|on_hold
    color           TEXT,                            -- Hex color for project card
    lead            TEXT REFERENCES users(id),
    start_date      TEXT,
    due_date        TEXT,
    budget          REAL,
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_projects_tenant ON projects(tenant_id);
CREATE INDEX idx_projects_status ON projects(tenant_id, status);

-- ────────────────────────────────────────────────
-- PROJECT_TASKS: Tasks within projects
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_tasks (
    id              TEXT PRIMARY KEY,
    project_id      TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tenant_id       TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    status          TEXT DEFAULT 'todo',            -- todo|in_progress|done|cancelled
    priority        TEXT DEFAULT 'medium',         -- low|medium|high|urgent
    assignee_id     TEXT REFERENCES users(id),
    reporter_id     TEXT REFERENCES users(id),
    due_date        TEXT,
    completed_at    TEXT,
    order_index     REAL DEFAULT 0,                -- For drag-drop ordering
    tags            TEXT DEFAULT '[]',
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_tasks_assignee ON project_tasks(assignee_id);
CREATE INDEX idx_tasks_status ON project_tasks(project_id, status);

-- ────────────────────────────────────────────────
-- SYNC_QUEUE: Offline-first sync operation queue
-- Client writes here when offline, server reads on reconnect
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sync_queue (
    id              TEXT PRIMARY KEY,
    tenant_id       TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    table_name      TEXT NOT NULL,                    -- Target table name
    action          TEXT NOT NULL CHECK(action IN ('create','update','delete')),
    payload         TEXT NOT NULL,                    -- JSON row data
    status          TEXT DEFAULT 'pending',           -- pending|synced|error|conflict
    error_message   TEXT,
    retry_count     INTEGER DEFAULT 0,
    client_created_at TEXT NOT NULL,                  -- Timestamp from client
    synced_at       TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_sync_tenant ON sync_queue(tenant_id);
CREATE INDEX idx_sync_status ON sync_queue(status);
CREATE INDEX idx_sync_table ON sync_queue(table_name);

-- ────────────────────────────────────────────────
-- BRAIN_DOCUMENTS: Company Brain knowledge base (per tenant)
-- RAG-ready document storage for AI context
-- ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brain_documents (
    id              TEXT PRIMARY KEY,
    tenant_id       TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    content         TEXT NOT NULL,                    -- Document text content (for embeddings)
    source_type     TEXT NOT NULL,                    -- sop|document|email|transcript|manual|note
    embedding_id    TEXT,                              -- Vector DB reference (external)
    metadata        TEXT DEFAULT '{}',                -- JSON: author, tags, url, version
    version         INTEGER DEFAULT 1,
    created_by      TEXT REFERENCES users(id),
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_brain_tenant ON brain_documents(tenant_id);
CREATE INDEX idx_brain_type ON brain_documents(source_type);
CREATE INDEX idx_brain_search ON brain_documents(tenant_id, title);

-- ═══════════════════════════════════════════════════════
-- END OF SCHEMA — Version 0.1.0
-- Tables: 11 | Relations: Multi-tenant with FK isolation
-- ═══════════════════════════════════════════════════════
