import { Platform } from "react-native";

import {
  compactHeaderVisibleInsetBase,
  mainScreenContentTopInsetBase,
  mainScreenInnerTopPadding,
} from "./responsiveLayout";

export const isIOS = Platform.OS === "ios";
export const isWeb = Platform.OS === "web";

export const headerTopBarBaseHeight = 120;
export const headerCarouselHeight = 84;
export const headerHeroHeight = 430;
export const headerHeroOnlySpacerBaseHeight = 200;
export {
  compactHeaderVisibleInsetBase,
  mainScreenContentTopInsetBase,
  mainScreenInnerTopPadding,
};

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
      alwaysBounceHorizontal: false,
      alwaysBounceVertical: false,
      automaticallyAdjustContentInsets: false,
      automaticallyAdjustKeyboardInsets: false,
      bounces: false,
      canCancelContentTouches: true,
      contentInsetAdjustmentBehavior: "never",
      decelerationRate: 0.95,
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
