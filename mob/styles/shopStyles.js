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

  width: 316,

  height: 231,

  marginBottom: -7,

},

shippingIconLarge: {

  width: 326,

  height: 228,

  marginBottom: 35,

},

productDescription: {

  width: "100%",

  fontFamily: bodyFont,

  fontSize: 18,

  lineHeight: 30,

  color: "#111111",

  textAlign: "justify",

  marginBottom: 22,

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

  plusSignWrap: {
    width: 55,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 22,
  },

  plusSignVertical: {
    position: "absolute",
    width: 10,
    height: 55,
    borderRadius: 5,
    backgroundColor: "#f7b967",
  },

  plusSignHorizontal: {
    position: "absolute",
    width: 55,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f7b967",
  },

  downArrowWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 22,
    transform: [{ scale: 1.0125 }],
  },

  downArrowShaft: {
    width: 16,
    height: 49,
    borderRadius: 8,
    backgroundColor: "#f7b967",
  },

  downArrowHeadWrap: {
    width: 86,
    height: 32,
    marginTop: -8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
  },

  downArrowHeadLeft: {
    width: 43,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#f7b967",
    marginRight: -11,
    transform: [{ rotate: "40deg" }],
  },

  downArrowHeadRight: {
    width: 43,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#f7b967",
    marginLeft: -11,
    transform: [{ rotate: "-40deg" }],
  },

  offersHeading: {
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