import { Platform, StyleSheet } from "react-native";

const logoFont = "Dream Avenue";
const bodyFont = Platform.select({
  web: "TT Fors",
  default: "System",
});

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFCF2",
  },

  scroll: {
    flex: 1,
    backgroundColor: "#FFFCF2",
  },

  scrollContent: {
    backgroundColor: "#FFFCF2",
    paddingBottom: 86,
  },

  main: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 52,
  },

  shippingTitle: {
    width: "100%",
    fontFamily: logoFont,
    fontSize: Platform.select({
      web: 42,
      default: 38,
    }),
    lineHeight: Platform.select({
      web: 48,
      default: 44,
    }),
    color: "#111111",
    textAlign: "center",
    marginBottom: 42,
  },

  shippingStack: {
    width: "100%",
    alignItems: "center",
    marginBottom: 58,
  },

  shippingBlock: {
    width: "100%",
    alignItems: "center",
  },

  shippingIcon: {
    width: 220,
    height: 150,
    marginBottom: 18,
  },

  shippingPill: {
    width: "100%",
    minHeight: 96,
    borderRadius: 28,
    backgroundColor: "#f7b967",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 18,
  },

  shippingPillText: {
    fontFamily: bodyFont,
    fontSize: 31,
    lineHeight: 37,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },

  plusSign: {
    fontFamily: bodyFont,
    fontSize: 54,
    lineHeight: 62,
    fontWeight: "700",
    color: "#f7b967",
    textAlign: "center",
    marginVertical: 22,
  },

  inText: {
    fontFamily: bodyFont,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: "700",
    color: "#f7b967",
    textAlign: "center",
    marginVertical: 22,
  },

  productsList: {
    width: "100%",
    alignItems: "center",
  },

  productCard: {
    width: "100%",
    alignItems: "center",
    marginBottom: 62,
  },

  productImage: {
    width: 324,
    height: 324,
    borderRadius: 162,
    marginBottom: 24,
  },

  productName: {
    fontFamily: bodyFont,
    fontSize: 34,
    lineHeight: 41,
    color: "#111111",
    textAlign: "center",
    marginBottom: 16,
  },

  productPrice: {
    fontFamily: bodyFont,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
    marginBottom: 20,
  },

  cartButton: {
    width: 180,
    height: 60,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#111111",
    backgroundColor: "#f7b967",
    alignItems: "center",
    justifyContent: "center",
  },

  cartButtonText: {
    fontFamily: bodyFont,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
});