import { Platform } from "react-native";

export const isIOS = Platform.OS === "ios";
export const isWeb = Platform.OS === "web";

export const headerTopBarBaseHeight = 120;
export const headerCarouselHeight = 84;
export const headerHeroHeight = 430;
export const headerHeroOnlySpacerBaseHeight = 200;
export const mainScreenContentTopInsetBase = isWeb ? 534 : 354;
export const mainScreenInnerTopPadding = 24;
export const compactHeaderVisibleInsetBase = isWeb ? 84 : 104;

export function getTopSafeInset(insets = null) {
  if (!isIOS) return 0;

  const top = insets?.top;
  return Number.isFinite(top) ? Math.max(0, top) : 0;
}

export function getHeaderTopBarHeight(insets = null) {
  return headerTopBarBaseHeight;
}

export function getMainScreenContentTopInset(insets = null) {
  return mainScreenContentTopInsetBase + getTopSafeInset(insets);
}

export function getCompactHeaderVisibleInset(insets = null) {
  return compactHeaderVisibleInsetBase + getTopSafeInset(insets);
}

export function getMainScreenScrollViewProps() {
  if (Platform.OS === "ios") {
    return {
      automaticallyAdjustContentInsets: false,
      automaticallyAdjustKeyboardInsets: false,
      bounces: true,
      canCancelContentTouches: true,
      contentInsetAdjustmentBehavior: "never",
      directionalLockEnabled: true,
      keyboardDismissMode: "interactive",
      keyboardShouldPersistTaps: "handled",
    };
  }

  return {
    directionalLockEnabled: true,
    keyboardShouldPersistTaps: "handled",
  };
}
