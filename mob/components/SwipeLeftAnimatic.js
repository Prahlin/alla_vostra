import { Animated, Easing, StyleSheet, View } from "react-native";
import { useEffect, useRef } from "react";
import Svg, { Ellipse, G, Path } from "react-native-svg";

const baseWidth = 180;
const baseHeight = 76;
const defaultWidth = 172;
const loopDuration = 840;
const cycleDelay = 3000;
const resetDelay = 30;
const burstIterations = 2;

export default function SwipeLeftAnimatic({
  accentColor = "#E6A04D",
  disabled = false,
  height,
  lineColor = "#111111",
  style,
  width = defaultWidth,
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const visibility = useRef(new Animated.Value(0)).current;
  const resolvedHeight = height || Math.round(width * (baseHeight / baseWidth));
  const travelDistance = width * 0.24;

  useEffect(() => {
    progress.setValue(0);
    visibility.setValue(0);

    if (disabled) {
      return undefined;
    }

    const createSwipePass = () =>
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(visibility, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 1,
          duration: loopDuration,
          easing: Easing.bezier(0.2, 0.82, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.delay(resetDelay),
      ]);

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(visibility, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.delay(cycleDelay),
        ...Array.from({ length: burstIterations }, createSwipePass),
        Animated.timing(visibility, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [disabled, progress, visibility]);

  const fingerTranslateX = progress.interpolate({
    inputRange: [0, 0.82, 1],
    outputRange: [travelDistance, -travelDistance, -travelDistance],
    extrapolate: "clamp",
  });
  const fingerTranslateY = progress.interpolate({
    inputRange: [0, 0.82, 1],
    outputRange: [2, -1, -1],
    extrapolate: "clamp",
  });
  const fingerOpacity = progress.interpolate({
    inputRange: [0, 0.82, 0.94, 1],
    outputRange: [1, 1, 0, 0],
    extrapolate: "clamp",
  });
  const swooshTranslateX = progress.interpolate({
    inputRange: [0, 0.82, 1],
    outputRange: [
      travelDistance * 0.5,
      -travelDistance * 0.55,
      -travelDistance * 0.55,
    ],
    extrapolate: "clamp",
  });
  const swooshOpacity = progress.interpolate({
    inputRange: [0, 0.06, 0.82, 0.94, 1],
    outputRange: [0, 0.82, 1, 0, 0],
    extrapolate: "clamp",
  });
  const resolvedFingerOpacity = Animated.multiply(fingerOpacity, visibility);
  const resolvedSwooshOpacity = Animated.multiply(swooshOpacity, visibility);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.frame, { height: resolvedHeight, width }, style]}
    >
      <Animated.View
        style={[
          styles.layer,
          {
            opacity: resolvedSwooshOpacity,
            transform: [{ translateX: swooshTranslateX }],
          },
        ]}
      >
        <Svg
          height={resolvedHeight}
          viewBox={`0 0 ${baseWidth} ${baseHeight}`}
          width={width}
        >
          <G
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path
              d="M121 22C104 16 82 18 62 29"
              opacity={0.42}
              stroke={lineColor}
              strokeWidth={4}
            />
            <Path
              d="M127 35C106 27 79 31 53 46"
              stroke={accentColor}
              strokeWidth={5}
            />
            <Path
              d="M116 50C99 45 80 49 65 59"
              opacity={0.78}
              stroke={accentColor}
              strokeWidth={3.5}
            />
          </G>
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.layer,
          {
            opacity: resolvedFingerOpacity,
            transform: [
              { translateX: fingerTranslateX },
              { translateY: fingerTranslateY },
            ],
          },
        ]}
      >
        <Svg
          height={resolvedHeight}
          viewBox={`0 0 ${baseWidth} ${baseHeight}`}
          width={width}
        >
          <Ellipse
            cx={119}
            cy={64}
            fill="#000000"
            opacity={0.16}
            rx={26}
            ry={4}
          />
          <G transform="rotate(-8 121 40)">
            <Path
              d="M115 8C108 8 103 13.5 103 20.5V44L99 40C95.6 36.6 90.2 36.9 87.2 40.7C84.6 44 85 48.7 88 51.6L101.5 64.4C106 68.6 111.9 71 118.1 71H127C140.3 71 151 60.3 151 47V40.5C151 35.2 146.8 31 141.5 31C138.6 31 136.1 32.2 134.4 34.2C132.8 30.6 129.3 28 125 28C122.3 28 119.8 29 118 30.7V20.5C118 13.5 122 8 115 8Z"
              fill="#FFFFFF"
              stroke={lineColor}
              strokeLinejoin="round"
              strokeWidth={4}
            />
            <Path
              d="M118 21V49M128 34V51M139 38V52"
              fill="none"
              stroke={lineColor}
              strokeLinecap="round"
              strokeWidth={3.2}
            />
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "visible",
    position: "relative",
  },

  layer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});
