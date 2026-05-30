import { useCallback, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

const mainScreenContentTopInset = Platform.OS === "web" ? 534 : 354;
const magnifiedScale = 1.04;
const magnifyRampViewportRatio = 0.28;
const magnifyHoldViewportRatio = 0.4;
const magnifyHoldTopViewportRatio = (1 - magnifyHoldViewportRatio) / 2;
const magnifyHoldBottomViewportRatio =
  magnifyHoldTopViewportRatio + magnifyHoldViewportRatio;
const magnifyStartViewportRatio =
  magnifyHoldBottomViewportRatio + magnifyRampViewportRatio;
const magnifyEndViewportRatio =
  magnifyHoldTopViewportRatio - magnifyRampViewportRatio;

export default function CenterMagnifyView({ children, scrollY, style }) {
  const { height: viewportHeight } = useWindowDimensions();
  const [layout, setLayout] = useState(null);

  const handleLayout = useCallback(({ nativeEvent }) => {
    const nextLayout = nativeEvent.layout;

    setLayout((currentLayout) => {
      if (
        currentLayout &&
        Math.abs(currentLayout.y - nextLayout.y) < 0.5 &&
        Math.abs(currentLayout.height - nextLayout.height) < 0.5
      ) {
        return currentLayout;
      }

      return nextLayout;
    });
  }, []);

  const canMagnify =
    layout &&
    viewportHeight > 0 &&
    typeof scrollY?.interpolate === "function";

  const scale = canMagnify
    ? scrollY.interpolate({
        inputRange: [
          mainScreenContentTopInset +
            layout.y +
            layout.height / 2 -
            viewportHeight * magnifyStartViewportRatio,
          mainScreenContentTopInset +
            layout.y +
            layout.height / 2 -
            viewportHeight * magnifyHoldBottomViewportRatio,
          mainScreenContentTopInset +
            layout.y +
            layout.height / 2 -
            viewportHeight * magnifyHoldTopViewportRatio,
          mainScreenContentTopInset +
            layout.y +
            layout.height / 2 -
            viewportHeight * magnifyEndViewportRatio,
        ],
        outputRange: [1, magnifiedScale, magnifiedScale, 1],
        extrapolate: "clamp",
      })
    : 1;

  return (
    <Animated.View
      onLayout={handleLayout}
      style={[styles.container, style, { transform: [{ scale }] }]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    zIndex: 10,
    elevation: 10,
  },
});
