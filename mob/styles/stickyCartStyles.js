import { Platform, StyleSheet } from "react-native";

import {
  tappableButtonShadowPlate,
  thickBlackBorder,
} from "./borderEffects";
import { bodyDemiBoldFont, tightText } from "./typography";
import {
  stickyButtonEdgeOffset,
  stickyButtonRadius,
  stickyButtonSize,
} from "../utils/stickyButtonLayout";

const standardStickyButtonSize = 55.5;
const scaleAndroidStickyButtonRelative = (value) =>
  Platform.OS === "android"
    ? stickyButtonSize * (value / standardStickyButtonSize)
    : value;

export default StyleSheet.create({
  frame: {
    position: "absolute",
    right: stickyButtonEdgeOffset,
    width: stickyButtonSize,
    height: stickyButtonSize,
    borderRadius: stickyButtonRadius,
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
    borderRadius: stickyButtonRadius,
  },

  button: {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius: stickyButtonRadius,
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  buttonFillClip: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: stickyButtonRadius,
    overflow: "hidden",
  },

  buttonGradient: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  buttonConfirmed: {
    backgroundColor: "#247C3A",
  },

  buttonForeground: {
    zIndex: 1,
    elevation: 1,
  },

  badge: {
    position: "absolute",
    top: scaleAndroidStickyButtonRelative(-7.284375),
    right: scaleAndroidStickyButtonRelative(-7.284375),
    width: scaleAndroidStickyButtonRelative(21.853125),
    height: scaleAndroidStickyButtonRelative(21.853125),
    borderRadius: scaleAndroidStickyButtonRelative(10.9265625),
    backgroundColor: "#247C3A",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    elevation: 2,
  },

  badgeText: {
    ...tightText,
    fontFamily: bodyDemiBoldFont,
    fontSize: scaleAndroidStickyButtonRelative(13.5),
    lineHeight: scaleAndroidStickyButtonRelative(13.5),
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    transform: [{ translateY: 1 }],
  },
});
