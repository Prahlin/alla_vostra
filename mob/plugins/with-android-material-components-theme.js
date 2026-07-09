const fs = require("fs");
const path = require("path");

const { withDangerousMod } = require("@expo/config-plugins");

const materialThemeParent = "Theme.MaterialComponents.DayNight.NoActionBar.Bridge";
const appThemeParentPattern = /(<style\s+name="AppTheme"\s+parent=")[^"]+(")/;

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

      return modConfig;
    },
  ]);
}

module.exports = withAndroidMaterialComponentsTheme;
