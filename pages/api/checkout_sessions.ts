import { NextApiRequest, NextApiResponse } from "next";

const stripe = require('stripe')('sk_test_51OJt1kKffdXhvHhptwd8JEDaMijwrwI5yFNgoJF8yX6EqLdx9NtKwDjKc0RO7IxqpBs9BeaE2yB5j3NpksBZlkx500GwQLf8Uk');

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  switch (req.method) {
    case "POST":
      try {   
        const data = JSON.parse(req.body);
        if(!data?.userEmail) throw new Error('No user email found');
        const customer = await stripe.customers.create({
          email: data.userEmail,
        });
        const session = await stripe.checkout.sessions.create({
          ui_mode: 'embedded',
          customer: customer.id,
          custom_text: {
            submit: {
              message: 'If you decide to cancel your trial, you will not be charged. If you choose to keep your plan after the trial, the 2 week period will be considered part of your first Terms Privacy month of service.',
            },
            terms_of_service_acceptance: {
              message:  `By accepting, you authorize Flapjack Inc to debit the bank account specified above for any amount owed for charges arising from your use of Flapjack Inc's services and/or purchase of products from Flapjack Inc, pursuant to Flapjack Inc’s website and [terms](https://example.com/terms), until this authorization is revoked. You may amend or cancel this authorization at any time by providing notice to Flapjack Inc with 3 (three) days notice.\nIf you use Flapjack Inc’s services or purchase additional products periodically pursuant to Flapjack Inc’s terms, you authorize Flapjack Inc to debit your bank account periodically. Payments that fall outside of the regular debits authorized above will only be debited after your authorization is obtained.`
            },
           

          },
          payment_method_options: {
            us_bank_account: {
              verification_method: 'instant',
              financial_connections: {
                permissions: ['payment_method', 'balances'],
              },
            },
          },
          consent_collection: {
            terms_of_service: 'required',
          },
        
          payment_method_types: ['us_bank_account'],
          mode: 'setup',
          return_url: `${req.headers.origin}/return?session_id={CHECKOUT_SESSION_ID}`,
        });

        res.send({clientSecret: session.client_secret});
      } catch (err:any) {
        res.status(err.statusCode || 500).json(err.message);
      }
    case "GET":
      try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
        const setupIntent = await stripe.setupIntents.retrieve(session?.setup_intent);
        res.send({
          session,
          setupIntent,
        });
      } catch (err:any) {
        res.status(err.statusCode || 500).json(err.message);
      }
    default:
      res.setHeader('Allow', req.method || []);
      res.status(405).end('Method Not Allowed');
  }
}