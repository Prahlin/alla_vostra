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
    paddingTop: 71.5,
  },

  shippingTitle: {
    width: "100%",
    paddingHorizontal: 22,
    marginBottom: 84,
  },

  shippingTitleLine: {
    width: "100%",
    fontFamily: logoFont,
    fontSize: Platform.select({
      web: 52.5,
      default: 47.5,
    }),
    lineHeight: Platform.select({
      web: 60,
      default: 55,
    }),
    color: "#111111",
    textAlign: "center",
  },

  shippingTitleBodyLine: {
    fontFamily: "TT Fors",
  },

  shippingTitleWithLine: {
    fontFamily: "TT Fors Light",
    fontSize: Platform.select({
      web: 36.09375,
      default: 32.65625,
    }),
    lineHeight: Platform.select({
      web: 41.25,
      default: 37.8125,
    }),
  },

  shippingTitleLogoLine: {
    marginTop: 20.625,
    fontSize: Platform.select({
      web: 94.5,
      default: 85.5,
    }),
    lineHeight: Platform.select({
      web: 108,
      default: 99,
    }),
  },

  shippingTitleVostraLine: {
    marginTop: -22,
  },

  shippingPreviewRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 48,
  },

  shippingPreviewIcon: {
    width: 99.066,
    height: 72.4185,
    marginHorizontal: 2.5,
  },

  shippingPreviewIconTruck: {
    width: 114.42123,
    height: 83.6433675,
    marginHorizontal: 2.5,
    transform: [{ translateY: 3 }],
  },

  shippingPreviewIconLarge: {
    width: 102.201,
    height: 71.478,
    marginHorizontal: 2.5,
  },

  shippingPreviewIconSoflo: {
    width: 102.201,
    height: 71.478,
    marginHorizontal: 2.5,
    transform: [{ translateY: -3 }],
  },

  shippingPreviewDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(17, 17, 17, 0.13)",
    marginTop: 48,
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

  width: 300.2,

  height: 219.45,

  marginBottom: -7,

},

shippingIconReducedGap: {

  marginBottom: -30.45,

},

shippingIconLarge: {

  width: 309.7,

  height: 216.6,

  marginBottom: 35,

},

shippingIconLargeReducedGap: {

  marginBottom: 9.45,

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
    width: 10,
    height: 55,
    borderRadius: 5,
    backgroundColor: "#f7b967",
    transform: [{ translateY: 10 }],
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
    width: 38.7,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f7b967",
    marginRight: -7.735,
    transform: [{ rotate: "43.3deg" }],
  },

  downArrowHeadRight: {
    width: 38.7,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f7b967",
    marginLeft: -7.735,
    transform: [{ rotate: "-43.3deg" }],
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
