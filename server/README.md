# Alla Vostra Stripe Server

Tiny Vercel backend for the mobile app checkout.

Routes:

- `GET /api/health`
- `POST /api/payment-sheet`
- `POST /api/stripe-webhook`
- `POST /api/contact-message`

Environment:

```sh
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
POSTMARK_SERVER_TOKEN=...
POSTMARK_FROM_EMAIL=orders@your-verified-domain.com
POSTMARK_REPLY_TO_EMAIL=orders@your-verified-domain.com
POSTMARK_MESSAGE_STREAM=outbound
POSTMARK_CONTACT_TO_EMAIL=hello@your-verified-domain.com
```

This backend keeps the Stripe secret key off the phone. The Expo app should point to the deployed payment route with:

```sh
EXPO_PUBLIC_STRIPE_PAYMENT_SHEET_URL=https://your-vercel-project.vercel.app/api/payment-sheet
```

Confirmation emails:

1. Verify the sending address or domain in Postmark.
2. Add the Postmark environment variables above to Vercel.
3. Add a Stripe webhook endpoint in the Stripe Dashboard:

```txt
https://your-vercel-project.vercel.app/api/stripe-webhook
```

4. Subscribe that webhook to:

```txt
payment_intent.succeeded
```

5. Copy the webhook signing secret from Stripe into `STRIPE_WEBHOOK_SECRET`.

The webhook sends the customer a Postmark order confirmation only after Stripe
confirms that the PaymentIntent succeeded. The app does not send email directly,
and the Postmark server token never goes into the mobile app.

Contact form messages:

The mobile Contact screen sends customer messages to:

```txt
https://your-vercel-project.vercel.app/api/contact-message
```

Postmark sends those messages to `POSTMARK_CONTACT_TO_EMAIL`. If that variable is
not set, the route falls back to `POSTMARK_REPLY_TO_EMAIL`, then
`POSTMARK_FROM_EMAIL`. The customer's email is used as the Postmark `ReplyTo`
value so replies can go back to the person who submitted the form.

Prices are calculated here, not trusted from the app:

- Piccola: $55
- Sei Perfetto: $66
- Buon Natale: $77
- Delivery: $10
- Tax: 6%

Only Florida delivery addresses are accepted.
