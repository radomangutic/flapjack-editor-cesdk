import { NextApiRequest, NextApiResponse } from "next";

const sec_key = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || "";
const stripe = require("stripe")(sec_key);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "POST":
      try {
        // const data = JSON.parse(req.body);
        // if(!data?.userEmail) throw new Error('No user email found');
        const customer = await stripe.customers.create();
        const session = await stripe.checkout.sessions.create({
          ui_mode: "embedded",
          billing_address_collection: "required",
          customer: customer.id,
          custom_text: {
            submit: {
              message: `If you decide to cancel your trial, you will not be charged. If you choose to keep your plan after the trial, the 2-week period will be considered part of your first month's service.`,
            }
          },
          payment_method_options: {
            us_bank_account: {
              verification_method: "instant",
              financial_connections: {
                permissions: ["payment_method", "balances"],
              },
            },
          },
          consent_collection: {
            terms_of_service: "required"
          },
          payment_method_types: ["card"],
          mode: "setup",
          return_url: `${req.headers.origin}/status?session_id={CHECKOUT_SESSION_ID}`,
        });

        res.send({ clientSecret: session.client_secret });
      } catch (err: any) {
        res.status(err.statusCode || 500).json(err.message);
      }
      break;
    case "GET":
      try {
        const session = await stripe.checkout.sessions.retrieve(
          req.query.session_id
        );
        const setupIntent = await stripe.setupIntents.retrieve(
          session?.setup_intent
        );
        res.send({
          session,
          setupIntent,
        });
      } catch (err: any) {
        res.status(err.statusCode || 500).json(err.message);
      }
      break;
    default:
      console.log("default");
    // res.setHeader('Allow', req.method || []);
    // res.status(405).end('Method Not Allowed');
  }
}