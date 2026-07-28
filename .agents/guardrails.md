# Agent Code Generation Guardrails & Skeletons

> **BIFURCATION LAW:** These guardrails ensure that **ANY** LLM (including fast/lighter models) generates 100% working, type-safe, anti-slop code on the first attempt without guesswork.

---

## 1. Action Skeleton (`src/actions/<domain>.ts`)

Every unified action MUST use `@agent-native/core`'s `defineAction` and Zod schema validation:

```typescript
import { defineAction } from "@agent-native/core";
import { z } from "zod";

export const createItem = defineAction({
  id: "createItem",
  description: "Create a new item in the workspace",
  schema: z.object({
    title: z.string().min(1, "Title is required"),
    category: z.enum(["task", "nudge", "signal", "agent"]),
  }),
  async handler({ title, category }) {
    // 1. Logic / DB operation
    const id = `item_${Date.now()}`;
    return {
      success: true,
      data: { id, title, category, createdAt: new Date().toISOString() },
    };
  },
});
```

---

## 2. Component Guardrails (`app/components/<domain>/<Component>.tsx`)

Every React component MUST strictly obey the Data Hub tokens and 0px border-radius rule:

```tsx
import React from "react";

interface ComponentProps {
  title: string;
  badgeText?: string;
  onAction?: () => void;
}

export const ComponentCard: React.FC<ComponentProps> = ({
  title,
  badgeText,
  onAction,
}) => {
  return (
    <div className="bg-surface border border-line p-4 text-ink flex flex-col gap-2 rounded-none">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-normal text-ink">{title}</h3>
        {badgeText && (
          <span className="font-mono text-xs text-accent uppercase tracking-wider bg-accent-soft px-2 py-0.5 rounded-none">
            {badgeText}
          </span>
        )}
      </div>
      <button
        onClick={onAction}
        className="self-start bg-ink text-surface font-mono text-xs px-3 py-1 hover:opacity-90 rounded-none transition-opacity"
      >
        Execute Action
      </button>
    </div>
  );
};
```

---

## 3. Strict Rules for All Agents (Foolproof Checklist)

1. **NO Hardcoded Pixels or Arbitrary Gradients**:
   - Use CSS variables (`var(--bg)`, `var(--surface)`, `var(--ink)`, `var(--line)`, `var(--accent)`).
   - NEVER use soft purple-blue gradients or rounded pill buttons.
2. **NO Implicit Any**:
   - Explicit TypeScript types for all props, handler parameters, and state variables.
3. **Self-Correction Verification Protocol**:
   - After generating or editing code, ALWAYS run:
     `pnpm lint && pnpm typecheck && pnpm format:check && pnpm test`
   - If any command fails, fix the root cause immediately before committing.
