import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
});
const controller = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { userId } = JSON.parse(req.body)
    try {
      const session = await stripe.checkout.sessions.create({
        client_reference_id: userId,
        line_items: [
          {
            price: process.env.PRODUCT_PRICE_ID,
            quantity: 1,
          },
        ],
        payment_method_types: ["card"],
        mode: "subscription",
        subscription_data: {
          trial_period_days: 14
        },
        success_url: `${req.headers.origin}/success/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/?canceled=true`,
      });
      res.status(200).json({
        url: session.url,
        payment_status: session.payment_status
      });
    } catch (err: any) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default controller;
