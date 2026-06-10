import { Hono } from 'hono';
import { handleStripeWebhook } from '../stripe/webhook';
import { handleRedotpayWebhook } from '../redotpay/webhook';
import type { Env } from '../../types';

export const paymentRouter = new Hono<{ Bindings: Env }>();

/** GET /methods — Available payment methods */
paymentRouter.get('/methods', (c) => c.json({
  methods: [
    { id: 'stripe', name: 'Credit/SEPA Card', fees: '2.9%+$0.30', currencies: ['USD','EUR','MGA'] },
    { id: 'redotpay', name: 'Crypto (USDT/USDC)', fees: '~1%', currencies: ['USDT','USDC'] },
    { id: 'wise', name: 'Bank Transfer', fees: 'variable', currencies: ['USD','EUR','MGA'] },
  ],
}));

/** POST /checkout — Unified checkout entry point */
paymentRouter.post('/checkout', async (c) => {
  const { planId, paymentMethod, tenantId, email } = await c.req.json();

  if (!planId || !paymentMethod || !email) {
    return c.json({ error: 'planId, paymentMethod, and email required' }, 400);
  }

  switch (paymentMethod) {
    case 'stripe': {
      // Create Stripe Checkout Session
      // In production: call Stripe API via fetch()
      const successUrl = `${new URL(c.req.url).origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${new URL(c.req.url).origin}/pricing`;

      // Placeholder — real implementation in stripe/checkout.ts
      return c.json({
        redirectUrl: `https://checkout.stripe.com/c-pay/${planId}`,
        paymentId: `pi_${Date.now()}`,
        provider: 'stripe',
      });
    }
    case 'redotpay': {
      return c.json({
        qrData: `usdt:${tenantId}:${planId}:${Date.now()}`,
        walletAddress: 'Txxxxxxxxxxxxxxxxxxxxx',
        amount: getPlanAmount(planId),
        network: 'TRC-20',
        orderId: `order_${Date.now()}`,
        provider: 'redotpay',
      });
    }
    default:
      return c.json({ error: `Unsupported payment method: ${paymentMethod}` }, 400);
  }
});

/** Webhook endpoints */
paymentRouter.post('/webhook/stripe', async (c) => {
  return handleStripeWebhook(c.req, c.env);
});
paymentRouter.post('/webhook/redotpay', async (c) => {
  return handleRedotpayWebhook(c.req, c.env);
});

/** Helper: plan pricing */
function getPlanAmount(planId: string): number {
  const prices: Record<string, number> = {
    free: 0, starter_m: 1900, starter_y: 19000,
    pro_m: 4900, pro_y: 49000, enterprise_m: 14900, enterprise_y: 149000,
  };
  return prices[planId] ?? 1900;
}
