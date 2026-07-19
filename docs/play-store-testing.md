# Play Store Closed Testing

This note records the current Google Play closed testing setup for Alla Vostra.
It is project documentation only; Google Play Console remains the source of
truth for release status, tester counts, and production access.

## Current Setup

- App name: Alla Vostra
- Android package: `com.allavostra.app`
- Track: Closed testing - Alpha
- Release: `1.0.0`
- Version code: `1`
- Uploaded bundle: `dist/alla-vostra-play-test-v1.aab`
- Release date: July 18, 2026
- Store category: Food & Drink
- Tester access method: Google Group
- Tester group: `testers-community@googlegroups.com`
- Feedback email: `martin@prahlproductions.com`
- Public website: `https://allavostra.com`
- Privacy policy: `https://allavostra.com/privacy`

## Tester Flow

Testers do not install from a local APK or emulator by default. They use the
Google Play testing opt-in link, join the test, and then install the Android app
from Google Play on a real Android device.

Basic tester instructions:

1. Open the Play testing link.
2. Tap Become a tester.
3. Install Alla Vostra from Google Play.
4. Keep the app installed and open it during the test period.
5. Send feedback through the configured feedback email or tester platform.

## Timing

Google Play requires at least 12 opted-in testers for at least 14 continuous
days before production access can be requested.

Testers Community uses a 16-day testing cycle as a buffer over Google's minimum.
The extra days help account for delayed opt-ins, inactive testers, timezone
differences, or testers who do not open the app immediately.

## Payment Testing

The current Play closed testing build uses Stripe test mode. Testers should not
use real credit cards.

Use Stripe's standard test card:

```text
4242 4242 4242 4242
```

Use any future expiration date, any CVC, and any ZIP or postal code.

The app has a real checkout flow, but this testing build is configured for test
payments only.

## App Scope

The Play Store AAB contains the Android mobile app built from the `mob/`
project. The separate website and backend are not packaged into the AAB.

Included in the AAB:

- React Native and Expo mobile app code
- Mobile screens, components, configuration, and bundled assets
- Native Android, Expo, and Stripe libraries

Not included in the AAB:

- Hosted website files from `other/`
- Server source from `server/`
- Hosted privacy policy page
- Root website files such as `index.html`

The Android app may call hosted backend services at runtime, but the backend
source code itself is not inside the Play Store bundle.

## Notes For Future Releases

- Keep the submitted AAB associated with its Git commit or build note.
- Increase `versionCode` for every new Play upload.
- Keep closed testing updates separate from production rollout decisions.
- Do not include private tester emails, API keys, Stripe secrets, or Play
  Console credentials in this documentation.
