const fs = require("fs");
const path = require("path");

const { withDangerousMod } = require("@expo/config-plugins");

const materialThemeParent = "Theme.MaterialComponents.DayNight.NoActionBar.Bridge";
const appThemeParentPattern = /(<style\s+name="AppTheme"\s+parent=")[^"]+(")/;
const splashNavigationBarColor = "#EDB061";
const mainActivitySystemBarSetup = `    WindowCompat.setDecorFitsSystemWindows(window, false)
    window.statusBarColor = Color.TRANSPARENT
    window.navigationBarColor = Color.parseColor("${splashNavigationBarColor}")
    WindowCompat.getInsetsController(window, window.decorView).apply {
      isAppearanceLightStatusBars = false
      isAppearanceLightNavigationBars = true
    }`;
const mainActivitySystemBarSetupPattern =
  /\n\s*WindowCompat\.setDecorFitsSystemWindows\(window, false\)\n\s*window\.statusBarColor = [^\n]+\n\s*window\.navigationBarColor = [^\n]+\n\s*WindowCompat\.getInsetsController\(window, window\.decorView\)\.apply \{\n\s*isAppearanceLightStatusBars = [^\n]+\n\s*isAppearanceLightNavigationBars = [^\n]+\n\s*\}/;

function addImport(contents, importLine, beforeImportLine) {
  if (contents.includes(importLine)) {
    return contents;
  }

  if (contents.includes(beforeImportLine)) {
    return contents.replace(beforeImportLine, `${importLine}\n${beforeImportLine}`);
  }

  return contents.replace(
    /(package\s+[^\n]+\n)/,
    `$1\n${importLine}\n`,
  );
}

function addMainActivityStatusBarSetup(contents) {
  let nextContents = addImport(
    contents,
    "import android.graphics.Color",
    "import android.os.Build",
  );
  nextContents = addImport(
    nextContents,
    "import androidx.core.view.WindowCompat",
    "import expo.modules.ReactActivityDelegateWrapper",
  );

  nextContents = nextContents.replace(mainActivitySystemBarSetupPattern, "");

  return nextContents.replace(
    /(super\.onCreate\([^)]*\))/,
    `$1\n${mainActivitySystemBarSetup}`,
  );
}

function withAndroidMaterialComponentsTheme(config) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const stylesPath = path.join(
        modConfig.modRequest.platformProjectRoot,
        "app/src/main/res/values/styles.xml",
      );

      if (!fs.existsSync(stylesPath)) {
        return modConfig;
      }

      const contents = await fs.promises.readFile(stylesPath, "utf8");
      const nextContents = contents.replace(
        appThemeParentPattern,
        `$1${materialThemeParent}$2`,
      );

      if (nextContents !== contents) {
        await fs.promises.writeFile(stylesPath, nextContents);
      }

      const mainActivityPath = path.join(
        modConfig.modRequest.platformProjectRoot,
        "app/src/main/java/com/allavostra/app/MainActivity.kt",
      );

      if (fs.existsSync(mainActivityPath)) {
        const mainActivityContents = await fs.promises.readFile(
          mainActivityPath,
          "utf8",
        );
        const nextMainActivityContents = addMainActivityStatusBarSetup(
          mainActivityContents,
        );

        if (nextMainActivityContents !== mainActivityContents) {
          await fs.promises.writeFile(mainActivityPath, nextMainActivityContents);
        }
      }

      return modConfig;
    },
  ]);
}

module.exports = withAndroidMaterialComponentsTheme;
