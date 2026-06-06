import { useCallback } from "react";

import { useHeaderScrollY } from "./headerScrollContext";

const oldHeaderMaxScroll = 1;
const newHeaderMinScroll = 720;

export function readAnimatedValue(animatedValue) {
  if (typeof animatedValue?.__getValue === "function") {
    return animatedValue.__getValue();
  }

  return 0;
}

export function isHeaderNavigationAllowed(scrollY) {
  const value = readAnimatedValue(scrollY);

  return value <= oldHeaderMaxScroll || value >= newHeaderMinScroll;
}

export function useHeaderNavigationGate(scrollY = null) {
  const contextScrollY = useHeaderScrollY();
  const resolvedScrollY = scrollY || contextScrollY;

  return useCallback(
    () => isHeaderNavigationAllowed(resolvedScrollY),
    [resolvedScrollY]
  );
}
