import { StyleSheet } from "react-native";

import {
  tappableButtonShadowPlate,
  thickBlackBorder,
} from "./borderEffects";
import {
  stickyButtonEdgeOffset,
  stickyButtonSize,
} from "../utils/stickyButtonLayout";

const stickyQuestionButtonRadius = stickyButtonSize / 2;

export default StyleSheet.create({
  frame: {
    position: "absolute",
    left: stickyButtonEdgeOffset,
    width: stickyButtonSize,
    height: stickyButtonSize,
    borderRadius: stickyQuestionButtonRadius,
    zIndex: 1000002,
    elevation: 1000002,
    overflow: "visible",
  },

  shadowPlate: {
    ...tappableButtonShadowPlate,
    backgroundColor: "transparent",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: stickyQuestionButtonRadius,
  },

  button: {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius: stickyQuestionButtonRadius,
    backgroundColor: "transparent",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  buttonFillClip: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: stickyQuestionButtonRadius,
    opacity: 0.98,
    overflow: "hidden",
  },

  buttonFill: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#FFFFFF",
  },

  buttonForeground: {
    zIndex: 1,
    elevation: 1,
  },
});
