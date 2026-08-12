const path = require('node:path');
const fs = require('node:fs/promises');
const sharp = require('sharp');

const CANVAS = { width: 1920, height: 1080 };
const FRAME_SIZE = { width: 1290, height: 2661 };
const TRIM = { left: 192, top: 0, width: 1536, height: 1080 };

const ROOT = path.resolve(__dirname, '..');
const RAW_DIR = path.join(ROOT, 'raw', 'Android_Large');
const FINAL_DIR = path.join(ROOT, 'final');
const FRAME_PATH = path.join(
  ROOT,
  'raw',
  'device-frames',
  'alla-vostra-hero-startup-framed.png',
);

const SCREEN_APERTURE = {
  x: 52,
  y: 36,
  width: 1186,
  height: 2574,
  radius: 150,
};

const targets = [
  {
    base: 'playstore2.png',
    trim: 'playstore2_trim-lr10.png',
    devices: [
      {
        screen: 'products_overlay.png',
        left: 1005,
        top: -520,
        width: 566,
      },
      {
        screen: 'manual_capture_20260716_182514.png',
        left: 369,
        top: 426,
        width: 535,
        screenShiftY: 30,
      },
    ],
  },
  {
    base: 'playstore4.png',
    trim: 'playstore4_trim-lr10.png',
    devices: [
      {
        screen: 'manual_capture_20260716_182514.png',
        left: 311,
        top: 550,
        width: 448,
        screenShiftY: 36,
      },
      {
        screen: 'products_screen_large.png',
        left: 1218,
        top: 550,
        width: 448,
        screenShiftY: 36,
      },
      {
        screen: 'startup_screen.png',
        left: 659,
        top: 387,
        width: 602,
      },
    ],
  },
];

let frameOverlayPromise;

function roundedRectSvg({ width, height, radius, x = 0, y = 0 }) {
  return Buffer.from(`
    <svg width="${FRAME_SIZE.width}" height="${FRAME_SIZE.height}" viewBox="0 0 ${FRAME_SIZE.width} ${FRAME_SIZE.height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="white"/>
    </svg>
  `);
}

function screenMask(width, height, radius) {
  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="white"/>
    </svg>
  `);
}

async function makeFrameOverlay() {
  if (frameOverlayPromise) {
    return frameOverlayPromise;
  }

  frameOverlayPromise = (async () => {
    const frameOutsideScreen = await sharp(FRAME_PATH)
      .ensureAlpha()
      .composite([
        {
          input: roundedRectSvg(SCREEN_APERTURE),
          blend: 'dest-out',
        },
      ])
      .png()
      .toBuffer();

    return frameOutsideScreen;
  })();

  return frameOverlayPromise;
}

async function topLeftColor(filePath) {
  const { data } = await sharp(filePath)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    r: data[0],
    g: data[1],
    b: data[2],
    alpha: 1,
  };
}

async function buildScreenLayer(screenPath, aperture, shiftY = 0) {
  const fullScreen = await sharp(screenPath)
    .resize(aperture.width, aperture.height, { fit: 'cover', position: 'top' })
    .png()
    .toBuffer();

  const screenComposite = [];

  if (shiftY >= 0) {
    const visibleHeight = Math.max(1, aperture.height - shiftY);
    screenComposite.push({
      input: await sharp(fullScreen)
        .extract({
          left: 0,
          top: 0,
          width: aperture.width,
          height: visibleHeight,
        })
        .png()
        .toBuffer(),
      left: 0,
      top: shiftY,
    });
  } else {
    const sourceTop = -shiftY;
    const visibleHeight = Math.max(1, aperture.height - sourceTop);
    screenComposite.push({
      input: await sharp(fullScreen)
        .extract({
          left: 0,
          top: sourceTop,
          width: aperture.width,
          height: visibleHeight,
        })
        .png()
        .toBuffer(),
      left: 0,
      top: 0,
    });
  }

  const screenWithContent = await sharp({
    create: {
      width: aperture.width,
      height: aperture.height,
      channels: 4,
      background: await topLeftColor(screenPath),
    },
  })
    .composite(screenComposite)
    .png()
    .toBuffer();

  return sharp(screenWithContent)
    .composite([
      {
        input: screenMask(aperture.width, aperture.height, aperture.radius),
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();
}

async function buildDevice(device) {
  const height = Math.round((device.width * FRAME_SIZE.height) / FRAME_SIZE.width);
  const scale = device.width / FRAME_SIZE.width;
  const aperture = {
    x: Math.round(SCREEN_APERTURE.x * scale),
    y: Math.round(SCREEN_APERTURE.y * scale),
    width: Math.round(SCREEN_APERTURE.width * scale),
    height: Math.round(SCREEN_APERTURE.height * scale),
    radius: Math.round(SCREEN_APERTURE.radius * scale),
  };

  const screenLayer = await buildScreenLayer(
    path.join(RAW_DIR, device.screen),
    aperture,
    device.screenShiftY || 0,
  );

  const frameOverlay = await sharp(await makeFrameOverlay())
    .resize(device.width, height)
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: device.width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: screenLayer,
        left: aperture.x,
        top: aperture.y,
      },
      {
        input: frameOverlay,
        left: 0,
        top: 0,
      },
    ])
    .png()
    .toBuffer();
}

async function cropToCanvas(input, left, top) {
  const meta = await sharp(input).metadata();
  const sourceLeft = Math.max(0, -left);
  const sourceTop = Math.max(0, -top);
  const targetLeft = Math.max(0, left);
  const targetTop = Math.max(0, top);
  const width = Math.min(meta.width - sourceLeft, CANVAS.width - targetLeft);
  const height = Math.min(meta.height - sourceTop, CANVAS.height - targetTop);

  if (width <= 0 || height <= 0) {
    return null;
  }

  return {
    input: await sharp(input)
      .extract({
        left: sourceLeft,
        top: sourceTop,
        width,
        height,
      })
      .png()
      .toBuffer(),
    left: targetLeft,
    top: targetTop,
  };
}

async function compositeTarget(target) {
  const composites = [];

  for (const device of target.devices) {
    const visibleDevice = await cropToCanvas(
      await buildDevice(device),
      device.left,
      device.top,
    );

    if (visibleDevice) {
      composites.push(visibleDevice);
    }
  }

  const basePath = path.join(FINAL_DIR, target.base);
  const tempBasePath = `${basePath}.tmp`;

  await sharp(basePath)
    .ensureAlpha()
    .composite(composites)
    .png()
    .toFile(tempBasePath);

  await fs.rename(tempBasePath, basePath);

  await sharp(basePath)
    .extract(TRIM)
    .png()
    .toFile(path.join(FINAL_DIR, target.trim));

  console.log(`Updated ${target.base} and ${target.trim}`);
}

async function main() {
  for (const target of targets) {
    await compositeTarget(target);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
