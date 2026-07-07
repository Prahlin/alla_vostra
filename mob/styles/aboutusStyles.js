import { StyleSheet } from "react-native";

import { bodyFont, signatureFont, tightText } from "./typography";
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

  aboutLayout: {
    width: "100%",
    alignItems: "center",
  },

  aboutSection: {
    width: "100%",
    alignItems: "center",
  },

  imageWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scaleVerticalGap(68),
  },

  aboutImage: {
    width: "100%",
    height: 286,
    borderRadius: 0,
  },

  copy: {
    width: "100%",
  },

  paragraph: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(18),
    lineHeight: scaleLineHeight(46.5),
    color: "#111111",
    textAlign: "justify",
    marginBottom: scaleVerticalGap(28),
  },

  paragraphSectionGap: {
    marginBottom: scaleVerticalGap(56),
  },

  signature: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(21),
    lineHeight: scaleLineHeight(31),
    color: "#111111",
    textAlign: "left",
    marginTop: scaleVerticalGap(2),
  },

  signatureBlock: {
    width: "100%",
    alignItems: "flex-start",
  },

  signatureSpacer: {
    height: scaleVerticalGap(46.5),
  },

  signatureName: {
    fontFamily: signatureFont,
    fontSize: responsiveFontSize(84),
    lineHeight: scaleLineHeight(124),
  },

  signatureNameCentered: {
    alignSelf: "center",
    paddingLeft: mainHorizontalPadding,
    paddingRight: mainHorizontalPadding,
    textAlign: "center",
  },
});
