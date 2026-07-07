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
    paddingBottom: scaleVerticalGap(80),
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

  productCard: {
    width: "100%",
    alignItems: "center",
    marginBottom: scaleVerticalGap(42),
  },

  productSectionWrap: {
    width: "100%",
    alignItems: "center",
  },

  productImageWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scaleVerticalGap(52),
  },

  productImage: {
    width: "100%",
    height: 286,
    borderRadius: 0,
  },

  productTitle: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(34),
    lineHeight: scaleLineHeight(41),
    color: "#111111",
    textAlign: "center",
    marginBottom: scaleVerticalGap(36),
  },

  productDescription: {
    ...tightText,
    width: "100%",
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(18),
    lineHeight: scaleLineHeight(45),
    color: "#111111",
    textAlign: "justify",
    marginBottom: scaleVerticalGap(28),
  },

  productDetails: {
    width: "100%",
  },

  productLowerContent: {
    width: "100%",
    alignItems: "center",
  },

  includeSection: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.11)",
    paddingTop: scaleVerticalGap(12),
    paddingBottom: scaleVerticalGap(14),
  },

  includeHeaderRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: scaleVerticalGap(8),
  },

  includeTitle: {
    ...tightText,
    flex: 1,
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(18),
    lineHeight: scaleLineHeight(24),
    color: "#111111",
    paddingRight: scaleLayout(18),
  },

  includeAmount: {
    ...tightText,
    width: scaleLayout(64),
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(16),
    lineHeight: scaleLineHeight(24),
    color: "#111111",
    textAlign: "right",
  },

  includeItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  includeItemTriangleBorder: {
    position: "relative",
    width: 9.5,
    height: 14,
    marginRight: 8,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  includeItemTriangleOuter: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftWidth: 9.5,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#111111",
  },

  includeItemTriangle: {
    position: "absolute",
    top: 1,
    left: 0.5,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 8,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#f7b967",
  },

  includeItem: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(16),
    lineHeight: scaleLineHeight(25),
    color: "#111111",
  },

  includeNote: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(12),
    lineHeight: scaleLineHeight(17),
    color: "#111111",
    marginTop: scaleVerticalGap(5),
    opacity: 0.82,
  },

  buyButton: {
    width: scaleLayout(111),
    height: scaleLayout(55.5),
    borderRadius: scaleLayout(10.5),
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
    marginTop: scaleVerticalGap(28),
    overflow: "hidden",
  },

  buyButtonGradient: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  buyButtonPressed: {
    borderColor: "#888888",
  },

  buyButtonText: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: responsiveFontSize(15.84),
    lineHeight: scaleLineHeight(19.8),
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
