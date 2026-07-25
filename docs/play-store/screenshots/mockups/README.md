# Play Store Mockup Generator

This folder contains a repeatable Play Store image generator for Alla Vostra.

## Usage

```sh
npm install
npm run generate
```

To generate only the Dream Avenue logo-font version:

```sh
npm run generate:dream
```

The generator reads the current raw Android screenshots from:

```text
../raw/Android_Large/
```

It writes the generated feature graphic to:

```text
output/feature-graphic-polished-1920x1080.png
output/feature-graphic-polished-dream-avenue-1920x1080.png
```

## Why This Exists

Playwright renders the composition as HTML/CSS, which makes phone frames, shadows, perspective, layout, and typography easy to adjust. Sharp then re-exports the image at the exact Play Store target size.

Keep uploaded/raw screenshots in `../raw/`. Use this folder for editable mockup source and generated marketing layouts.
