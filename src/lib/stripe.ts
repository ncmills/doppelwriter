import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      timeout: 30000,
      maxNetworkRetries: 3,
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
