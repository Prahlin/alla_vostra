import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");
const viewportWidth = Math.min(width, height);
const viewportHeight = Math.max(width, height);
const nativeBaseWidth = 411;
const nativeBaseHeight = 914;
const isNative = Platform.OS !== "web";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round(value) {
  return Math.round(value * 100) / 100;
}

export const verticalGapScale = isNative
  ? clamp(viewportHeight / nativeBaseHeight, 0.78, 1)
  : 1;
export const textScale = isNative
  ? clamp(viewportWidth / nativeBaseWidth, 0.94, 1.03)
  : 1;
export const lineHeightScale = isNative
  ? clamp((textScale + verticalGapScale) / 2, 0.88, 1.02)
  : 1;
export const layoutScale = isNative
  ? clamp(viewportWidth / nativeBaseWidth, 0.9, 1.04)
  : 1;

export const mainHorizontalPadding = isNative
  ? round(clamp(viewportWidth * 0.058, 18, 26))
  : 24;
export const mainMaxWidth = isNative
  ? round(Math.min(viewportWidth, 420))
  : "100%";

export const mainScreenContentTopInsetBase = Platform.OS === "web"
  ? 534
  : scaleVerticalGap(354);
export const mainScreenInnerTopPadding = scaleVerticalGap(24);
export const compactHeaderVisibleInsetBase = Platform.OS === "web"
  ? 84
  : scaleVerticalGap(104);

export const mainScreenPageTitleHeight = scaleVerticalGap(46);
export const mainScreenPageTitleMarginBottom = scaleVerticalGap(168);
export const mainScreenHiddenDividerGap = scaleVerticalGap(193);
export const mainScreenIntroSpacerHeight = round(
  mainScreenPageTitleHeight +
    mainScreenPageTitleMarginBottom +
    mainScreenHiddenDividerGap,
);

export function scaleLayout(value) {
  return round(value * layoutScale);
}

export function scaleLineHeight(value) {
  return round(value * lineHeightScale);
}

export function scaleText(value) {
  return round(value * textScale);
}

export function scaleVerticalGap(value) {
  return round(value * verticalGapScale);
}

export function responsiveFontSize(size) {
  const scaledSize = scaleText(size);

  return Platform.select({
    ios: scaledSize - 2,
    default: scaledSize,
  });
}

export function getFeatureImageWidth(windowWidth = viewportWidth) {
  const bleedRatio = viewportHeight < 720 ? 1.02 : viewportHeight > 930 ? 1 : 1.05;
  const maxBleedWidth = typeof mainMaxWidth === "number"
    ? mainMaxWidth + mainHorizontalPadding * 0.9
    : windowWidth * bleedRatio;

  return round(Math.min(windowWidth * bleedRatio, maxBleedWidth));
}
