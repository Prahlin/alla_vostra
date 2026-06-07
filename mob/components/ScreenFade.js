import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

export default function ScreenFade({ topOffset = 84 }) {
  return (
    <View pointerEvents="none" style={styles.overlay}>
      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(255, 252, 242, 0.24)",
          "rgba(255, 252, 242, 0.14)",
          "rgba(255, 252, 242, 0.045)",
          "rgba(255, 252, 242, 0.008)",
          "rgba(255, 252, 242, 0.001)",
          "rgba(255, 252, 242, 0)",
        ]}
        locations={[0, 0.14, 0.32, 0.52, 0.72, 1]}
        style={[styles.topFade, { top: topOffset }]}
      />

      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(255, 252, 242, 0)",
          "rgba(255, 252, 242, 0.001)",
          "rgba(255, 252, 242, 0.008)",
          "rgba(255, 252, 242, 0.045)",
          "rgba(255, 252, 242, 0.14)",
          "rgba(255, 252, 242, 0.24)",
        ]}
        locations={[0, 0.28, 0.48, 0.68, 0.86, 1]}
        style={styles.bottomFade}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 500000,
    elevation: 500000,
  },

  topFade: {
    position: "absolute",
    top: 84,
    left: 0,
    right: 0,
    height: 260,
  },

  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
});
