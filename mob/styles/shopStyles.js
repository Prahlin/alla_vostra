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
    paddingTop: 26.8125,
  },

  shippingTitle: {
    width: "100%",
    marginBottom: 84,
  },

  shippingTitleLine: {
    width: "100%",
    paddingHorizontal: 22,
    fontFamily: logoFont,
    fontSize: Platform.select({
      web: 39.375,
      default: 35.625,
    }),
    lineHeight: Platform.select({
      web: 45,
      default: 41.25,
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
      web: 27.0703125,
      default: 24.4921875,
    }),
    lineHeight: Platform.select({
      web: 30.9375,
      default: 28.359375,
    }),
  },

  shippingTitleLogoLine: {
    marginTop: 5.15625,
    fontSize: Platform.select({
      web: 70.875,
      default: 64.125,
    }),
    lineHeight: Platform.select({
      web: 81,
      default: 74.25,
    }),
  },

  shippingTitleVostraLine: {
    marginTop: -30,
  },

  shippingTitleAlwaysLine: {
    fontSize: Platform.select({
      web: 35.00698991625,
      default: 31.6729905525,
    }),
    lineHeight: Platform.select({
      web: 40.00798828125,
      default: 36.673989598125,
    }),
    marginTop: 0,
  },

  shippingPreviewRow: {
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 35,
  },

  shippingPreviewIcon: {
    width: 113.153906,
    height: 113.153906,
    marginHorizontal: 0,
  },

  shippingPreviewIconTruck: {
    width: 96.811089,
    height: 96.811089,
    marginHorizontal: 0,
    transform: [{ translateY: 3 }],
  },

  shippingPreviewIconLarge: {
    width: 127.75125,
    height: 89.3475,
    marginHorizontal: 0,
  },

  shippingPreviewIconSoflo: {
    width: 111.684375,
    height: 111.684375,
    marginHorizontal: 0,
    transform: [{ translateY: -3 }],
  },

  shippingPreviewIconFill: {
    width: "100%",
    height: "100%",
  },

  shippingPreviewItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  shippingPreviewItemRowTruck: {
    marginBottom: 40,
  },

  shippingPreviewItemRowBargain: {
    marginBottom: 40,
  },

  shippingPreviewItemButtonOuter: {
    borderWidth: 2,
    borderColor: "#111111",
    borderRadius: 30,
    marginLeft: 14,
  },

  shippingPreviewItemButtonOuterSoflo: {
    marginLeft: 5.19545,
  },

  shippingPreviewItemButton: {
    width: 197.5,
    minHeight: 46.25,
    backgroundColor: "#FFFCF2",
    borderWidth: 2,
    borderColor: "#f7b967",
    marginTop: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  shippingPreviewItemButtonInner: {
    width: "100%",
    minHeight: 42.25,
    borderWidth: 2,
    borderColor: "#111111",
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10.5,
    paddingVertical: 5.5,
  },

  shippingPreviewItemButtonText: {
    color: "#111111",
  },

  shippingPreviewReadyButton: {
    width: 237,
    minHeight: 55.5,
    backgroundColor: "#f7b967",
    borderWidth: 2,
    borderColor: "#111111",
    alignSelf: "center",
    marginTop: 24.15,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },

  shippingPreviewReadyButtonText: {
    fontSize: 17.5,
    lineHeight: 21.25,
    color: "#f7b967",
  },

  shippingPreviewReadyButtonTextPrimary: {
    color: "#FFFFFF",
    fontSize: 21,
    lineHeight: 25.5,
    textShadowColor: "#111111",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
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

shippingBlockOverlay: {

  width: 158,

},

shippingIcon: {

  width: 300.2,

  height: 219.45,

  marginBottom: -7,

},

shippingIconBargainSquare: {

  width: 274.3125,

  height: 274.3125,

  transform: [{ translateX: -12.94375 }],

},

shippingIconFill: {

  width: "100%",

  height: "100%",

},

shippingIconOverlay: {

  width: 167.475,

  height: 122.375,

  marginBottom: 0,

  transform: [{ translateX: 7 }],

},

shippingIconReducedGap: {

  marginBottom: -30.45,

},

shippingIconLarge: {

  width: 309.7,

  height: 216.6,

  marginBottom: 35,

},

shippingIconSofloSquare: {

  width: 270.75,

  height: 270.75,

  transform: [{ translateX: -14.725 }],

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
    minHeight: 81.25,
    borderRadius: 28,
    backgroundColor: "#f7b967",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    paddingHorizontal: 22,
    paddingVertical: 13.5,
  },

  shippingPillOverlay: {
    minHeight: 37,
    marginTop: 13.5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  shippingPillText: {
    fontFamily: bodyFont,
    fontSize: 31,
    lineHeight: 37,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },

  shippingPillTextOverlay: {
    fontSize: 14,
    lineHeight: 17,
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
    height: 50.5,
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

  truckOverlayTouchFrame: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    elevation: 10000,
  },

  truckOverlayDismissLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  truckOverlayFrame: {
    position: "absolute",
    top: 243.415625,
    left: 0,
    right: 0,
    height: 298.2,
    alignItems: "center",
    justifyContent: "center",
  },

  truckOverlayWindow: {
    width: 298.2,
    height: 298.2,
    borderWidth: 2,
    borderRadius: 28,
    borderColor: "#111111",
    backgroundColor: "#FFFCF2",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});
