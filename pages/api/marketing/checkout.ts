import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import Stripe from "stripe";
import { runMiddleware } from "../../../helpers/runMiddleware";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
});

const cors = Cors({
  methods: ["POST"],
});

const controller = async (req: NextApiRequest, res: NextApiResponse) => {
  /* Handle cors issue
   * Learn more about this at [nextjs example](https://github.com/vercel/next.js/blob/canary/examples/api-routes-cors/pages/api/cors.ts)
   */
  await runMiddleware(req, res, cors);

  if (req.method === "POST") {
    const { line_items, trial_period_days } = JSON.parse(req.body);
    const trialPeriodDays = parseInt(trial_period_days);
    try {
      const session = await stripe.checkout.sessions.create({
        line_items: line_items,
        mode: "payment",
        /*
         * Do not rely on the redirect to the successUrl for fulfilling
         * purchases, customers may not always reach the success_url after
         * a successful payment.
         * Instead use one of the strategies described in
         * https://stripe.com/docs/payments/checkout/fulfill-orders
         */
        success_url: "http://www.flapjack.co/lander/success",
        cancel_url: "https://www.flapjack.co/lander/1",
        payment_method_types: ["card"],
        subscription_data: {
          trial_period_days: !Number.isNaN(trialPeriodDays)
            ? trialPeriodDays
            : undefined,
        },
      });
      res.status(200).json({
        url: session.url,
        payment_status: session.payment_status,
      });
    } catch (err: any) {
      console.error(err);
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default controller;
