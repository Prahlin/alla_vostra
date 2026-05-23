import { Platform, StyleSheet } from "react-native";

const logoFont = "Dream Avenue";
const bodyFont = "TT Fors";

export default StyleSheet.create({
  header: {
    width: "100%",
    backgroundColor: "#FFFCF2",
  },

  orangeBar: {
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
    color: "#FFFFFF",
    transform: [{ translateY: 10 }],
    whiteSpace: "nowrap",
  },

  shopButtonWrap: {
    width: "50%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 0,
    transform: [{ translateY: 8 }],
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
    elevation: 2,

    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.12)",

    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  carouselCenterShadow: {
    position: "absolute",
    left: "50%",
    bottom: Platform.OS === "web" ? -64 : -40,

    width: 127.5,
    height: 127.5,
    marginLeft: -63.75,
    borderRadius: 63.75,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor:
      Platform.OS === "web" ? "transparent" : "rgba(0,0,0,0.001)",

    backgroundImage:
      Platform.OS === "web"
        ? "radial-gradient(circle, rgba(0, 0, 0, 0.28) 0%, rgba(0, 0, 0, 0.2) 18%, rgba(0, 0, 0, 0.10) 38%, rgba(0, 0, 0, 0.02) 58%, rgba(0, 0, 0, 0.001) 78%, rgba(0, 0, 0, 0.0) 100%)"
        : undefined,

    zIndex: 1,
    elevation: 0,

    shadowColor: "#000000",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
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
    backgroundColor: "rgba(0,0,0,0.0001)",
  },

  centerShadowLayer3: {
    position: "absolute",
    width: 182.25,
    height: 182.25,
    borderRadius: 91.125,
    backgroundColor: "rgba(0,0,0,0.00025)",
  },

  centerShadowLayer4: {
    position: "absolute",
    width: 178,
    height: 178,
    borderRadius: 89,
    backgroundColor: "rgba(0,0,0,0.0004)",
  },

  centerShadowLayer5: {
    position: "absolute",
    width: 174,
    height: 174,
    borderRadius: 87,
    backgroundColor: "rgba(0,0,0,0.0005)",
  },

  centerShadowLayer6: {
    position: "absolute",
    width: 169.5,
    height: 169.5,
    borderRadius: 84.75,
    backgroundColor: "rgba(0,0,0,0.00065)",
  },

  centerShadowLayer7: {
    position: "absolute",
    width: 165,
    height: 165,
    borderRadius: 82.5,
    backgroundColor: "rgba(0,0,0,0.0008)",
  },

  centerShadowLayer8: {
    position: "absolute",
    width: 160.5,
    height: 160.5,
    borderRadius: 80.25,
    backgroundColor: "rgba(0,0,0,0.001)",
  },

  centerShadowLayer9: {
    position: "absolute",
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: "rgba(0,0,0,0.00125)",
  },

  centerShadowLayer10: {
    position: "absolute",
    width: 151.5,
    height: 151.5,
    borderRadius: 75.75,
    backgroundColor: "rgba(0,0,0,0.0015)",
  },

  centerShadowLayer11: {
    position: "absolute",
    width: 147,
    height: 147,
    borderRadius: 73.5,
    backgroundColor: "rgba(0,0,0,0.0019)",
  },

  centerShadowLayer12: {
    position: "absolute",
    width: 142.5,
    height: 142.5,
    borderRadius: 71.25,
    backgroundColor: "rgba(0,0,0,0.0024)",
  },

  centerShadowLayer13: {
    position: "absolute",
    width: 138,
    height: 138,
    borderRadius: 69,
    backgroundColor: "rgba(0,0,0,0.003)",
  },

  centerShadowLayer14: {
    position: "absolute",
    width: 133.5,
    height: 133.5,
    borderRadius: 66.75,
    backgroundColor: "rgba(0,0,0,0.00375)",
  },

  centerShadowLayer15: {
    position: "absolute",
    width: 129,
    height: 129,
    borderRadius: 64.5,
    backgroundColor: "rgba(0,0,0,0.0045)",
  },

  centerShadowLayer16: {
    position: "absolute",
    width: 124.5,
    height: 124.5,
    borderRadius: 62.25,
    backgroundColor: "rgba(0,0,0,0.0055)",
  },

  centerShadowLayer17: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0,0,0,0.00675)",
  },

  centerShadowLayer18: {
    position: "absolute",
    width: 115.5,
    height: 115.5,
    borderRadius: 57.75,
    backgroundColor: "rgba(0,0,0,0.008)",
  },

  centerShadowLayer19: {
    position: "absolute",
    width: 111,
    height: 111,
    borderRadius: 55.5,
    backgroundColor: "rgba(0,0,0,0.0095)",
  },

  centerShadowLayer20: {
    position: "absolute",
    width: 106.5,
    height: 106.5,
    borderRadius: 53.25,
    backgroundColor: "rgba(0,0,0,0.0115)",
  },

  centerShadowLayer21: {
    position: "absolute",
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: "rgba(0,0,0,0.0135)",
  },

  centerShadowLayer22: {
    position: "absolute",
    width: 97.5,
    height: 97.5,
    borderRadius: 48.75,
    backgroundColor: "rgba(0,0,0,0.016)",
  },

  centerShadowLayer23: {
    position: "absolute",
    width: 93,
    height: 93,
    borderRadius: 46.5,
    backgroundColor: "rgba(0,0,0,0.019)",
  },

  centerShadowLayer24: {
    position: "absolute",
    width: 88.5,
    height: 88.5,
    borderRadius: 44.25,
    backgroundColor: "rgba(0,0,0,0.0225)",
  },

  centerShadowLayer25: {
    position: "absolute",
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(0,0,0,0.026)",
  },

  centerShadowLayer26: {
    position: "absolute",
    width: 79.5,
    height: 79.5,
    borderRadius: 39.75,
    backgroundColor: "rgba(0,0,0,0.030)",
  },

  centerShadowLayer27: {
    position: "absolute",
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: "rgba(0,0,0,0.0345)",
  },

  centerShadowLayer28: {
    position: "absolute",
    width: 70.5,
    height: 70.5,
    borderRadius: 35.25,
    backgroundColor: "rgba(0,0,0,0.039)",
  },

  centerShadowLayer29: {
    position: "absolute",
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(0,0,0,0.044)",
  },

  centerShadowLayer30: {
    position: "absolute",
    width: 61.5,
    height: 61.5,
    borderRadius: 30.75,
    backgroundColor: "rgba(0,0,0,0.049)",
  },

  centerShadowLayer31: {
    position: "absolute",
    width: 57,
    height: 57,
    borderRadius: 28.5,
    backgroundColor: "rgba(0,0,0,0.054)",
  },

  centerShadowLayer32: {
    position: "absolute",
    width: 52.5,
    height: 52.5,
    borderRadius: 26.25,
    backgroundColor: "rgba(0,0,0,0.059)",
  },

  centerShadowLayer33: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.064)",
  },

  centerShadowLayer34: {
    position: "absolute",
    width: 43.5,
    height: 43.5,
    borderRadius: 21.75,
    backgroundColor: "rgba(0,0,0,0.069)",
  },

  centerShadowLayer35: {
    position: "absolute",
    width: 39,
    height: 39,
    borderRadius: 19.5,
    backgroundColor: "rgba(0,0,0,0.074)",
  },

  centerShadowLayer36: {
    position: "absolute",
    width: 34.5,
    height: 34.5,
    borderRadius: 17.25,
    backgroundColor: "rgba(0,0,0,0.079)",
  },

  carouselInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
    zIndex: 3,
    elevation: 3,
  },

  carouselActiveText: {
    fontFamily: bodyFont,
    fontSize: 33,
    fontWeight: "700",
    color: "#111111",
    opacity: 0.82,
    textAlign: "center",
  },

  arrowBox: {
    width: 27,
    height: 27,
  },

  arrowChevron: {
    width: 27,
    height: 27,
    borderTopWidth: 5.625,
    borderColor: "#111111",
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
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
    height: 330,
    overflow: "hidden",
    backgroundColor: "#FFFCF2",
    zIndex: 1,
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },
});