# Alla Vostra Play Store Mockups

This folder contains Google Play phone screenshot mockups rendered at 1080 x 1920 portrait.

The current focused renderer regenerates only the first Android home screenshot:

- `01_main_home.png`

Regenerate the PNGs from the local renderer:

```bash
node prahlin/play_store/render.js
```

The renderer uses `mockups.html`, the app fonts, and image assets from `mob/`.
