import { Platform, StyleSheet } from "react-native";

const bodyFont = Platform.select({
  web: "TT Fors",
  default: "System",
});

export default StyleSheet.create({
shopMain: {
  width: "100%",
  paddingHorizontal: 24,
  paddingTop: 0,
  marginTop: -82,
  paddingBottom: 24,
  backgroundColor: "#FFFCF2",
  position: "relative",
  zIndex: 0,
},

  shopTitle: {
    fontFamily: bodyFont,
    fontSize: 36,
    lineHeight: 43,
    color: "#111111",
    textAlign: "center",
    marginBottom: 28,
  },

  shippingWrap: {
    width: "100%",
    alignItems: "center",
    marginBottom: 36,
  },

  shippingPill: {
    width: "100%",
    minHeight: 68,
    borderRadius: 18,
    backgroundColor: "#f7b967",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  shippingText: {
    fontFamily: bodyFont,
    fontSize: 24,
    lineHeight: 30,
    color: "#111111",
    textAlign: "center",
    fontWeight: "700",
  },

  shippingConnector: {
    fontFamily: bodyFont,
    fontSize: 25,
    lineHeight: 34,
    color: "#f7b967",
    fontWeight: "700",
    marginVertical: 7,
  },

  productList: {
    width: "100%",
    gap: 30,
  },

  productCard: {
    width: "100%",
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    boxShadow: "0 8px 18px rgba(0, 0, 0, 0.08)",
    elevation: 3,
  },

  productImage: {
    width: "100%",
    height: 315,
    backgroundColor: "#f7b967",
  },

  productTextWrap: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 26,
  },

  productName: {
    fontFamily: bodyFont,
    fontSize: 33,
    lineHeight: 39,
    color: "#111111",
    textAlign: "center",
    marginBottom: 4,
  },

  productPrice: {
    fontFamily: bodyFont,
    fontSize: 25,
    lineHeight: 31,
    color: "#f7b967",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },

  productDescription: {
    fontFamily: bodyFont,
    fontSize: 17,
    lineHeight: 27,
    color: "#111111",
    textAlign: "justify",
    marginBottom: 18,
  },

  productIncludesTitle: {
    fontFamily: bodyFont,
    fontSize: 19,
    lineHeight: 25,
    color: "#111111",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },

  productIncludesItem: {
    fontFamily: bodyFont,
    fontSize: 17,
    lineHeight: 25,
    color: "#111111",
    textAlign: "center",
  },

  paymentNote: {
    fontFamily: bodyFont,
    fontSize: 15,
    lineHeight: 22,
    color: "#111111",
    opacity: 0.55,
    textAlign: "center",
    marginTop: 26,
  },
});