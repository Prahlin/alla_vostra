# Alla Vostra Play Store Launch Checklist

## Current App Identity

- App name: Alla Vostra
- Android package: `com.allavostra.app`
- Version name: `1.0.0`
- Version code: `1`
- Category: Food & Drink
- Payments: physical goods/orders, using Stripe/Google Pay and PayPal

The Android package is permanent after the first upload to Google Play. Do not
upload an app bundle until `com.allavostra.app` is definitely the package name
you want forever.

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
   EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER=merchant.com.allavostra
   ```

   Required backend environment:

   ```sh
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   POSTMARK_SERVER_TOKEN=...
   POSTMARK_FROM_EMAIL=orders@your-verified-domain.com
   POSTMARK_REPLY_TO_EMAIL=orders@your-verified-domain.com
   POSTMARK_MESSAGE_STREAM=outbound
   POSTMARK_CONTACT_TO_EMAIL=hello@your-verified-domain.com
   ```

4. Add the public app env vars to EAS:

   ```sh
   cd mob
   npx eas-cli env:create --environment production --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value "pk_live_..."
   npx eas-cli env:create --environment production --name EXPO_PUBLIC_STRIPE_PAYMENT_SHEET_URL --value "https://your-production-domain/api/payment-sheet"
   npx eas-cli env:create --environment production --name EXPO_PUBLIC_CONTACT_MESSAGE_URL --value "https://your-production-domain/api/contact-message"
   npx eas-cli env:create --environment production --name EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER --value "merchant.com.allavostra"
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

## Create The Play Console App

1. Open Google Play Console.
2. Create app.
3. Fill:
   - App name: Alla Vostra
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free
4. Confirm developer declarations.

## Store Listing Draft

Short description:

```txt
Handcrafted grazing boards delivered across South Florida.
```

Full description draft:

```txt
Alla Vostra makes hosting easier with handcrafted grazing boards delivered for gatherings, gifts, celebrations, and client moments across South Florida.

Choose a board, enter delivery details, and place your order securely from the app. Pay with card, Google Pay, Apple Pay, or PayPal where available.

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
