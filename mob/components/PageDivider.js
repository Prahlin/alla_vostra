import { Animated } from "react-native";

import sharedStyles from "../styles/sharedStyles";

const topDividerFadeScrollDistance = 240;

export default function PageDivider({
  expandedSpacing = false,
  fadeScrollDistance = topDividerFadeScrollDistance,
  fadeWithScrollY = null,
}) {
  const fadeOpacity = fadeWithScrollY?.interpolate({
    inputRange: [0, fadeScrollDistance],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        sharedStyles.pageDivider,
        expandedSpacing && sharedStyles.expandedPageDivider,
        fadeOpacity && { opacity: fadeOpacity },
      ]}
    />
  );
}
