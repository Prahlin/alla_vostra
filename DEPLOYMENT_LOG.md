# Alla Vostra Deployment Log

This log records builds, releases, store submissions, deployments, environment changes, and external validation that may not be visible in Git commit messages. Read it before changing a release environment or preparing a new store build.

## Logging Rules

- Add new entries at the top of **Deployment History**.
- Record the target, version/build, environment, status, artifact or submission IDs, source commit, validation performed, and remaining follow-up.
- Record failed builds and superseded deployments when they explain later decisions.
- Name environment variables when useful, but never record secrets, credentials, private keys, tokens, or complete sensitive values.
- Distinguish source changes from out-of-band changes made in EAS, Vercel, Stripe, PayPal, App Store Connect, Google Play Console, or other external systems.
- Use U.S. Eastern time for dates and times unless an external service only supplies UTC.

## Current Deployment Snapshot

Last verified: October 4, 2026

| Target | Version and build | Environment | Current status |
| --- | --- | --- | --- |
| Google Play | `1.0.4` (`versionCode` 5) | Android production | Approved and live; unchanged during the iOS build 4 work |
| Apple App Store | `1.0.4` (build 4) for App Store version 1.0 | EAS `preview`; Stripe sandbox/test configuration | Waiting for App Review |
| EAS Build | Build `8588d740-09c5-4008-b9c5-f10e4d19cb31` | iOS `testflight` profile | Finished successfully |
| EAS Submit | Submission `780661cf-9c04-4b23-88e2-c197f95a1e94` | App Store Connect app `6815443745` | Finished successfully |
| Vercel payment backend | Production deployment | Stripe and PayPal server environment | Redeployed and reachable during iOS QA |

### Store and app identity

- Expo project: `@prahlin1s-team/alla-vostra`
- iOS bundle identifier: `com.allavostra.app`
- Android package: `com.allavostra.app`
- App Store Connect app ID: `6815443745`
- Apple merchant identifier: `merchant.com.allavostra`

### Current operational cautions

- The submitted iOS build 4 uses Stripe sandbox/test configuration. Its Apple Pay tests did not create real charges.
- The Vercel Production Stripe secret was aligned with the Stripe sandbox account used by iOS build 4 QA. Reconfirm backend/account compatibility before rotating payment keys or changing the backend used by the live Android app.
- EAS `preview` must retain the Stripe publishable key, payment-sheet URL, merchant identifier, PayPal create-order URL, and PayPal capture-order URL required by build 4.
- App Store automatic-release behavior was selected during the original version 1.0 preparation. Reconfirm the release setting in App Store Connect before approval if a manual launch is preferred.

## Deployment History

### October 4, 2026 — iOS build 4 submitted for App Review

**Target:** Apple App Store, App Store version 1.0  
**App binary:** `1.0.4` (build 4)  
**Final status:** Waiting for Review  
**Submitted:** Approximately 1:14 AM EDT

#### Source and release contents

- Hid Google Pay on iOS while preserving Google Pay on Android.
- Changed iOS PayPal approval handling to use Expo WebBrowser and recover immediately after approval, cancellation, or browser dismissal.
- Added `expo-web-browser` and incremented only the iOS build number from 3 to 4.
- Preserved `NSCameraUsageDescription`, the Apple Pay entitlement, and `merchant.com.allavostra` in generated iOS configuration.
- Added and corrected the root `.easignore` so EAS receives active source, app icons, and splash assets without uploading historical media or generated native output.
- Current equivalent repository commits are `2588396` and `1db300b`. The successful EAS build metadata recorded the pre-message-rewrite commit `8ef067f`; the deployed source tree is equivalent.

#### External environment changes

- Added `EXPO_PUBLIC_PAYPAL_CREATE_ORDER_URL` and `EXPO_PUBLIC_PAYPAL_CAPTURE_ORDER_URL` to the EAS `preview` environment without storing their values in Git.
- Confirmed EAS loaded those variables together with `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_STRIPE_PAYMENT_SHEET_URL`, and `EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER`.
- Corrected the Vercel Production `STRIPE_SECRET_KEY` account mismatch, redeployed, and confirmed the iOS Stripe sandbox flow could retrieve and complete its PaymentIntent.
- No Android binary was rebuilt, uploaded, or released during this work.

#### EAS build trail

| Build ID | Result | Relevant outcome |
| --- | --- | --- |
| `67febb76-019b-48e7-b648-cdfc8cfaa482` | Failed | Prebuild could not find `assets/store/app-icon.png` because the first root `.easignore` excluded required PNG configuration assets |
| `42728142-d5bf-4aa3-8bdc-eb0200b4029c` | Failed | Metro could not resolve `styles/shopStyles` because unanchored root exclusions also matched mobile source files |
| `8588d740-09c5-4008-b9c5-f10e4d19cb31` | Finished | Produced the signed App Store IPA for `1.0.4` build 4 |

#### App Store submission

- EAS submission ID: `780661cf-9c04-4b23-88e2-c197f95a1e94`
- App Store Connect accepted the upload successfully.
- Build 4 replaced build 2 on App Store version 1.0.
- App Review notes explained that Google Pay is no longer shown on iOS and that canceled or dismissed PayPal checkout immediately returns control to the app.
- App Store Connect confirmed **1 Item Submitted** and changed the version status to **Waiting for Review**.

#### Validation evidence

- Expo Doctor passed all 18 checks.
- A clean iOS prebuild from the exact filtered EAS archive completed successfully.
- Metro exported the audited iOS archive successfully with 1,522 modules and 48 active assets.
- Google Pay absence was visually confirmed on iOS.
- Apple Pay completed successfully on both the iOS simulator and the connected physical iPhone using Stripe sandbox mode.
- PayPal browser cancellation returned the message `PayPal checkout was canceled.`
- Apple Pay remained immediately usable and completed successfully after the PayPal cancellation test.
- No real payment was captured during iOS QA.

#### Follow-up

- Monitor App Store Connect and email for **In Review**, approval, rejection, or a request for information.
- If approved, confirm the configured release behavior and the intended live-payment posture before public availability.
- Preserve the live Google Play binary unless a separately planned Android release requires a new `versionCode`.

### September 23–24, 2026 — Initial iOS TestFlight and App Review submission

**Target:** TestFlight and Apple App Store  
**App binary:** `1.0.4` (builds 1 and 2)

- App Store Connect rejected build 1 during upload for `ITMS-90683` because `NSCameraUsageDescription` was missing.
- Added the camera-purpose description, incremented the iOS build number to 2, and generated a corrected binary.
- Built, submitted, processed, installed, and tested build 2 through TestFlight.
- Verified the Apple Pay entitlement and completed a Stripe sandbox Apple Pay order on the physical iPhone.
- Submitted App Store version 1.0 with build 2 on September 24 after completing screenshots, privacy labels, privacy policy, review notes, pricing, availability, and required metadata.
- Build 2 was later replaced by build 4 for the October 4 resubmission.

### September 17, 2026 — Android 1.0.4 production rollout

**Target:** Google Play  
**App binary:** `1.0.4` (`versionCode` 5)

- Confirmed Google approved the production Google Pay integration for `com.allavostra.app`.
- Uploaded and installed the Play-signed build through internal testing before production promotion.
- Confirmed the native Google Pay flow reached live Stripe authorization; the Wallet card authorization was declined for insufficient funds and no payment was captured.
- Promoted the exact tested version 5 bundle to Production and submitted the full rollout for Google review.
- Google Play later approved and published this version; it remained live and unchanged during the October iOS work.

## New Entry Template

Copy this section to the top of **Deployment History** for future operational changes.

```md
### Month DD, YYYY — Short deployment or release description

**Target:** Service, store, or environment  
**Version/build:** Version, build number, or deployment identifier  
**Status:** Queued, deployed, submitted, live, failed, rolled back, or superseded  
**Time:** Eastern time when relevant

#### Source and artifacts

- Source commit or source-tree reference:
- Build, artifact, deployment, or submission IDs:
- Profiles and named environments used:

#### External changes

- Dashboard, environment-variable, credential, capability, or store-metadata changes:
- Never include secret values.

#### Validation

- Checks performed and devices/environments used:
- Payment mode and whether any real transaction occurred:

#### Follow-up

- Remaining processing, review, rollout, monitoring, rollback, or cleanup work:
```
