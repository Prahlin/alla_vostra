import { Platform, StyleSheet } from "react-native";

import { thickBlackBorderWithShadow } from "./borderEffects";

const logoFont = "Dream Avenue";
const bodyFont = "TT Fors";
const arrowColor = "#111111";

export default StyleSheet.create({
  header: {
    width: "100%",
    position: "relative",
    backgroundColor: "transparent",
  },

  orangeBar: {
    position: "relative",
    width: "100%",
    paddingTop: 20,
    height: 120,
    backgroundColor: "#f7b967",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    zIndex: 1000000,
    elevation: 1000000,
  },

  orangeBarDimOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
    elevation: 1,
  },

  orangeBarBottomHairline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 0.375,
    backgroundColor: "rgba(17, 17, 17, 0.28)",
  },

  logoPressable: {
    width: "50%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 0,
    paddingRight: 0,
    overflow: "visible",
  },

  logoText: {
    fontFamily: logoFont,
    fontSize: Platform.select({
      web: 34,
      default: 34.07,
    }),
    lineHeight: Platform.select({
      web: 42,
      default: 42.09,
    }),
    fontWeight: "600",
    color: "#FFFFFF",
    transform: [{ translateY: 10 }],
    whiteSpace: "nowrap",
  },

  shopButtonWrap: {
    position: "relative",
    width: "50%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 0,
    transform: [{ translateY: 8 }],
  },

  shopButtonWrapSpotlight: {
    zIndex: 2,
    elevation: 2,
  },

  shopButton: {
    width: Platform.select({
      web: 140,
      default: 129.2,
    }),
    height: Platform.select({
      web: 62,
      default: 57.21,
    }),
    borderRadius: Platform.select({
      web: 24,
      default: 22.16,
    }),
    ...thickBlackBorderWithShadow,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  shopButtonText: {
    fontFamily: bodyFont,
    fontSize: Platform.select({
      web: 27,
      default: 24.92,
    }),
    lineHeight: Platform.select({
      web: 27,
      default: 24.92,
    }),
    fontWeight: "700",
    color: "#f7b967",
    textAlign: "center",
    includeFontPadding: false,
    transform: [{ translateY: Platform.OS === "web" ? 1 : 0.92 }],
  },

  carouselShell: {
    width: "100%",
    position: Platform.OS === "web" ? "sticky" : "relative",
    top: 0,
    zIndex: 999999,
    elevation: 999999,
  },

  carouselNavBar: {
    width: "100%",
    height: 84,
    backgroundColor: "#FFFCF2",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
    zIndex: 2,
    elevation: Platform.OS === "web" ? 2 : 0,
    boxShadow:
      Platform.OS === "web" ? "0 6px 18px rgba(0, 0, 0, 0.12)" : undefined,
    shadowColor: "#000000",
    shadowOpacity: Platform.OS === "web" ? 0.12 : 0,
    shadowRadius: Platform.OS === "web" ? 18 : 0,
    shadowOffset: { width: 0, height: Platform.OS === "web" ? 6 : 0 },
  },

  carouselStickyExpansion: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 84,
    height: 20,
    overflow: "hidden",
    zIndex: 1,
    elevation: 0,
  },

  carouselStickyExpansionFill: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFCF2",
  },

  headerCenterShadow: {
    position: "absolute",
    left: "50%",
    top: Platform.OS === "web" ? 140.5 : 116.5,
    width: 127.5,
    height: 127.5,
    marginLeft: -63.75,
    borderRadius: 63.75,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Platform.OS === "web" ? "transparent" : "rgba(0,0,0,0.00075)",
    backgroundImage:
      Platform.OS === "web"
        ? "radial-gradient(circle, rgba(0, 0, 0, 0.21) 0%, rgba(0, 0, 0, 0.15) 18%, rgba(0, 0, 0, 0.075) 38%, rgba(0, 0, 0, 0.015) 58%, rgba(0, 0, 0, 0.00075) 78%, rgba(0, 0, 0, 0.0) 100%)"
        : undefined,
    zIndex: 0,
    elevation: 0,
    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },

  heroOnlySpacer: {
    height: 200,
  },

  centerShadowLayer1: {
    position: "absolute",
    width: 191.25,
    height: 191.25,
    borderRadius: 95.625,
    backgroundColor: "rgba(0,0,0,0.0000)",
  },

  centerShadowLayer2: {
    position: "absolute",
    width: 187,
    height: 187,
    borderRadius: 93.5,
    backgroundColor: "rgba(0,0,0,0.000075)",
  },

  centerShadowLayer3: {
    position: "absolute",
    width: 182.25,
    height: 182.25,
    borderRadius: 91.125,
    backgroundColor: "rgba(0,0,0,0.00015)",
  },

  centerShadowLayer4: {
    position: "absolute",
    width: 178,
    height: 178,
    borderRadius: 89,
    backgroundColor: "rgba(0,0,0,0.0002625)",
  },

  centerShadowLayer5: {
    position: "absolute",
    width: 173.25,
    height: 173.25,
    borderRadius: 86.625,
    backgroundColor: "rgba(0,0,0,0.0004125)",
  },

  centerShadowLayer6: {
    position: "absolute",
    width: 169,
    height: 169,
    borderRadius: 84.5,
    backgroundColor: "rgba(0,0,0,0.0006)",
  },

  centerShadowLayer7: {
    position: "absolute",
    width: 164.25,
    height: 164.25,
    borderRadius: 82.125,
    backgroundColor: "rgba(0,0,0,0.000825)",
  },

  centerShadowLayer8: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(0,0,0,0.0010875)",
  },

  centerShadowLayer9: {
    position: "absolute",
    width: 155.25,
    height: 155.25,
    borderRadius: 77.625,
    backgroundColor: "rgba(0,0,0,0.0013875)",
  },

  centerShadowLayer10: {
    position: "absolute",
    width: 151,
    height: 151,
    borderRadius: 75.5,
    backgroundColor: "rgba(0,0,0,0.001725)",
  },

  centerShadowLayer11: {
    position: "absolute",
    width: 146.25,
    height: 146.25,
    borderRadius: 73.125,
    backgroundColor: "rgba(0,0,0,0.0021)",
  },

  centerShadowLayer12: {
    position: "absolute",
    width: 142,
    height: 142,
    borderRadius: 71,
    backgroundColor: "rgba(0,0,0,0.00255)",
  },

  centerShadowLayer13: {
    position: "absolute",
    width: 137.25,
    height: 137.25,
    borderRadius: 68.625,
    backgroundColor: "rgba(0,0,0,0.003075)",
  },

  centerShadowLayer14: {
    position: "absolute",
    width: 133,
    height: 133,
    borderRadius: 66.5,
    backgroundColor: "rgba(0,0,0,0.003675)",
  },

  centerShadowLayer15: {
    position: "absolute",
    width: 128.25,
    height: 128.25,
    borderRadius: 64.125,
    backgroundColor: "rgba(0,0,0,0.00435)",
  },

  centerShadowLayer16: {
    position: "absolute",
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: "rgba(0,0,0,0.0051)",
  },

  centerShadowLayer17: {
    position: "absolute",
    width: 119.25,
    height: 119.25,
    borderRadius: 59.625,
    backgroundColor: "rgba(0,0,0,0.005925)",
  },

  centerShadowLayer18: {
    position: "absolute",
    width: 115,
    height: 115,
    borderRadius: 57.5,
    backgroundColor: "rgba(0,0,0,0.006825)",
  },

  centerShadowLayer19: {
    position: "absolute",
    width: 110.25,
    height: 110.25,
    borderRadius: 55.125,
    backgroundColor: "rgba(0,0,0,0.0078)",
  },

  centerShadowLayer20: {
    position: "absolute",
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: "rgba(0,0,0,0.008925)",
  },

  centerShadowLayer21: {
    position: "absolute",
    width: 101.25,
    height: 101.25,
    borderRadius: 50.625,
    backgroundColor: "rgba(0,0,0,0.010125)",
  },

  centerShadowLayer22: {
    position: "absolute",
    width: 97,
    height: 97,
    borderRadius: 48.5,
    backgroundColor: "rgba(0,0,0,0.012)",
  },

  centerShadowLayer23: {
    position: "absolute",
    width: 92.25,
    height: 92.25,
    borderRadius: 46.125,
    backgroundColor: "rgba(0,0,0,0.01425)",
  },

  centerShadowLayer24: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(0,0,0,0.016875)",
  },

  centerShadowLayer25: {
    position: "absolute",
    width: 83.25,
    height: 83.25,
    borderRadius: 41.625,
    backgroundColor: "rgba(0,0,0,0.0195)",
  },

  centerShadowLayer26: {
    position: "absolute",
    width: 79,
    height: 79,
    borderRadius: 39.5,
    backgroundColor: "rgba(0,0,0,0.0225)",
  },

  centerShadowLayer27: {
    position: "absolute",
    width: 74.25,
    height: 74.25,
    borderRadius: 37.125,
    backgroundColor: "rgba(0,0,0,0.025875)",
  },

  centerShadowLayer28: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0,0,0,0.02925)",
  },

  centerShadowLayer29: {
    position: "absolute",
    width: 65.25,
    height: 65.25,
    borderRadius: 32.625,
    backgroundColor: "rgba(0,0,0,0.033)",
  },

  centerShadowLayer30: {
    position: "absolute",
    width: 61,
    height: 61,
    borderRadius: 30.5,
    backgroundColor: "rgba(0,0,0,0.03675)",
  },

  centerShadowLayer31: {
    position: "absolute",
    width: 56.25,
    height: 56.25,
    borderRadius: 28.125,
    backgroundColor: "rgba(0,0,0,0.0405)",
  },

  centerShadowLayer32: {
    position: "absolute",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(0,0,0,0.04425)",
  },

  centerShadowLayer33: {
    position: "absolute",
    width: 47.25,
    height: 47.25,
    borderRadius: 23.625,
    backgroundColor: "rgba(0,0,0,0.048)",
  },

  centerShadowLayer34: {
    position: "absolute",
    width: 43,
    height: 43,
    borderRadius: 21.5,
    backgroundColor: "rgba(0,0,0,0.05175)",
  },

  centerShadowLayer35: {
    position: "absolute",
    width: 38.25,
    height: 38.25,
    borderRadius: 19.125,
    backgroundColor: "rgba(0,0,0,0.0555)",
  },

  centerShadowLayer36: {
    position: "absolute",
    width: 34.5,
    height: 34.5,
    borderRadius: 17.25,
    backgroundColor: "rgba(0,0,0,0.05925)",
  },

  carouselInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    zIndex: 3,
    elevation: 3,
  },

  carouselActiveWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 164,
    height: 46,
    overflow: "visible",
  },

  carouselActiveText: {
    fontFamily: bodyFont,
    fontSize: 33,
    fontWeight: "300",
    color: "#111111",
    opacity: 0.82,
    textAlign: "center",
  },

  carouselActiveTextLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },

  carouselIndicatorBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 6,
    overflow: "hidden",
    zIndex: 4,
    elevation: 0,
  },

  carouselIndicatorSeparator: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 6,
    height: 0.375,
    backgroundColor: "rgba(17, 17, 17, 0.28)",
    opacity: 1,
    zIndex: 5,
    elevation: 0,
  },

  carouselIndicatorTrack: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },

  carouselIndicatorSegment: {
    flex: 1,
    height: "100%",
    backgroundColor: "#FFFCF2",
  },

  carouselIndicatorActiveSegment: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    height: "100%",
    backgroundColor: "#f7b967",
    zIndex: 2,
    elevation: 0,
  },

  arrowBox: {
    width: 32,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  arrowChevron: {
    width: 27,
    height: 27,
    borderTopWidth: 5.625,
    borderColor: arrowColor,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },

  arrowChevronLeft: {
    borderLeftWidth: 5.625,
    transform: [{ rotate: "-45deg" }],
  },

  arrowChevronRight: {
    borderRightWidth: 5.625,
    transform: [{ rotate: "45deg" }],
  },

  hero: {
    width: "100%",
    height: 430,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "transparent",
    zIndex: 1,
  },

  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },

  heroVerticalFadePanel: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 600,
    zIndex: 2,
    elevation: 2,
  },

  heroVerticalFadeFeather: {
    width: "100%",
    height: 170,
  },

  heroVerticalFadeSolid: {
    width: "100%",
    height: 430,
  },
});
