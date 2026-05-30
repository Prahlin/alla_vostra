import { Platform, StyleSheet } from "react-native";

const bodyFont = Platform.select({
  web: "TT Fors",
  default: "System",
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
    fontFamily: bodyFont,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: "400",
    color: "#333333",
    textAlign: "center",
    marginBottom: 32,
  },

  productCard: {
    width: "100%",
    alignItems: "center",
    marginBottom: 42,
  },

  productImageWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
  },

  productImage: {
    width: "100%",
    height: 286,
    borderRadius: 0,
  },

  productTitle: {
    fontFamily: bodyFont,
    fontSize: 34,
    lineHeight: 41,
    color: "#111111",
    textAlign: "center",
    marginBottom: 18,
  },

  productDescription: {
    width: "100%",
    fontFamily: bodyFont,
    fontSize: 18,
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
    flex: 1,
    fontFamily: bodyFont,
    fontSize: 18,
    lineHeight: 24,
    color: "#111111",
    paddingRight: 18,
  },

  includeAmount: {
    width: 64,
    fontFamily: bodyFont,
    fontSize: 16,
    lineHeight: 24,
    color: "#111111",
    textAlign: "right",
  },

  includeItem: {
    fontFamily: bodyFont,
    fontSize: 16,
    lineHeight: 25,
    color: "#111111",
  },

  includeNote: {
    fontFamily: bodyFont,
    fontSize: 12,
    lineHeight: 17,
    color: "#111111",
    marginTop: 5,
    opacity: 0.82,
  },
});
