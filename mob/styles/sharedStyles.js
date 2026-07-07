import { Platform, StyleSheet } from "react-native";

import { bodyFont, tightText } from "./typography";
import {
  mainHorizontalPadding,
  mainMaxWidth,
  mainScreenContentTopInsetBase,
  mainScreenInnerTopPadding,
  mainScreenPageTitleHeight,
  mainScreenPageTitleMarginBottom,
  responsiveFontSize,
  scaleLineHeight,
  scaleVerticalGap,
} from "../utils/responsiveLayout";

const webMinHeight = Platform.OS === "web" ? "100vh" : undefined;
const globalDividerHorizontalInset = scaleVerticalGap(48);

export default StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: webMinHeight,
    backgroundColor: "transparent",
  },

  scroll: {
    flex: 1,
    minHeight: webMinHeight,
    backgroundColor: "transparent",
  },

  scrollContent: {
    minHeight: webMinHeight,
    backgroundColor: "transparent",
    paddingTop: mainScreenContentTopInsetBase,
    paddingBottom: scaleVerticalGap(56),
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
    fontSize: responsiveFontSize(36),
    lineHeight: scaleLineHeight(43),
    color: "#111111",
    textAlign: "center",
    marginBottom: mainScreenPageTitleMarginBottom,
  },

  featureBlock: {
    width: "100%",
    alignItems: "center",
    marginBottom: scaleVerticalGap(28),
  },

  featureImage: {
    width: "100%",
    height: 285,
    borderRadius: 0,
    backgroundColor: "#f7b967",
  },

  directionalImageBlendWrap: {
    position: "relative",
    overflow: "hidden",
  },

  topToBottomImageBlendPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 2,
    elevation: 2,
  },

  topToBottomImageBlendFeather: {
    width: "100%",
    height: 170,
  },

  topToBottomImageBlendSolid: {
    width: "100%",
  },

  featureTitle: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(31),
    lineHeight: scaleLineHeight(38),
    color: "#111111",
    textAlign: "center",
    marginTop: scaleVerticalGap(44),
    marginBottom: scaleVerticalGap(24),
  },

  featureText: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(18),
    lineHeight: scaleLineHeight(47),
    color: "#111111",
    textAlign: "justify",
  },

  pageDivider: {
    alignSelf: "stretch",
    height: 1,
    backgroundColor: "rgba(17, 17, 17, 0.13)",
    marginHorizontal: globalDividerHorizontalInset,
    marginTop: scaleVerticalGap(66),
    marginBottom: scaleVerticalGap(126),
  },

  expandedPageDivider: {
    marginTop: scaleVerticalGap(66),
    marginBottom: scaleVerticalGap(126),
  },
});
