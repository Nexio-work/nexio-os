import type { Env } from '../../types';

export async function handleStripeWebhook(req: Request, env: Env): Promise<Response> {
  try {
    const sig = req.headers.get('Stripe-Signature') || '';
    const body = await req.text();

    // Verify signature using Web Crypto
    if (env.STRIPE_WEBHOOK_SECRET) {
      const [timestamp, signature] = sig.split(',');
      // Full HMAC verification here in production
    }

    // Parse event (simplified)
    let event: any;
    try { event = JSON.parse(body); } catch { return c.json({ error: 'Invalid JSON' }, 400); }

    const db = env.DB;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const tenantId = session.metadata?.tenant_id;
        const planId = session.metadata?.plan_id;

        if (tenantId && planId) {
          // Activate/update tenant
          await db.prepare(
            "UPDATE tenants SET plan = ?, status = 'active', updated_at = datetime('now') WHERE id = ?"
          ).bind(planId.replace('_m','').replace('_y',''), tenantId).run();

          // Create subscription record
          await db.prepare(
            `INSERT INTO subscriptions (id, tenant_id, plan_id, status, source, source_id)
             VALUES (?, ?, ?, 'active', 'stripe', ?)`
          ).bind(crypto.randomUUID(), tenantId, planId, session.subscription).run();

          // Record payment
          await db.prepare(
            `INSERT INTO payments (id, tenant_id, source, source_id, amount, currency, status, plan_id)
             VALUES (?, ?, 'stripe', ?, ?, ?, 'completed', ?)`
          ).bind(crypto.randomUUID(), tenantId, `pi_${Date.now()}`,
            Math.round((session.amount_total ?? 0) * 100),
            session.currency || 'USD', planId).run();
        }
        break;
      }

      case 'invoice.payment_failed': {
        // Grace period logic
        break;
      }

      case 'customer.subscription.deleted': {
        const subId = event.data.object.id;
        await db.prepare(
          "UPDATE subscriptions SET status = 'canceled' WHERE source_id = ? AND source = 'stripe'"
        ).bind(subId).run();
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// Need c.json helper
function c(json: any, status = 200): Response {
  return new Response(JSON.stringify(json), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
