# Alla Vostra Stripe Server

Tiny Vercel backend for the mobile app checkout.

Routes:

- `GET /api/health`
- `POST /api/payment-sheet`

Environment:

```sh
STRIPE_SECRET_KEY=sk_test_...
```

This backend keeps the Stripe secret key off the phone. The Expo app should point to the deployed payment route with:

```sh
EXPO_PUBLIC_STRIPE_PAYMENT_SHEET_URL=https://your-vercel-project.vercel.app/api/payment-sheet
```

Prices are calculated here, not trusted from the app:

- Piccola: $55
- Sei Perfetto: $66
- Buon Natale: $77
- Delivery: $10
- Tax: 6%

Only Florida delivery addresses are accepted.
