import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

export default function ScreenFade() {
  return (
    <View pointerEvents="none" style={styles.overlay}>
      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(255, 252, 242, 0.5)",
          "rgba(255, 252, 242, 0.46)",
          "rgba(255, 252, 242, 0.34)",
          "rgba(255, 252, 242, 0.16)",
          "rgba(255, 252, 242, 0)",
        ]}
        locations={[0, 0.18, 0.42, 0.7, 1]}
        style={styles.topFade}
      />

      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(255, 252, 242, 0)",
          "rgba(255, 252, 242, 0.175)",
          "rgba(255, 252, 242, 0.39)",
          "rgba(255, 252, 242, 0.5)",
        ]}
        locations={[0, 0.38, 0.72, 1]}
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