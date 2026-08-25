const {
  AndroidConfig,
  withAndroidManifest,
  withAndroidStyles,
} = require("@expo/config-plugins");

const materialThemeParent = "Theme.MaterialComponents.DayNight.NoActionBar.Bridge";
const appThemeGroup = AndroidConfig.Styles.getAppThemeGroup();

function removeMainActivityOrientationAttribute(config) {
  return withAndroidManifest(config, (modConfig) => {
    const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(
      modConfig.modResults,
    );

    delete mainActivity.$["android:screenOrientation"];

    return modConfig;
  });
}

function withAppThemeStyles(config) {
  return withAndroidStyles(config, (modConfig) => {
    const appTheme = AndroidConfig.Styles.getStyleParent(
      modConfig.modResults,
      appThemeGroup,
    );

    if (appTheme?.$) {
      appTheme.$.parent = materialThemeParent;
    }

    AndroidConfig.Styles.removeStylesItem({
      name: "android:statusBarColor",
      parent: appThemeGroup,
      xml: modConfig.modResults,
    });

    return modConfig;
  });
}

function withAndroidMaterialComponentsTheme(config) {
  config = removeMainActivityOrientationAttribute(config);
  return withAppThemeStyles(config);
}

module.exports = withAndroidMaterialComponentsTheme;
