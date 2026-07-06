const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const outputDir = __dirname;
const htmlUrl = pathToFileURL(path.join(outputDir, "mockups.html")).toString();

const screens = [
  ["01_main_home.png", "home"],
];

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);

  if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") {
    throw new Error(`${path.basename(filePath)} is not a PNG`);
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function runPlaywrightScreenshot(screen, outputPath) {
  const url = `${htmlUrl}?screen=${encodeURIComponent(screen)}`;
  const result = spawnSync(
    "npx",
    [
      "playwright",
      "screenshot",
      "--browser=chromium",
      "--viewport-size=1080,1920",
      "--wait-for-selector=#screen[data-ready=\"true\"]",
      "--timeout=30000",
      url,
      outputPath,
    ],
    {
      cwd: path.resolve(outputDir, "../.."),
      encoding: "utf8",
      stdio: "pipe",
    },
  );

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
    throw new Error(output || `Playwright screenshot failed for ${screen}`);
  }
}

for (const [filename, screen] of screens) {
  const outputPath = path.join(outputDir, filename);

  runPlaywrightScreenshot(screen, outputPath);

  const size = readPngSize(outputPath);

  if (size.width !== 1080 || size.height !== 1920) {
    throw new Error(
      `${filename} rendered at ${size.width}x${size.height}, expected 1080x1920`,
    );
  }

  console.log(`${filename}: ${size.width}x${size.height}`);
}
