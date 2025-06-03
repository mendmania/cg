// pages/api/create-payment-intent.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY as string,
  { apiVersion: "2025-05-28.basil" }
);

type Data =
  | { clientSecret: string }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { amount } = req.body as { amount: number };
    if (!amount || typeof amount !== "number") {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Create a PaymentIntent on the server
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // in cents
      currency: "usd",
      // You could pass metadata here (e.g. userId, pack type, etc.)
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret! });
  } catch (err: any) {
    console.error("Error in create-payment-intent:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
