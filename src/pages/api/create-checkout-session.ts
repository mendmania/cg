// pages/api/create-checkout-session.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-05-28.basil",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ id?: string; error?: string }>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // You can define multiple “coin packs” here. For this example, we'll create one:
    // e.g. 100 coins for $5.00, 250 coins for $10.00, etc.
    //
    // In a real app, you'd probably look up price IDs from your database or Stripe Dashboard.
    //
    // Here, we hardcode a single “100-coin pack” price ID. Create this product/price in your Stripe Dashboard
    // (Products → New Product → Pricing → “One time price”, then copy its price ID).
    //
    // Let’s assume you created a Price in Stripe with ID "price_1ABCxyZ_100coins" at $5.00.

    const { pack } = req.body as { pack: "100" | "250" };

    // Map “pack” → Stripe Price ID. Replace these IDs with your own.
    const PRICE_MAP: Record<"100" | "250", string> = {
      "100": "price_1RVXwvQTZmcQgzGsuAuKByLp", // $5.00 for 100 coins
      "250": "price_1ABCxyZ_250coins", // $10.00 for 250 coins
    };

    const priceId = PRICE_MAP[pack];
    if (!priceId) {
      return res.status(400).json({ error: "Invalid coin pack" });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.origin}/purchase-success?pack=${pack}`,
      cancel_url: `${req.headers.origin}/purchase-cancelled`,
      metadata: {
        pack,
      },
    });

    return res.status(200).json({ id: session.id });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
