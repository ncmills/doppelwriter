import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { sql } from "@/lib/db";
import { trackServerEvent } from "@/lib/track";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = sql();
  const [user] = await db`SELECT stripe_customer_id FROM users WHERE id = ${session.user.id}`;

  let customerId = user?.stripe_customer_id;
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: session.user.email,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await db`UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${session.user.id}`;
  }

  if (!process.env.STRIPE_PRO_PRICE_ID) {
    console.error("STRIPE_PRO_PRICE_ID not configured");
    return NextResponse.json({ error: "Checkout not configured" }, { status: 500 });
  }

  try {
    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        { price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/settings?upgraded=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
    });

    trackServerEvent("checkout_started", { plan: "pro" }, session.user.id);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
