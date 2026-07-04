import { Animated, StyleSheet, View } from "react-native";

import {
  getMainScreenCompactTopLoadOffset,
  mainScreenCompactIntroSpacerHeight,
  mainScreenIntroSpacerHeight,
} from "../utils/mainScreenScrollContext";

export default function MainScreenIntroSpacer({
  compactTopLayout = false,
  pageTitleStyle,
  scrollY,
}) {
  const canAnimate =
    compactTopLayout && typeof scrollY?.interpolate === "function";
  const height = canAnimate
    ? scrollY.interpolate({
        inputRange: [0, getMainScreenCompactTopLoadOffset()],
        outputRange: [
          mainScreenIntroSpacerHeight,
          mainScreenCompactIntroSpacerHeight,
        ],
        extrapolate: "clamp",
      })
    : compactTopLayout
    ? mainScreenCompactIntroSpacerHeight
    : undefined;

  return (
    <Animated.View
      style={[
        styles.container,
        compactTopLayout && styles.clipped,
        compactTopLayout && { height },
      ]}
    >
      <View style={pageTitleStyle} />
      <View style={styles.hiddenDividerGap} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  clipped: {
    overflow: "hidden",
  },

  hiddenDividerGap: {
    height: 193,
  },
});
