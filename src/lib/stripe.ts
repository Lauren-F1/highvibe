import "server-only";
import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
    stripeInstance = new Stripe(key, { typescript: true });
  }
  return stripeInstance;
}

/** Maps role + plan to the corresponding Stripe Price ID from env vars. */
export function getPriceId(role: "guide" | "host" | "vendor", planKey: "starter" | "pro"): string {
  const map: Record<string, string | undefined> = {
    guide_starter: process.env.STRIPE_PRICE_GUIDE_STARTER,
    guide_pro: process.env.STRIPE_PRICE_GUIDE_PRO,
    host_starter: process.env.STRIPE_PRICE_HOST_STARTER,
    host_pro: process.env.STRIPE_PRICE_HOST_PRO,
    vendor_starter: process.env.STRIPE_PRICE_VENDOR_STARTER,
    vendor_pro: process.env.STRIPE_PRICE_VENDOR_PRO,
  };
  const priceId = map[`${role}_${planKey}`];
  if (!priceId) throw new Error(`No Stripe Price ID configured for ${role} ${planKey}`);
  return priceId;
}
