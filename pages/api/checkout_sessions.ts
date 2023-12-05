import { NextApiRequest, NextApiResponse } from "next";

const stripe = require('stripe')('sk_test_51OJt1kKffdXhvHhptwd8JEDaMijwrwI5yFNgoJF8yX6EqLdx9NtKwDjKc0RO7IxqpBs9BeaE2yB5j3NpksBZlkx500GwQLf8Uk');

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  switch (req.method) {
    case "POST":
      try {
        // Create Checkout Sessions from body params.
        const customer = await stripe.customers.create();
        const session = await stripe.checkout.sessions.create({
          ui_mode: 'embedded',
          customer: customer.id,
          // line_items: [{
          //   price_data: {
          //     currency: 'usd',
          //     product_data: {
          //       name: '!4 days free trial',
          //       description: '4 days free trial',
          //     },

          //     unit_amount: 249 * 100,
          //   },

          //   quantity: 1,
          // }],
          custom_text: {
            submit: {
              message: 'If you decide to cancel your trial, you will not be charged. If you choose to keep your plan after the trial, the 2 week period will be considered part of your first Terms Privacy month of service.',
            },
          },
          // phone_number_collection: {
          //   enabled: true,
          // },
          payment_method_options: {
            us_bank_account: {
              verification_method: 'instant',
              financial_connections: {
                permissions: ['payment_method', 'balances'],
              },
            },
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
//subscribe to plan
        const subscription = await stripe.subscriptions.create({
          customer: session.customer,
          items: [{
            price: 'price_1OJyM7KffdXhvHhp2eBTloQj',
          }],
          default_payment_method: session.payment_method,
          expand: ['latest_invoice.payment_intent'],
        });

        console.log(subscription)


        res.send({
          session,
          setupIntent,
          subscription
        });
      } catch (err:any) {
        res.status(err.statusCode || 500).json(err.message);
      }
    default:
      res.setHeader('Allow', req.method || []);
      res.status(405).end('Method Not Allowed');
  }
}