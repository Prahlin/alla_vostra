const fs = require("fs");
const path = require("path");

const { withDangerousMod } = require("@expo/config-plugins");

const splashBackgroundColor = "#f7b967";

const launcherBackgroundXml = `<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item>
    <bitmap android:gravity="fill" android:src="@drawable/splashscreen_background"/>
  </item>
</layer-list>
`;

const splashBackgroundDrawableXml = `<shape xmlns:android="http://schemas.android.com/apk/res/android"
  android:shape="rectangle">
  <solid android:color="@color/splashscreen_background" />
</shape>
`;

const transparentIconXml = `<vector xmlns:android="http://schemas.android.com/apk/res/android"
  android:width="1dp"
  android:height="1dp"
  android:viewportWidth="1"
  android:viewportHeight="1">
  <path
    android:fillColor="#00000000"
    android:pathData="M0,0h1v1h-1z" />
</vector>
`;

const v31StylesXml = `<resources xmlns:tools="http://schemas.android.com/tools">
  <style name="Theme.App.SplashScreen" parent="AppTheme">
    <item name="android:windowBackground">@drawable/ic_launcher_background</item>
    <item name="android:windowSplashScreenBackground">@color/splashscreen_background</item>
    <item name="android:windowSplashScreenAnimatedIcon">@drawable/splashscreen_transparent_icon</item>
    <item name="android:windowSplashScreenIconBackgroundColor">@android:color/transparent</item>
  </style>
</resources>
`;

async function writeIfChanged(filePath, contents) {
  let currentContents = null;

  try {
    currentContents = await fs.promises.readFile(filePath, "utf8");
  } catch {}

  if (currentContents !== contents) {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, contents);
  }
}

function upsertSplashBackgroundColor(contents) {
  const colorTagPattern =
    /<color\s+name="splashscreen_background">[^<]*<\/color>/;
  const colorTag =
    `<color name="splashscreen_background">${splashBackgroundColor}</color>`;

  if (colorTagPattern.test(contents)) {
    return contents.replace(colorTagPattern, colorTag);
  }

  return contents.replace(/<\/resources>\s*$/, `  ${colorTag}\n</resources>\n`);
}

function upsertLegacySplashWindowBackground(contents) {
  const splashStylePattern =
    /<style\s+name="Theme\.App\.SplashScreen"[^>]*>[\s\S]*?<\/style>/;
  const splashStyle = `  <style name="Theme.App.SplashScreen" parent="AppTheme">
    <item name="android:windowBackground">@drawable/ic_launcher_background</item>
  </style>`;

  if (splashStylePattern.test(contents)) {
    return contents.replace(splashStylePattern, splashStyle);
  }

  return contents.replace(/<\/resources>\s*$/, `${splashStyle}\n</resources>\n`);
}

function withAndroidBlankNativeSplash(config) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const resRoot = path.join(
        modConfig.modRequest.platformProjectRoot,
        "app/src/main/res",
      );
      const drawableRoot = path.join(resRoot, "drawable");
      const valuesRoot = path.join(resRoot, "values");
      const valuesV31Root = path.join(resRoot, "values-v31");

      await writeIfChanged(
        path.join(drawableRoot, "ic_launcher_background.xml"),
        launcherBackgroundXml,
      );
      await writeIfChanged(
        path.join(drawableRoot, "splashscreen_background.xml"),
        splashBackgroundDrawableXml,
      );
      await writeIfChanged(
        path.join(drawableRoot, "splashscreen_transparent_icon.xml"),
        transparentIconXml,
      );
      await writeIfChanged(
        path.join(valuesV31Root, "styles.xml"),
        v31StylesXml,
      );

      const colorsPath = path.join(valuesRoot, "colors.xml");
      if (fs.existsSync(colorsPath)) {
        const colorsContents = await fs.promises.readFile(colorsPath, "utf8");
        const nextColorsContents = upsertSplashBackgroundColor(colorsContents);

        if (nextColorsContents !== colorsContents) {
          await fs.promises.writeFile(colorsPath, nextColorsContents);
        }
      }

      const stylesPath = path.join(valuesRoot, "styles.xml");
      if (fs.existsSync(stylesPath)) {
        const stylesContents = await fs.promises.readFile(stylesPath, "utf8");
        const nextStylesContents =
          upsertLegacySplashWindowBackground(stylesContents);

        if (nextStylesContents !== stylesContents) {
          await fs.promises.writeFile(stylesPath, nextStylesContents);
        }
      }

      return modConfig;
    },
  ]);
}

module.exports = withAndroidBlankNativeSplash;
