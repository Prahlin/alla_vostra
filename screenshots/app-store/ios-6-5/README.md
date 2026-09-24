# App Store iPhone 6.5-inch screenshots

Final upload-ready PNGs are in `final/`.
Flattened JPEG copies are in `final-jpeg/` and are the safer upload choice because
they do not carry PNG alpha metadata.

Recommended upload order:
1. `01-home-1284x2778.jpg`
2. `02-piccola-overlay-1284x2778.jpg`
3. `03-product-board-1284x2778.jpg`
4. `04-order-confirmation-1284x2778.jpg`
5. `05-about-us-1284x2778.jpg`

These files are sized to the App Store Connect iPhone 6.5-inch requirement:
`1284 x 2778`.

Source captures came from:
`screenshots/alla_vostra/Android_Large/alla-vostra-large-20260729-*.png`

Notes from 2026-09-24:
- The USB iPhone 14 had Alla Vostra `1.0.4 (2)` installed and launchable.
- Xcode `devicectl` did not expose physical-device screenshot capture on this Mac.
- The release simulator build failed because the Mac ran out of disk space during Xcode DerivedData output.
- These converted files are saved as fallback App Store candidates. Prefer replacing them with native iPhone captures when disk/tooling allows.
