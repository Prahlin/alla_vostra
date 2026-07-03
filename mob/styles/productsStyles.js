import { Platform, StyleSheet } from "react-native";

import { thickBlackBorder } from "./borderEffects";
import { bodyFont, tightText } from "./typography";

const mainIOSFontSize = (size) =>
  Platform.select({
    ios: size - 2,
    default: size,
  });

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
    paddingTop: Platform.OS === "web" ? 534 : 354,
    paddingBottom: 80,
  },

  main: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  pageTitle: {
    ...tightText,
    height: 46,
    fontFamily: bodyFont,
    fontSize: mainIOSFontSize(38),
    lineHeight: 46,
    fontWeight: "400",
    color: "#333333",
    textAlign: "center",
    marginBottom: 168,
  },

  productCard: {
    width: "100%",
    alignItems: "center",
    marginBottom: 42,
  },

  productSectionWrap: {
    width: "100%",
    alignItems: "center",
  },

  productImageWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 52,
  },

  productImage: {
    width: "100%",
    height: 286,
    borderRadius: 0,
  },

  productTitle: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: mainIOSFontSize(34),
    lineHeight: 41,
    color: "#111111",
    textAlign: "center",
    marginBottom: 36,
  },

  productDescription: {
    ...tightText,
    width: "100%",
    fontFamily: bodyFont,
    fontSize: mainIOSFontSize(18),
    lineHeight: 45,
    color: "#111111",
    textAlign: "justify",
    marginBottom: 28,
  },

  productDetails: {
    width: "100%",
  },

  includeSection: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.11)",
    paddingTop: 12,
    paddingBottom: 14,
  },

  includeHeaderRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  includeTitle: {
    ...tightText,
    flex: 1,
    fontFamily: bodyFont,
    fontSize: mainIOSFontSize(18),
    lineHeight: 24,
    color: "#111111",
    paddingRight: 18,
  },

  includeAmount: {
    ...tightText,
    width: 64,
    fontFamily: bodyFont,
    fontSize: mainIOSFontSize(16),
    lineHeight: 24,
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
    fontSize: mainIOSFontSize(16),
    lineHeight: 25,
    color: "#111111",
  },

  includeNote: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: mainIOSFontSize(12),
    lineHeight: 17,
    color: "#111111",
    marginTop: 5,
    opacity: 0.82,
  },

  buyButton: {
    width: 111,
    height: 55.5,
    borderRadius: 10.5,
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },

  buyButtonPressed: {
    borderColor: "#888888",
  },

  buyButtonText: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: mainIOSFontSize(15.84),
    lineHeight: mainIOSFontSize(19.8),
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
