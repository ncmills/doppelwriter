import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { sql } from "@/lib/db";
import { trackServerEvent } from "@/lib/track";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = sql();

  // Idempotency: skip already-processed events
  const [existing] = await db`SELECT 1 FROM stripe_events WHERE event_id = ${event.id}`;
  if (existing) {
    return NextResponse.json({ received: true });
  }
  await db`INSERT INTO stripe_events (event_id) VALUES (${event.id}) ON CONFLICT DO NOTHING`;

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.customer) {
        const result = await db`UPDATE users SET plan = 'pro' WHERE stripe_customer_id = ${session.customer as string} RETURNING id`;
        console.log(`Stripe: checkout completed, upgraded user ${result[0]?.id || "unknown"} to pro`);
        trackServerEvent("subscription_activated", { customerId: session.customer as string }, result[0]?.id);
      }
    }

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      if (sub.customer) {
        const isPaying = sub.status === "active" || sub.status === "trialing";
        const newPlan = isPaying ? "pro" : "free";
        const result = await db`UPDATE users SET plan = ${newPlan} WHERE stripe_customer_id = ${sub.customer as string} RETURNING id`;
        console.log(`Stripe: subscription ${sub.status}, set user ${result[0]?.id || "unknown"} to ${newPlan}`);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      if (sub.customer) {
        const result = await db`UPDATE users SET plan = 'free' WHERE stripe_customer_id = ${sub.customer as string} RETURNING id`;
        console.log(`Stripe: subscription deleted, downgraded user ${result[0]?.id || "unknown"} to free`);
      }
    }
  } catch (err) {
    console.error("Stripe webhook DB error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
