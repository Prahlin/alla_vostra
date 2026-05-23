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
    height: 84,
    backgroundColor: "#f7b967",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 0,
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
      default: 35.86,
    }),
    lineHeight: Platform.select({
      web: 42,
      default: 44.3,
    }),
    color: "#FFFFFF",
    transform: [{ translateY: 2 }],
    whiteSpace: "nowrap",
  },

  shopButtonWrap: {
    width: "50%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 0,
  },

  shopButton: {
    width: Platform.select({
      web: 140,
      default: 98.44,
    }),
    height: Platform.select({
      web: 62,
      default: 43.59,
    }),
    borderRadius: Platform.select({
      web: 24,
      default: 16.88,
    }),
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  shopButtonText: {
    fontFamily: bodyFont,
    fontSize: Platform.select({
      web: 27,
      default: 18.98,
    }),
    lineHeight: Platform.select({
      web: 27,
      default: 18.98,
    }),
    fontWeight: "700",
    color: "#f7b967",
    textAlign: "center",
    includeFontPadding: false,
    transform: [{ translateY: Platform.OS === "web" ? 1 : 0.7 }],
  },

  carouselNavBar: {
    width: "100%",
    height: 84,
    backgroundColor: "#FFFCF2",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: Platform.OS === "web" ? "sticky" : "relative",
    top: 0,
    zIndex: 999999,
    elevation: 999999,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  },

  carouselInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 30,
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