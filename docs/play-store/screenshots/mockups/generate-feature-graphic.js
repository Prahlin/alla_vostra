const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');
const sharp = require('sharp');

const CANVAS = { width: 1920, height: 1080 };
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const ROOT = path.resolve(__dirname, '..');
const RAW_DIR = path.join(ROOT, 'raw', 'Android_Large');
const OUTPUT_DIR = path.join(__dirname, 'output');
const DREAM_AVENUE_FONT = path.join(REPO_ROOT, 'mob', 'assets', 'fonts', 'dream_avenue', 'dream_avenue.ttf');

const background = path.join(RAW_DIR, 'alla_vostra_orange_gradient_1920x1080.png');
const screenshots = [
  { file: 'products_overlay.png', label: 'Products', x: -720, y: 78, ry: 34, rz: -9.6, scale: 0.78, z: 1 },
  { file: 'shop_preview.png', label: 'Delivery', x: -492, y: 36, ry: 24, rz: -6, scale: 0.9, z: 2 },
  { file: 'manual_capture_20260716_182514.png', label: 'Taste', x: -252, y: 8, ry: 12, rz: -2.6, scale: 1.02, z: 4 },
  { file: 'startup_screen.png', label: 'Home', x: 0, y: -10, ry: 0, rz: 0, scale: 1.14, z: 7 },
  { file: 'confirmed_overlay.png', label: 'Confirmed', x: 252, y: 8, ry: -12, rz: 2.6, scale: 1.02, z: 4 },
  { file: 'payment_confirmation_overlay.png', label: 'Payment', x: 492, y: 36, ry: -24, rz: 6, scale: 0.9, z: 2 },
  { file: 'filled_cart_overlay.png', label: 'Cart', x: 720, y: 78, ry: -34, rz: 9.6, scale: 0.78, z: 1 },
];

const variants = [
  {
    id: 'standard',
    output: 'feature-graphic-polished-1920x1080.png',
    brandFontFace: '',
    brandFontFamily: 'Georgia, "Times New Roman", serif',
    brandFontSize: '88px',
    brandLineHeight: '0.94',
    brandMargin: '0 0 18px',
  },
  {
    id: 'dream',
    output: 'feature-graphic-polished-dream-avenue-1920x1080.png',
    brandFontPath: DREAM_AVENUE_FONT,
    brandFontFamily: '"Dream Avenue", Georgia, "Times New Roman", serif',
    brandFontSize: '116px',
    brandLineHeight: '0.74',
    brandMargin: '0 0 24px',
  },
];

async function fileDataUrl(filePath, mimeType) {
  const data = await fs.readFile(filePath);
  return `data:${mimeType};base64,${data.toString('base64')}`;
}

function imageDataUrl(filePath) {
  return fileDataUrl(filePath, 'image/png');
}

function phoneMarkup(item) {
  return `
    <figure
      class="phone"
      aria-label="${item.label}"
      style="--x:${item.x}px; --y:${item.y}px; --ry:${item.ry}deg; --rz:${item.rz}deg; --scale:${item.scale}; --z:${item.z};"
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
      background: #f3a64c;
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
      background: #f3a64c;
    }

    .canvas::before {
      position: absolute;
      inset: 0;
      z-index: -3;
      content: "";
      background-image: url("${backgroundSrc}");
      background-size: cover;
      background-position: center;
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
    }

    .brand {
      position: absolute;
      top: 86px;
      left: 92px;
      width: 540px;
      z-index: 20;
      text-shadow: 0 2px 18px rgba(255, 238, 206, 0.34);
      transform: scale(1.25);
      transform-origin: top left;
    }

    .brand-name {
      margin: ${variant.brandMargin};
      font-family: ${variant.brandFontFamily};
      font-size: ${variant.brandFontSize};
      font-weight: 400;
      line-height: ${variant.brandLineHeight};
      letter-spacing: 0;
      color: #fff8ea;
      white-space: nowrap;
    }

    .tagline {
      width: 520px;
      margin: 0;
      font-size: 38px;
      font-weight: 700;
      line-height: 1.08;
      letter-spacing: 0;
      color: #3b230d;
    }

    .subline {
      width: 520px;
      margin: 22px 0 0;
      font-size: 22px;
      font-weight: 600;
      line-height: 1.32;
      letter-spacing: 0;
      color: rgba(61, 35, 14, 0.82);
    }

    .badge-stack {
      position: absolute;
      top: 116px;
      left: 768px;
      width: max-content;
      z-index: 20;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 18px;
      transform: scale(1.25);
      transform-origin: top left;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 69px;
      min-width: 100%;
      padding: 0 15px;
      border: 1px solid rgba(255, 248, 234, 0.58);
      border-radius: 999px;
      background: rgba(255, 248, 234, 0.24);
      box-shadow: 0 18px 39px rgba(99, 51, 4, 0.12);
      color: #3e250f;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0;
      white-space: nowrap;
      backdrop-filter: blur(10px);
    }

    .right-message {
      position: absolute;
      top: 112px;
      left: 1230px;
      width: 640px;
      z-index: 20;
      margin: 0;
      font-family: "Dream Avenue", Georgia, "Times New Roman", serif;
      font-size: 118px;
      font-weight: 400;
      line-height: 0.82;
      letter-spacing: 0;
      color: #fff8ea;
      text-align: center;
      text-shadow: 0 2px 18px rgba(255, 238, 206, 0.34);
    }

    .deck {
      position: absolute;
      right: 0;
      bottom: -104px;
      left: 0;
      height: 860px;
      z-index: 10;
      perspective: 1420px;
      perspective-origin: 50% 44%;
      transform-style: preserve-3d;
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
        rotateY(var(--ry))
        rotateZ(var(--rz))
        scale(var(--scale));
      transform-origin: bottom center;
      transform-style: preserve-3d;
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
    <section class="brand" aria-label="Alla Vostra">
      <h1 class="brand-name">Alla Vostra</h1>
      <p class="tagline">Charcuterie boards delivered beautifully.</p>
      <p class="subline">Browse boards, customize your order, and check out in a few taps.</p>
    </section>
    <div class="badge-stack" aria-label="Delivery highlights">
      <span class="badge">12-hour shipping</span>
      <span class="badge">$10 delivery fee</span>
      <span class="badge">M. Dade / Broward</span>
    </div>
    <p class="right-message">Deliciousness awaits . . .</p>
    <section class="deck" aria-label="Alla Vostra app screens">
      <div class="deck-shadow"></div>
      ${renderedScreenshots.map(phoneMarkup).join('\n')}
    </section>
  </main>
</body>
</html>`;
}

async function resolveVariants() {
  const dreamFontSrc = await fileDataUrl(DREAM_AVENUE_FONT, 'font/ttf');
  const dreamFontFace = `
    @font-face {
      font-family: "Dream Avenue";
      src: url("${dreamFontSrc}") format("truetype");
      font-weight: 400;
      font-style: normal;
      font-display: block;
    }
  `;

  return Promise.all(
    variants.map(async (variant) => {
      return {
        ...variant,
        brandFontFace: variant.brandFontPath ? dreamFontFace : dreamFontFace + variant.brandFontFace,
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

    await page.screenshot({
      path: tempPath,
      type: 'png',
      clip: { x: 0, y: 0, width: CANVAS.width, height: CANVAS.height },
      animations: 'disabled',
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
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const backgroundSrc = await imageDataUrl(background);
  const renderedScreenshots = await Promise.all(
    screenshots.map(async (item) => ({
      ...item,
      src: await imageDataUrl(path.join(RAW_DIR, item.file)),
    }))
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
