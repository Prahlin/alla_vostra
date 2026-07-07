import { StyleSheet } from "react-native";

import { thickBlackBorder } from "./borderEffects";
import { bodyFont, tightText } from "./typography";
import {
  mainHorizontalPadding,
  mainMaxWidth,
  mainScreenContentTopInsetBase,
  mainScreenInnerTopPadding,
  mainScreenPageTitleHeight,
  mainScreenPageTitleMarginBottom,
  responsiveFontSize,
  scaleLayout,
  scaleLineHeight,
  scaleVerticalGap,
} from "../utils/responsiveLayout";

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },

  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },

  scrollContent: {
    backgroundColor: "transparent",
    paddingTop: mainScreenContentTopInsetBase,
    paddingBottom: scaleVerticalGap(82),
  },

  main: {
    width: "100%",
    maxWidth: mainMaxWidth,
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: mainHorizontalPadding,
    paddingTop: mainScreenInnerTopPadding,
  },

  pageTitle: {
    ...tightText,
    height: mainScreenPageTitleHeight,
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(38),
    lineHeight: scaleLineHeight(46),
    fontWeight: "400",
    color: "#333333",
    textAlign: "center",
    marginBottom: mainScreenPageTitleMarginBottom,
  },

  introText: {
    ...tightText,
    width: "100%",
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(21),
    lineHeight: scaleLineHeight(48),
    color: "#111111",
    textAlign: "center",
    marginBottom: scaleVerticalGap(18),
  },

  formCard: {
    width: "100%",
    marginTop: scaleVerticalGap(22),
    alignItems: "center",
  },

  label: {
    ...tightText,
    width: "100%",
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(18),
    lineHeight: scaleLineHeight(26),
    color: "#111111",
    textAlign: "center",
    marginBottom: scaleVerticalGap(8),
  },

  input: {
    ...tightText,
    width: "100%",
    minHeight: 48,
    borderWidth: 1,
    borderColor: "rgba(17, 17, 17, 0.24)",
    borderRadius: 8,
    backgroundColor: "#FFFCF2",
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(17),
    lineHeight: scaleLineHeight(23),
    color: "#111111",
    paddingHorizontal: scaleLayout(14),
    paddingVertical: scaleVerticalGap(10),
    marginBottom: scaleVerticalGap(22),
  },

  inputFaulty: {
    backgroundColor: "#FFF4F2",
    borderColor: "rgba(155, 28, 28, 0.42)",
  },

  messageInput: {
    minHeight: scaleVerticalGap(180),
    paddingTop: scaleVerticalGap(14),
  },

  button: {
    width: scaleLayout(111),
    height: scaleLayout(55.5),
    borderRadius: scaleLayout(10.5),
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
    marginTop: scaleVerticalGap(6),
  },

  buttonDimmed: {
    opacity: 0.55,
  },

  buttonWrap: {
    alignItems: "center",
  },

  buttonText: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(17),
    lineHeight: scaleLineHeight(22),
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },

  statusText: {
    ...tightText,
    width: "100%",
    maxWidth: 300,
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(15),
    lineHeight: scaleLineHeight(21),
    color: "#555555",
    textAlign: "center",
    marginTop: scaleVerticalGap(14),
  },
});
