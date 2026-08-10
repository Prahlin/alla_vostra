const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');
const sharp = require('sharp');

const CANVAS = { width: 1920, height: 1080 };
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const ROOT = path.resolve(__dirname, '..');
const RAW_DIR = path.join(ROOT, 'raw', 'Android_Large');
const FINAL_DIR = path.join(ROOT, 'final');
const OUTPUT_DIR = path.join(__dirname, 'output');
const QA_SCREENSHOT_DIR = path.join(REPO_ROOT, 'screenshots', 'alla_vostra', 'Android_Large');
const STORE_FEATURE_GRAPHIC = path.join(REPO_ROOT, 'mob', 'assets', 'store', 'feature-graphic.png');
const DREAM_AVENUE_FONT = path.join(REPO_ROOT, 'mob', 'assets', 'fonts', 'dream_avenue', 'dream_avenue.ttf');
const TT_FORS_FONT = path.join(REPO_ROOT, 'mob', 'assets', 'fonts', 'tt_fors', 'tt_fors_trial_variable.ttf');

const background = path.join(RAW_DIR, 'alla_vostra_orange_gradient_1920x1080.png');
const screenshots = [
  { dir: QA_SCREENSHOT_DIR, file: 'alla-vostra-large-20260729-215013.png', label: 'Products', x: -652, y: 78, ry: 34, rz: -9.6, scale: 0.78 },
  { file: 'products_screen_large.png', label: 'Products', x: -492, y: 36, ry: 24, rz: -6, scale: 0.9 },
  { file: 'manual_capture_20260716_182514.png', label: 'Taste', x: -252, y: 8, ry: 12, rz: -2.6, scale: 1.02 },
  { file: 'startup_screen.png', label: 'Home', x: 0, y: -10, ry: 0, rz: 0, scale: 1.14 },
  { dir: QA_SCREENSHOT_DIR, file: 'alla-vostra-large-20260729-214920.png', label: 'Home', x: 252, y: 8, ry: -12, rz: 2.6, scale: 1.02 },
  { file: 'about_us_screen_large.png', label: 'About Us', x: 492, y: 36, ry: -24, rz: 6, scale: 0.9 },
  { dir: QA_SCREENSHOT_DIR, file: 'alla-vostra-large-20260729-215225.png', label: 'Contact', x: 652, y: 78, ry: -34, rz: 9.6, scale: 0.78 },
];

const variants = [
  {
    id: 'standard',
    output: 'feature-graphic-polished-1920x1080.png',
    brandNameLines: ['Alla Vostra'],
    brandFontFace: '',
    brandFontFamily: 'Georgia, "Times New Roman", serif',
    brandFontSize: '89px',
    brandFontWeight: '400',
    brandTextStroke: '0 transparent',
    brandLineHeight: '0.94',
    brandMargin: '0 0 18px',
    brandNameTranslateX: '0px',
    brandNameTranslateY: '0px',
    brandFirstLineFontSize: 'inherit',
    brandFirstLineLineHeight: 'inherit',
    brandFirstLineLetterSpacing: '0px',
    brandFirstLineTranslateX: '0px',
    brandFirstLineTranslateY: '0px',
    brandFirstLineScaleY: '1',
    brandTop: '86px',
    badgeLeft: '768px',
    badgeTop: '91px',
    badgeGap: '18px',
    badgeSpreadBetweenBrandAndDeck: false,
    badgeBaseWidth: '0px',
    badgeFontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    badges: [
      { label: 'next-day shipping', scale: '1' },
      { label: '$10 delivery', scale: '1' },
      { label: 'dade / broward', scale: '1' },
    ],
    taglineLines: ['Passionately Home-Made.', 'Tastefully Sampled.', 'Unforgettable.'],
    taglineFontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    taglineFontSize: '31.5px',
    taglineLineHeight: '1.22',
    taglineLeft: '92px',
    taglineTop: '213px',
    taglineTranslateX: '0px',
    sublineFontSize: '27.5px',
    sublineLineHeight: '1.22',
    sublineMargin: '8px 0 0',
    sublineLeft: '92px',
    sublineTop: '367px',
    sublineLines: [
      'Browse curated boards for gifts, celebrations,',
      'family gatherings, showers, and events.',
      'Each spread layers cheeses, meats,',
      'fruits, sweets, and pairings:',
      'the family-owned touch,',
      'South Florida flavor,',
      'crafted with care,',
      'joy after dessert.',
    ],
    stackOffsetX: '0px',
    stackOffsetY: '0px',
  },
  {
    id: 'dream',
    output: 'feature-graphic-polished-dream-avenue-1920x1080.png',
    brandNameLines: ['Alla', 'Vostra'],
    brandFontPath: DREAM_AVENUE_FONT,
    brandFontFamily: '"Dream Avenue", Georgia, "Times New Roman", serif',
    brandFontSize: '175.5px',
    brandFontWeight: '700',
    brandTextStroke: '3.9px rgba(8, 5, 2, 0.98)',
    brandLineHeight: '0.74',
    brandMargin: '0 0 0',
    brandLeft: '15.62px',
    brandScale: '1.375',
    brandNameTranslateX: '-26.4px',
    brandNameTranslateY: '5.4px',
    brandFirstLineFontSize: '275.33px',
    brandFirstLineLineHeight: 'inherit',
    brandFirstLineLetterSpacing: '23.45px',
    brandFirstLineTranslateX: '-1.6px',
    brandFirstLineTranslateY: '-2px',
    brandFirstLineScaleY: '1',
    brandTop: '146.17px',
    badgeLeft: '737.6px',
    badgeTop: '17.9px',
    badgeGap: '18px',
    badgeSpreadBetweenBrandAndDeck: true,
    badgeSpreadGapScale: 0.50625,
    badgeSpreadPreviousGapScale: 0.75,
    badgeCollapseTowardCenter: true,
    badgeBaseWidth: '291.7px',
    badgeWidthSourceLabel: 'next-day shipping',
    badgeWidthSourcePaddingMultiplier: 0.5,
    badgeColor: '#ffffff',
    badgeFontFamily: '"TT Fors", Inter, ui-sans-serif, system-ui, sans-serif',
    badges: [
      { label: 'dade / broward', scale: '1.1' },
      { label: '$10 delivery', scale: '1.1' },
      { label: 'next-day shipping', scale: '1.1' },
    ],
    taglineLines: ['Smooth.', 'Savory.', 'Posh.'],
    taglineLineScales: [1.21, 1, 0.722],
    taglineLineFontSizes: ['170px', '170px', '170px'],
    taglineLineLetterSpacings: ['0px', '-4px', '0px'],
    taglineLineAligns: ['flex-end', 'flex-end', 'flex-end'],
    taglineTargetWidth: '452.328125px',
    taglineEqualizeLineWidths: true,
    taglineFontFamily: '"TT Fors", Inter, ui-sans-serif, system-ui, sans-serif',
    taglineFontSize: '122.9844px',
    taglineColor: '#fff8ea',
    taglineTextStroke: '5.7px rgba(8, 5, 2, 0.98)',
    taglineLineHeight: '1.575',
    taglineLineGap: '52.7076px',
    taglineLeft: '1496.67px',
    taglineTop: '58.5692px',
    taglineTranslateX: '0px',
    taglineScale: '0.9',
    sublineFontSize: '55px',
    sublineLineHeight: '0.94',
    sublineMargin: '0',
    sublineLeft: '1230px',
    sublineTop: '46px',
    sublineLines: [],
    stackOffsetX: '0px',
    stackOffsetY: '50px',
  },
];

variants.push({
  ...variants.find((variant) => variant.id === 'dream'),
  id: 'dream-assets90',
  output: 'playstore1_feature-assets90_1920x1080.png',
  foregroundScale: '0.9',
  stackOffsetY: '172.23px',
  finalFeatureExports: true,
});

variants.push({
  ...variants.find((variant) => variant.id === 'dream-assets90'),
  id: 'dream-assets90-foreground',
  output: 'playstore1_feature-assets90_foreground_1920x1080.png',
  finalFeatureExports: false,
  transparentBackground: true,
});

async function fileDataUrl(filePath, mimeType) {
  const data = await fs.readFile(filePath);
  return `data:${mimeType};base64,${data.toString('base64')}`;
}

function imageDataUrl(filePath) {
  return fileDataUrl(filePath, 'image/png');
}

function orderByCenterDepth(items) {
  return [...items]
    .map((item, index) => ({
      ...item,
      sourceIndex: index,
      centerDistance: Math.abs(item.x),
      skew: Number((-item.ry * 0.13).toFixed(2)),
    }))
    .sort((a, b) => {
      if (a.centerDistance !== b.centerDistance) {
        return b.centerDistance - a.centerDistance;
      }

      if (a.y !== b.y) {
        return b.y - a.y;
      }

      return a.sourceIndex - b.sourceIndex;
    })
    .map((item, index) => ({
      ...item,
      z: index + 1,
    }));
}

function phoneMarkup(item) {
  return `
    <figure
      class="phone"
      aria-label="${item.label}"
      style="--x:${item.x}px; --y:${item.y}px; --skew:${item.skew}deg; --rz:${item.rz}deg; --scale:${item.scale}; --z:${item.z};"
    >
      <div class="screen">
        <img src="${item.src}" alt="${item.label}" />
      </div>
    </figure>
  `;
}

function html(backgroundSrc, renderedScreenshots, variant) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=${CANVAS.width}, initial-scale=1" />
  <style>
    ${variant.brandFontFace}

    * {
      box-sizing: border-box;
    }

    html,
    body {
      width: ${CANVAS.width}px;
      height: ${CANVAS.height}px;
      margin: 0;
      overflow: hidden;
      background: ${variant.transparentBackground ? 'transparent' : '#f3a64c'};
    }

    body {
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #2e1d10;
    }

    .canvas {
      position: relative;
      width: ${CANVAS.width}px;
      height: ${CANVAS.height}px;
      overflow: hidden;
      isolation: isolate;
      background: ${variant.transparentBackground ? 'transparent' : '#f3a64c'};
    }

    .canvas::before {
      position: absolute;
      inset: 0;
      z-index: -3;
      content: "";
      background-image: url("${backgroundSrc}");
      background-size: cover;
      background-position: center;
      display: ${variant.transparentBackground ? 'none' : 'block'};
    }

    .canvas::after {
      position: absolute;
      inset: 0;
      z-index: -2;
      content: "";
      background:
        linear-gradient(102deg, rgba(255, 246, 229, 0.2), transparent 42%),
        linear-gradient(156deg, transparent 32%, rgba(151, 76, 7, 0.14) 86%),
        linear-gradient(27deg, rgba(255, 248, 236, 0.14), rgba(132, 67, 7, 0.12));
      pointer-events: none;
      display: ${variant.transparentBackground ? 'none' : 'block'};
    }

    .asset-stage {
      position: absolute;
      inset: 0;
      z-index: 0;
      transform: scale(${variant.foregroundScale || '1'});
      transform-origin: center center;
    }

    .grain {
      position: absolute;
      inset: 0;
      z-index: -1;
      opacity: 0.18;
      background-image:
        linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px),
        linear-gradient(0deg, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 96px 96px;
      mask-image: linear-gradient(to bottom, black, transparent 78%);
      pointer-events: none;
      display: ${variant.transparentBackground ? 'none' : 'block'};
    }

    .brand {
      position: absolute;
      top: ${variant.brandTop};
      left: ${variant.brandLeft || '92px'};
      width: 540px;
      z-index: 20;
      text-shadow: 0 2px 18px rgba(255, 238, 206, 0.34);
      transform: scale(${variant.brandScale || '1.25'});
      transform-origin: top left;
    }

    .brand-name {
      margin: ${variant.brandMargin};
      font-family: ${variant.brandFontFamily};
      font-size: ${variant.brandFontSize};
      font-weight: ${variant.brandFontWeight};
      line-height: ${variant.brandLineHeight};
      letter-spacing: 0;
      color: #fff8ea;
      -webkit-text-stroke: ${variant.brandTextStroke};
      paint-order: stroke fill;
      white-space: nowrap;
      transform: translate(${variant.brandNameTranslateX}, ${variant.brandNameTranslateY});
    }

    .brand-name-line {
      display: block;
      width: max-content;
      white-space: nowrap;
    }

    .brand-name-line:first-child {
      font-size: ${variant.brandFirstLineFontSize};
      line-height: ${variant.brandFirstLineLineHeight};
      letter-spacing: ${variant.brandFirstLineLetterSpacing};
      transform: translate(${variant.brandFirstLineTranslateX}, ${variant.brandFirstLineTranslateY}) scaleY(${variant.brandFirstLineScaleY});
      transform-origin: top left;
    }

    .tagline {
      position: absolute;
      top: ${variant.taglineTop};
      left: ${variant.taglineLeft};
      width: max-content;
      margin: 0;
      font-family: ${variant.taglineFontFamily};
      font-size: ${variant.taglineFontSize};
      font-weight: 700;
      line-height: ${variant.taglineLineHeight};
      letter-spacing: 0;
      color: ${variant.taglineColor || '#3b230d'};
      -webkit-text-stroke: ${variant.taglineTextStroke || '0 transparent'};
      paint-order: stroke fill;
      z-index: 20;
      transform: translateX(${variant.taglineTranslateX}) scale(${variant.taglineScale || '1'});
      transform-origin: center center;
      ${variant.taglineEqualizeLineWidths ? `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: ${variant.taglineLineGap};
      line-height: 1;
      ` : ''}
    }

    .tagline-line {
      display: block;
      width: max-content;
      white-space: nowrap;
    }

    .subline {
      width: 520px;
      margin: ${variant.sublineMargin};
      font-weight: 600;
      font-size: ${variant.sublineFontSize};
      line-height: ${variant.sublineLineHeight};
      letter-spacing: 0;
      color: rgba(61, 35, 14, 0.82);
      position: absolute;
      top: ${variant.sublineTop};
      left: ${variant.sublineLeft};
      z-index: 20;
    }

    .subline-line {
      display: block;
      width: max-content;
      white-space: nowrap;
    }

    .badge-stack {
      position: absolute;
      top: ${variant.badgeTop};
      left: ${variant.badgeLeft};
      width: max-content;
      z-index: 20;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: ${variant.badgeGap};
      transform: scale(1.25);
      transform-origin: top left;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: calc(69px * var(--badge-scale));
      min-width: calc(${variant.badgeBaseWidth} * var(--badge-scale));
      padding: 0 calc(15px * var(--badge-scale));
      border: 1px solid rgba(255, 248, 234, 0.58);
      border-radius: 999px;
      background: rgba(255, 248, 234, 0.24);
      box-shadow: 0 18px 39px rgba(99, 51, 4, 0.12);
      color: ${variant.badgeColor || '#3e250f'};
      font-family: ${variant.badgeFontFamily};
      font-size: calc(26px * var(--badge-scale));
      font-weight: 800;
      letter-spacing: 0;
      white-space: nowrap;
      backdrop-filter: blur(10px);
    }

    .badge-label {
      display: inline-block;
      white-space: nowrap;
    }

    .deck {
      position: absolute;
      left: calc(50% - ${CANVAS.width / 2}px + ${variant.stackOffsetX});
      bottom: calc(-204px - ${variant.stackOffsetY});
      width: ${CANVAS.width}px;
      height: 860px;
      z-index: 10;
      transform: scale(1.21);
      transform-origin: bottom center;
    }

    .deck-shadow {
      position: absolute;
      right: 60px;
      bottom: 82px;
      left: 60px;
      height: 92px;
      border-radius: 50%;
      background:
        radial-gradient(ellipse at center, rgba(98, 49, 0, 0.3), rgba(98, 49, 0, 0.14) 38%, transparent 72%);
      filter: blur(18px);
      transform: rotateX(64deg);
    }

    .phone {
      --phone-width: 274px;
      position: absolute;
      bottom: 0;
      left: 50%;
      z-index: var(--z);
      width: var(--phone-width);
      height: calc(var(--phone-width) * 2.1667);
      margin: 0;
      padding: 10px;
      border: 2px solid rgba(255, 248, 232, 0.88);
      border-radius: 34px;
      background:
        linear-gradient(145deg, rgba(255, 252, 243, 0.88), rgba(255, 225, 176, 0.48) 24%, rgba(45, 34, 24, 0.82) 25%, rgba(12, 10, 8, 0.96));
      box-shadow:
        0 40px 58px rgba(91, 47, 3, 0.3),
        0 16px 24px rgba(55, 29, 5, 0.22),
        inset 0 0 0 1px rgba(255, 255, 255, 0.4);
      overflow: hidden;
      transform:
        translateX(calc(-50% + var(--x)))
        translateY(var(--y))
        rotateZ(var(--rz))
        skewX(var(--skew))
        scale(var(--scale));
      transform-origin: bottom center;
    }

    .phone::before {
      position: absolute;
      top: 8px;
      left: 50%;
      width: 90px;
      height: 18px;
      border-radius: 0 0 15px 15px;
      background: rgba(17, 13, 9, 0.9);
      content: "";
      transform: translateX(-50%);
      z-index: 3;
      opacity: 0.66;
    }

    .phone::after {
      position: absolute;
      inset: 10px;
      border-radius: 26px;
      background:
        linear-gradient(115deg, rgba(255, 255, 255, 0.32), transparent 28%),
        linear-gradient(290deg, rgba(255, 255, 255, 0.11), transparent 38%);
      content: "";
      mix-blend-mode: screen;
      pointer-events: none;
      z-index: 4;
    }

    .screen {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 26px;
      background: #fffaf0;
      box-shadow:
        inset 0 0 0 2px rgba(0, 0, 0, 0.22),
        inset 0 0 24px rgba(0, 0, 0, 0.1);
    }

    .screen img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

  </style>
</head>
<body>
  <main class="canvas">
    <div class="grain"></div>
    <div class="asset-stage">
      <section class="brand" aria-label="Alla Vostra">
        <h1 class="brand-name">${variant.brandNameLines.map((line) => `<span class="brand-name-line">${line}</span>`).join('')}</h1>
      </section>
      <p class="tagline" data-target-width="${variant.taglineTargetWidth || ''}">${variant.taglineLines.map((line, index) => `<span class="tagline-line" data-line-scale="${variant.taglineLineScales?.[index] ?? 1}" data-line-font-size="${variant.taglineLineFontSizes?.[index] || ''}" style="align-self:${variant.taglineLineAligns?.[index] ?? 'auto'};letter-spacing:${variant.taglineLineLetterSpacings?.[index] || '0px'}">${line}</span>`).join('')}</p>
      ${variant.sublineLines.length ? `<p class="subline">${variant.sublineLines.map((line) => `<span class="subline-line">${line}</span>`).join('')}</p>` : ''}
      <div class="badge-stack" data-collapse-toward-center="${variant.badgeCollapseTowardCenter ? 'true' : 'false'}" data-gap-scale="${variant.badgeSpreadGapScale ?? ''}" data-previous-gap-scale="${variant.badgeSpreadPreviousGapScale ?? ''}" data-spread-between-brand-and-deck="${variant.badgeSpreadBetweenBrandAndDeck ? 'true' : 'false'}" aria-label="Delivery highlights">
        ${variant.badges.map((badge) => `<span class="badge" data-label="${badge.label}" style="--badge-scale:${badge.scale};"><span class="badge-label">${badge.label}</span></span>`).join('')}
      </div>
      <section class="deck" aria-label="Alla Vostra app screens">
        <div class="deck-shadow"></div>
        ${renderedScreenshots.map(phoneMarkup).join('\n')}
      </section>
    </div>
  </main>
</body>
</html>`;
}

async function resolveVariants() {
  const dreamFontSrc = await fileDataUrl(DREAM_AVENUE_FONT, 'font/ttf');
  const ttForsFontSrc = await fileDataUrl(TT_FORS_FONT, 'font/ttf');
  const dreamFontFace = `
    @font-face {
      font-family: "Dream Avenue";
      src: url("${dreamFontSrc}") format("truetype");
      font-weight: 400;
      font-style: normal;
      font-display: block;
    }
  `;
  const ttForsFontFace = `
    @font-face {
      font-family: "TT Fors";
      src: url("${ttForsFontSrc}") format("truetype");
      font-weight: 100 900;
      font-style: normal;
      font-display: block;
    }
  `;
  const fontFaces = dreamFontFace + ttForsFontFace;

  return Promise.all(
    variants.map(async (variant) => {
      return {
        ...variant,
        brandFontFace: fontFaces + variant.brandFontFace,
      };
    })
  );
}

async function renderVariant(browser, backgroundSrc, renderedScreenshots, variant) {
  const tempPath = path.join(OUTPUT_DIR, `.${path.basename(variant.output, '.png')}.tmp.png`);
  const outputPath = path.join(OUTPUT_DIR, variant.output);
  const page = await browser.newPage({
    viewport: CANVAS,
    deviceScaleFactor: 1,
    colorScheme: 'light',
  });

  try {
    await page.setContent(html(backgroundSrc, renderedScreenshots, variant), { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0));
    await page.evaluate(() => document.fonts.ready);
    if (variant.taglineEqualizeLineWidths) {
      await page.evaluate(() => {
        const lines = Array.from(document.querySelectorAll('.tagline-line'));
        const [firstLine, ...remainingLines] = lines;
        if (!firstLine) {
          return;
        }

        const tagline = document.querySelector('.tagline');
        const configuredTargetWidth = Number.parseFloat(tagline?.dataset.targetWidth || '');
        const targetWidth = Number.isFinite(configuredTargetWidth)
          ? configuredTargetWidth
          : firstLine.getBoundingClientRect().width;
        const baseFontSize = Number.parseFloat(window.getComputedStyle(firstLine).fontSize);
        const lineWidths = lines.map((line) => line.getBoundingClientRect().width);
        if (tagline) {
          tagline.style.width = `${targetWidth}px`;
        }

        lines.forEach((line, index) => {
          const explicitFontSize = line.dataset.lineFontSize;
          if (explicitFontSize) {
            line.style.fontSize = explicitFontSize;
            return;
          }

          const lineWidth = lineWidths[index];
          const lineScale = Number.parseFloat(line.dataset.lineScale || '1');
          if (lineWidth > 0 && Number.isFinite(baseFontSize)) {
            line.style.fontSize = `${baseFontSize * (targetWidth / lineWidth) * (Number.isFinite(lineScale) ? lineScale : 1)}px`;
          }
        });
      });
    }
    if (variant.badgeWidthSourceLabel) {
      await page.evaluate(({ sourceLabel, paddingMultiplier }) => {
        const stack = document.querySelector('.badge-stack');
        const badges = Array.from(document.querySelectorAll('.badge'));
        const sourceBadge = badges.find((badge) => badge.dataset.label === sourceLabel);
        const sourceLabelEl = sourceBadge?.querySelector('.badge-label');
        if (!stack || !sourceBadge || !sourceLabelEl) {
          return;
        }

        const stackScale = stack.offsetWidth > 0 ? stack.getBoundingClientRect().width / stack.offsetWidth : 1;
        const scale = Number.isFinite(stackScale) && stackScale > 0 ? stackScale : 1;
        const sourceWidth = sourceBadge.getBoundingClientRect().width / scale;
        const labelWidth = sourceLabelEl.getBoundingClientRect().width / scale;
        const horizontalSpace = sourceWidth - labelWidth;
        if (!Number.isFinite(horizontalSpace) || horizontalSpace <= 0) {
          return;
        }

        const targetWidth = labelWidth + horizontalSpace * paddingMultiplier;
        if (!Number.isFinite(targetWidth) || targetWidth <= labelWidth) {
          return;
        }

        badges.forEach((badge) => {
          badge.style.width = `${targetWidth}px`;
          badge.style.minWidth = `${targetWidth}px`;
        });
      }, {
        sourceLabel: variant.badgeWidthSourceLabel,
        paddingMultiplier: variant.badgeWidthSourcePaddingMultiplier ?? 1,
      });
    }
    if (variant.badgeSpreadBetweenBrandAndDeck) {
      await page.evaluate(() => {
        const stack = document.querySelector('.badge-stack');
        const badges = Array.from(stack?.querySelectorAll('.badge') || []);
        const phones = Array.from(document.querySelectorAll('.phone'));
        if (!stack || badges.length < 2 || phones.length === 0) {
          return;
        }

        const stackRect = stack.getBoundingClientRect();
        const stackScale = stack.offsetHeight > 0 ? stackRect.height / stack.offsetHeight : 1;
        // badgeTop is tuned to the rendered Alla Vostra glyph edge; keep that anchor fixed.
        const topAnchor = stackRect.top;
        const bottomAnchor = Math.min(...phones.map((phone) => phone.getBoundingClientRect().top));
        const layoutHeight = (bottomAnchor - topAnchor) / (Number.isFinite(stackScale) && stackScale > 0 ? stackScale : 1);
        if (!Number.isFinite(layoutHeight) || layoutHeight <= 0) {
          return;
        }

        const badgesHeight = badges.reduce((total, badge) => total + badge.offsetHeight, 0);
        const originalGap = (layoutHeight - badgesHeight) / (badges.length - 1);
        if (!Number.isFinite(originalGap) || originalGap < 0) {
          return;
        }

        const previousGapScale = Number.parseFloat(stack.dataset.previousGapScale || '0.75');
        const gapScale = Number.parseFloat(stack.dataset.gapScale || '0.75');
        const shouldCollapseTowardCenter = stack.dataset.collapseTowardCenter === 'true';
        const previousGap = originalGap * (Number.isFinite(previousGapScale) ? previousGapScale : 0.75);
        const reducedGap = originalGap * (Number.isFinite(gapScale) ? gapScale : 0.75);
        const previousHeight = badgesHeight + previousGap * (badges.length - 1);
        const reducedHeight = badgesHeight + reducedGap * (badges.length - 1);
        const adjustedTop = shouldCollapseTowardCenter
          ? topAnchor + ((previousHeight - reducedHeight) * stackScale) / 2
          : topAnchor;

        stack.style.top = `${adjustedTop}px`;
        stack.style.height = `${reducedHeight}px`;
        stack.style.gap = `${reducedGap}px`;
        stack.style.justifyContent = 'flex-start';
      });
    }

    await page.screenshot({
      path: tempPath,
      type: 'png',
      clip: { x: 0, y: 0, width: CANVAS.width, height: CANVAS.height },
      animations: 'disabled',
      omitBackground: Boolean(variant.transparentBackground),
    });
  } finally {
    await page.close();
  }

  await sharp(tempPath)
    .resize(CANVAS.width, CANVAS.height, { fit: 'cover' })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);

  await fs.rm(tempPath, { force: true });
  console.log(`Generated ${path.relative(process.cwd(), outputPath)}`);

  if (variant.finalFeatureExports) {
    await exportFinalFeatureGraphic(outputPath);
  }
}

async function exportFinalFeatureGraphic(sourcePath) {
  await fs.mkdir(FINAL_DIR, { recursive: true });

  const finalPngTargets = [
    path.join(FINAL_DIR, 'playstore1.png'),
    path.join(FINAL_DIR, 'playstore1_feature-assets90_deckdown60_extended-gradient_1024x500.png'),
    path.join(FINAL_DIR, 'feature-graphic-upload-clean-1024x500.png'),
    STORE_FEATURE_GRAPHIC,
  ];
  const finalJpgTargets = [
    path.join(FINAL_DIR, 'feature-graphic-upload-1024x500.jpg'),
    path.join(FINAL_DIR, 'feature-graphic-upload-clean-1024x500.jpg'),
  ];
  const resizedPng = await sharp(sourcePath)
    .resize(1024, 500, { fit: 'cover', position: 'center' })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
  const resizedJpg = await sharp(resizedPng)
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();

  await Promise.all([
    ...finalPngTargets.map((targetPath) => fs.writeFile(targetPath, resizedPng)),
    ...finalJpgTargets.map((targetPath) => fs.writeFile(targetPath, resizedJpg)),
  ]);

  [...finalPngTargets, ...finalJpgTargets].forEach((targetPath) => {
    console.log(`Generated ${path.relative(process.cwd(), targetPath)}`);
  });
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const backgroundSrc = await imageDataUrl(background);
  const renderedScreenshots = orderByCenterDepth(
    await Promise.all(
      screenshots.map(async (item) => ({
        ...item,
        src: await imageDataUrl(path.join(item.dir || RAW_DIR, item.file)),
      }))
    )
  );
  const resolvedVariants = await resolveVariants();
  const requested = process.argv.slice(2);
  const selectedVariants = requested.length
    ? resolvedVariants.filter((variant) => requested.includes(variant.id))
    : resolvedVariants;

  if (selectedVariants.length === 0) {
    throw new Error(`Unknown variant. Choose one of: ${variants.map((variant) => variant.id).join(', ')}`);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    for (const variant of selectedVariants) {
      await renderVariant(browser, backgroundSrc, renderedScreenshots, variant);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
