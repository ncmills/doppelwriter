import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { sql } from "@/lib/db";
import { trackServerEvent } from "@/lib/track";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let cycle: "monthly" | "annual" = "monthly";
    try {
      const body = await request.json();
      if (body?.cycle === "annual") cycle = "annual";
    } catch {
      // no body — default to monthly
    }

    const priceId =
      cycle === "annual"
        ? process.env.STRIPE_PRO_ANNUAL_PRICE_ID
        : process.env.STRIPE_PRO_PRICE_ID;

    if (!priceId) {
      console.error(`Stripe price not configured for cycle=${cycle}`);
      return NextResponse.json({ error: "Checkout not configured" }, { status: 500 });
    }

    const db = sql();
    const [user] = await db`SELECT stripe_customer_id FROM users WHERE id = ${session.user.id}`;

    let customerId = user?.stripe_customer_id;
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: session.user.email!,
        metadata: { userId: session.user.id },
      });
      customerId = customer.id;
      await db`UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${session.user.id}`;
    }

    const baseUrl = process.env.NEXTAUTH_URL || "https://doppelwriter.com";

    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { site: "dw", cycle },
      success_url: `${baseUrl}/settings?upgraded=true`,
      cancel_url: `${baseUrl}/pricing`,
    });

    trackServerEvent("checkout_started", { plan: "pro", cycle }, session.user.id);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
