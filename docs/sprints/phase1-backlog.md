# Nexio OS — Phase 1 MVP Pragmatic Task Backlog

> **Live Tracking Backlog:** Each item is atomic, testable, and reported to Telegram thread `2482`.

---

## 📌 Sprint 1: Shell OS & spatial grammar

- [ ] **[T1.1] M3 Adaptive Sidebar**: Sidebar navigation with compact rail and expanded drawer states (`app/components/layout/Sidebar.tsx`).
- [ ] **[T1.2] Top Bar & Status**: Workspace header with live status dot and active module title (`app/components/layout/Header.tsx`).
- [ ] **[T1.3] Command Palette (Cmd+K)**: Command palette integration using `cmdk` to trigger actions (`app/components/shell/CommandPalette.tsx`).

---

## 📌 Sprint 2: Unified Newsfeed

- [ ] **[T2.1] Feed Actions & Schema**: Drizzle schema and `getFeedItems` action (`actions/feed.ts`).
- [ ] **[T2.2] Feed Card Components**: 4 card types (Nudge, Task, Agent Output with `defineAction` code snippet, Signal) (`app/components/feed/FeedCards.tsx`).

---

## 📌 Sprint 3: Agent Chat & 9Router

- [ ] **[T3.1] Thread State & Actions**: `sendAgentMessage` and `getThreadMessages` actions (`actions/chat.ts`).
- [ ] **[T3.2] Chat UI & 9Router Stream**: Real-time streaming interface consuming 9Router gateway on Tailscale (`app/components/agent/AgentChat.tsx`).

---

## 📌 Sprint 4: Unified Tasks

- [ ] **[T4.1] Task CRUD Actions**: Unified `createTask`, `updateTaskStatus`, `deleteTask` actions (`actions/tasks.ts`).
- [ ] **[T4.2] Task Board UI**: Task list view with checkmarks, filtering, and Data Hub styling (`app/components/tasks/TaskList.tsx`).

---

## 📌 Sprint 5: R2 Files & Hermes Briefing

- [ ] **[T5.1] Files Browser**: `listR2Files` action and file browser component (`actions/files.ts`, `app/components/files/FileBrowser.tsx`).
- [ ] **[T5.2] Hermes Morning Briefing**: Daily briefing action `getMorningBriefing` pushing 3 cards at 7:00 local (`actions/briefing.ts`).
