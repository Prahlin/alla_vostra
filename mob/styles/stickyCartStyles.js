import { Platform, StyleSheet } from "react-native";

import {
  tappableButtonShadowPlate,
  thickBlackBorder,
} from "./borderEffects";

const bodyFont = Platform.select({
  web: "TT Fors",
  default: "System",
});

export default StyleSheet.create({
  frame: {
    position: "absolute",
    right: 18,
    width: 55.5,
    height: 55.5,
    borderRadius: 10.5,
    zIndex: 1000002,
    elevation: 1000002,
    overflow: "visible",
  },

  shadowPlate: {
    ...tappableButtonShadowPlate,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 10.5,
  },

  button: {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius: 10.5,
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    position: "absolute",
    top: -7.284375,
    right: -7.284375,
    width: 21.853125,
    height: 21.853125,
    borderRadius: 10.9265625,
    backgroundColor: "#1f8f3a",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    elevation: 2,
  },

  badgeText: {
    fontFamily: bodyFont,
    fontSize: 15,
    lineHeight: 15,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    includeFontPadding: false,
  },
});
