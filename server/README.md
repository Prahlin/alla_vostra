# Alla Vostra Stripe Server

Tiny Vercel backend for the mobile app checkout.

Routes:

- `GET /api/health`
- `POST /api/payment-sheet`
- `POST /api/paypal-create-order`
- `POST /api/paypal-capture-order`
- `POST /api/stripe-webhook`
- `POST /api/contact-message`

Environment:

```sh
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_ENVIRONMENT=sandbox
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
POSTMARK_SERVER_TOKEN=...
POSTMARK_FROM_EMAIL=orders@your-verified-domain.com
POSTMARK_REPLY_TO_EMAIL=orders@your-verified-domain.com
POSTMARK_MESSAGE_STREAM=outbound
POSTMARK_ORDER_TO_EMAIL=orders@your-verified-domain.com
POSTMARK_CONTACT_TO_EMAIL=hello@your-verified-domain.com
CORS_ALLOWED_ORIGINS=https://allavostra.com,https://www.allavostra.com
```

This backend keeps the Stripe secret key off the phone. The Expo app should point to the deployed payment route with:

```sh
EXPO_PUBLIC_STRIPE_PAYMENT_SHEET_URL=https://your-vercel-project.vercel.app/api/payment-sheet
EXPO_PUBLIC_PAYPAL_CREATE_ORDER_URL=https://your-vercel-project.vercel.app/api/paypal-create-order
EXPO_PUBLIC_PAYPAL_CAPTURE_ORDER_URL=https://your-vercel-project.vercel.app/api/paypal-capture-order
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

The webhook sends the customer a Postmark order confirmation and sends the
business a paid-order notification only after Stripe confirms that the
PaymentIntent succeeded. Set `POSTMARK_ORDER_TO_EMAIL` to the monitored
fulfillment inbox. The app does not send email directly, and the Postmark server
token never goes into the mobile app.

PayPal checkout:

1. Create a PayPal REST app in the PayPal Developer Dashboard.
2. Add the PayPal client ID and client secret to the backend environment.
3. Use `PAYPAL_ENVIRONMENT=sandbox` for sandbox testing and
   `PAYPAL_ENVIRONMENT=live` for real production payments.
4. The mobile app calls `/api/paypal-create-order`, opens the returned PayPal
   approval URL, and then calls `/api/paypal-capture-order` after PayPal
   redirects back to the app.
5. PayPal customer confirmations and business order notifications use the same
   Postmark configuration above.

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
- Tax: 7% total (6% Florida state tax plus 1% Miami-Dade/Broward surtax)

Only Miami-Dade and Broward delivery ZIP codes are accepted. The backend
validates and records the requested delivery month, day, and time with each
payment-provider order. Mobile pricing version 2 uses the 7% total; unversioned
orders from the prior Play release temporarily retain 6% so their displayed and
charged totals remain consistent during rollout.

Public POST routes have per-IP burst limits, and browser CORS access is limited
to Alla Vostra and any comma-separated origins in `CORS_ALLOWED_ORIGINS`.
Because application memory is not shared across Vercel instances, configure a
matching Vercel Firewall rate-limit rule before production traffic is enabled.
