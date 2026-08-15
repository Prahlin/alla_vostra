# Alla Vostra Play Store Launch Checklist

## Current App Identity

- App name: Alla Vostra
- Android package: `com.allavostra.app`
- Version name: `1.0.2`
- Version code: `3`
- Category: Food & Drink
- Payments: physical goods/orders, using Stripe/Google Pay and PayPal
- Current local checkout: `/Users/prahlin/gh/alla_vostra`
- Current EAS owner/project: `@prahlin1s-team/alla-vostra`

The Android package is permanent after the first upload to Google Play. Do not
upload an app bundle until `com.allavostra.app` is definitely the package name
you want forever.

## Current Final Production Candidate

As of August 15, 2026, the final production source candidate is configured as:

- App identity: `Alla Vostra` / `com.allavostra.app`
- Version name: `1.0.2`
- Version code: `3`
- EAS profile: `production`
- EAS environment: `production`
- Artifact type: Android App Bundle (`.aab`)

Before building this candidate, configure the EAS `production` environment with
the required live public app variables listed below. Do not use the local
preview/test `.env` for a public Play release.

## Previous Play Test Upload Candidate

As of July 16, 2026, the developer account is ready to continue with Play
Console setup and the first testing-track upload. Use the existing Play test
bundle unless a new source change requires a fresh build.

- Local AAB: `dist/alla-vostra-play-test-v1.aab`
- SHA-256: `8857a2fa414cebd4dfffcc72f8b71f2f01384ccf9a8d8c753645b8efab24e698`
- EAS build ID: `d557d500-1996-4512-8b72-459fc5f0dd79`
- EAS profile: `playTest`
- EAS environment: `preview`
- EAS artifact URL expires: `2026-08-10T15:01:12Z`
- Build identity: `Alla Vostra` / `com.allavostra.app` / `1.0.0` / version code `1`

Preview EAS environment variables are configured. Production EAS environment
variables are not configured yet, so do not treat this as a production/live
payments upload.

## Before Building For Play

1. Create or sign into the Google Play Console developer account.
2. Create or sign into an Expo/EAS account:

   ```sh
   cd mob
   npx eas-cli login
   npx eas-cli whoami
   ```

3. Confirm production backend is deployed over HTTPS.

   Required mobile app environment:

   ```sh
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   EXPO_PUBLIC_STRIPE_PAYMENT_SHEET_URL=https://your-production-domain/api/payment-sheet
   EXPO_PUBLIC_CONTACT_MESSAGE_URL=https://your-production-domain/api/contact-message
   EXPO_PUBLIC_PAYPAL_CREATE_ORDER_URL=https://your-production-domain/api/paypal-create-order
   EXPO_PUBLIC_PAYPAL_CAPTURE_ORDER_URL=https://your-production-domain/api/paypal-capture-order
   EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER=merchant.com.allavostra
   ```

   Required backend environment:

   ```sh
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   PAYPAL_ENVIRONMENT=live
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   POSTMARK_SERVER_TOKEN=...
   POSTMARK_FROM_EMAIL=orders@your-verified-domain.com
   POSTMARK_REPLY_TO_EMAIL=orders@your-verified-domain.com
   POSTMARK_MESSAGE_STREAM=outbound
   POSTMARK_CONTACT_TO_EMAIL=hello@your-verified-domain.com
   ```

4. Add the public app env vars to EAS:

   ```sh
   cd mob
   npx eas-cli env:set production --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value "pk_live_..." --visibility plaintext --non-interactive
   npx eas-cli env:set production --name EXPO_PUBLIC_STRIPE_PAYMENT_SHEET_URL --value "https://your-production-domain/api/payment-sheet" --visibility plaintext --non-interactive
   npx eas-cli env:set production --name EXPO_PUBLIC_CONTACT_MESSAGE_URL --value "https://your-production-domain/api/contact-message" --visibility plaintext --non-interactive
   npx eas-cli env:set production --name EXPO_PUBLIC_PAYPAL_CREATE_ORDER_URL --value "https://your-production-domain/api/paypal-create-order" --visibility plaintext --non-interactive
   npx eas-cli env:set production --name EXPO_PUBLIC_PAYPAL_CAPTURE_ORDER_URL --value "https://your-production-domain/api/paypal-capture-order" --visibility plaintext --non-interactive
   npx eas-cli env:set production --name EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER --value "merchant.com.allavostra" --visibility plaintext --non-interactive
   ```

## Build The Official Android App Bundle

Use EAS-managed credentials for the first Play upload. When EAS asks about
Android credentials, choose to generate/manage a new keystore unless you already
have a dedicated upload keystore.

EAS uploads from `mob/`. The local `mob/android/` directory is generated build
state and is ignored by `mob/.easignore`; Play-build identity, icons,
permissions, and native plugins should stay in `mob/app.json`.

```sh
cd mob
npx eas-cli build --platform android --profile production
```

The production profile builds an `.aab`, which is the artifact to upload to
Google Play.

For Play Console internal/closed testing with Stripe test-mode payments, use
the `playTest` profile from the repository root instead:

```sh
cd /Users/prahlin/gh/alla_vostra
./build_alla_vostra_android_playstore.sh playTest
```

That profile builds a Play-uploadable `.aab` using the EAS `preview`
environment. The first generated test AAB was downloaded locally to:

```txt
dist/alla-vostra-play-test-v1.aab
```

## Create The Play Console App

1. Open Google Play Console.
2. Create app.
3. Fill:
   - App name: Alla Vostra
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free
4. Confirm developer declarations.

After the app shell is created, start with:

```txt
Test and release > Testing > Internal testing > Create new release
```

Upload `dist/alla-vostra-play-test-v1.aab`, enroll in Play App Signing when
prompted, name the release, and use internal testing to verify the Play-installed
build before starting closed testing.

Suggested internal-test release name:

```txt
Alla Vostra 1.0.0 internal test 1
```

Suggested internal-test release notes:

```txt
Initial Play internal test for Alla Vostra ordering, checkout, contact form, and Android payment validation.
```

## Store Listing Draft

Short description:

```txt
Order handcrafted grazing boards for South Florida celebrations.
```

Full description draft:

```txt
Alla Vostra makes hosting easier with handcrafted grazing boards prepared for celebrations, gifts, office events, client moments, holidays, and relaxed nights with family and friends across South Florida.

Browse curated boards like Piccola, Sei Perfetto, and Buon Natale, each designed for a different gathering size. Choose the board that fits your occasion, review your cart, enter your contact and delivery details, select a delivery time, and place your order securely from the app.

Alla Vostra is built for hosts who want the beauty of a grazing table without the extra planning, shopping, prepping, or last-minute kitchen rush. Whether you are sending a thoughtful food gift, planning a small dinner, setting up a holiday spread, or ordering charcuterie for a South Florida event, the app keeps the process simple from selection to checkout.

App features:

- Handcrafted grazing boards and charcuterie-style selections
- Options sized for intimate gatherings, groups, and festive tables
- Delivery details for Miami-Dade and Broward service areas
- Clear order steps for board selection, cart review, contact info, delivery time, payment, and confirmation
- Secure checkout with card, Google Pay, or PayPal where available
- Easy contact form for questions, business inquiries, and order support

Every order is prepared for effortless entertaining, so you can spend less time arranging the table and more time with the people around it.
```

Store assets prepared in this repo:

- `mob/assets/store/app-icon.png` - 512 x 512
- `mob/assets/store/feature-graphic.png` - 1024 x 500
- Phone screenshots still need to be captured from the production/internal-test build.

## App Content Forms

Complete these in Play Console before release:

- App access: no login required unless that changes.
- Ads: no ads.
- Content rating: food ordering / shopping style app.
- Target audience: adults/general audience. Avoid children-directed settings.
- Data safety: declare contact info, delivery address, phone, email, and order details. Payment data is handled by Stripe/Google Pay/PayPal; do not claim the app collects card numbers directly unless implementation changes.
- Privacy policy: required. Publish a privacy policy URL before store review.
- Payments: this app sells physical food/delivery, so Google Play Billing should not be required.

## Testing Tracks

1. Internal testing:
   - Upload the first `.aab`.
   - Add owner/device testers.
   - Verify launch, checkout, Google Pay, card, PayPal link, contact form, and order emails.

2. Closed testing:
   - Add tester emails or a Google Group.
   - Publish a closed test release.
   - For new personal Play developer accounts, Google requires at least 12 opted-in testers for 14 continuous days before applying for production access.
   - Keep testers opted in continuously; testers who leave and rejoin restart
     their 14-day eligibility window.

3. Production:
   - Bump `versionCode` for each new upload.
   - Upload final `.aab`.
   - Submit for review.
   - Roll out gradually.

## Local Build Tooling

This project needs Java 17 for local Gradle builds. Java 17 is installed at:

```sh
/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
```

Use:

```sh
JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home ./gradlew :app:tasks
```

Do not upload locally generated debug-signed release bundles to Play. Use EAS
production credentials or a real release upload keystore.
