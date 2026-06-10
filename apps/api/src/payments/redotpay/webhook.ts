import type { Env } from '../../types';

export async function handleRedotpayWebhook(req: Request, env: Env): Promise<Response> {
  try {
    const body = await req.text();
    const event = JSON.parse(body);

    if (event.status === 'confirmed' || event.status === 'success') {
      const orderId = event.order_id;
      const metadata = event.metadata || {};

      // Activate tenant + create subscription (same flow as Stripe)
      await env.DB.prepare(
        `INSERT INTO payments (id, tenant_id, source, source_id, amount, currency, status)
         VALUES (?, ?, 'redotpay', ?, ?, 'USD', 'completed')`
      ).bind(crypto.randomUUID(), metadata.tenant_id || '',
        orderId, event.amount || 0).run();

      if (metadata.tenant_id) {
        await env.DB.prepare(
          "UPDATE tenants SET status = 'active' WHERE id = ?"
        ).bind(metadata.tenant_id).run();
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
