import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_placeholder", {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: "Free",
    monthlyLimit: 5, // hard cap
    personalProfiles: 1,
    allWriters: false,
    customWriterBuilds: false,
    price: 0,
  },
  pro: {
    name: "Pro",
    monthlyLimit: 200, // soft cap — throttled beyond this, not blocked
    personalProfiles: Infinity,
    allWriters: true,
    customWriterBuilds: true,
    price: 19,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
