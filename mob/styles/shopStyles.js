import { Platform, StyleSheet } from "react-native";

import {
  heavyBlackBorderWithShadow,
  thickBlackBorder,
  thickBlackBorderShadow,
  thickBlackBorderWithShadow,
} from "./borderEffects";

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

  shopBackgroundHero: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    height: 430,
    overflow: "hidden",
  },

  shopBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.08,
    transform: [{ scale: 2.2464 }, { translateY: 72.8 }],
  },

  content: {
    flex: 1,
    backgroundColor: "transparent",
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
    fontFamily: bodyFont,
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
    alignItems: "center",
    justifyContent: "center",
    marginTop: 19.6875,
  },

  shippingPreviewIcon: {
    width: 141.4423825,
    height: 141.4423825,
    marginHorizontal: 0,
  },

  shippingPreviewIconTruck: {
    width: 121.01386125,
    height: 121.01386125,
    marginHorizontal: 0,
    transform: [{ translateX: -2 }, { translateY: 3 }],
  },

  shippingPreviewIconBargain: {
    width: 141.4423825,
    height: 141.4423825,
    marginHorizontal: 0,
    transform: [{ translateX: -5 }],
  },

  shippingPreviewIconLarge: {
    width: 127.75125,
    height: 89.3475,
    marginHorizontal: 0,
  },

  shippingPreviewIconSoflo: {
    width: 139.60546875,
    height: 139.60546875,
    marginHorizontal: 0,
    transform: [{ translateY: 1 }],
  },

  shippingPreviewIconFill: {
    width: "100%",
    height: "100%",
  },

  shippingPreviewItemRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  shippingPreviewItemRowTruck: {
    marginBottom: 16,
  },

  shippingPreviewItemRowBargain: {
    marginBottom: 16,
  },

  shippingPreviewImageSlot: {
    width: 141.4423825,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  shippingPreviewButtonSlot: {
    width: 160,
    marginLeft: 14,
    alignItems: "flex-start",
  },

  shippingPreviewItemButtonOuter: {
    borderRadius: 37.5,
    backgroundColor: "#f7b967",
    ...thickBlackBorderWithShadow,
  },

  shippingPreviewItemButton: {
    position: "relative",
    minHeight: 57.8125,
    backgroundColor: "#f7b967",
    borderWidth: 2,
    borderColor: "#f7b967",
    ...thickBlackBorderShadow,
    marginTop: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: "hidden",
  },

  shippingPreviewItemButtonChromeCorner: {
    position: "absolute",
    width: 52,
    height: 52,
    zIndex: 0,
    elevation: 0,
    overflow: "hidden",
  },

  shippingPreviewItemButtonChromeFill: {
    ...StyleSheet.absoluteFillObject,
  },

  shippingPreviewItemButtonChromeTopLeft: {
    top: 2,
    left: 2,
  },

  shippingPreviewItemButtonChromeTopRight: {
    top: 2,
    right: 2,
  },

  shippingPreviewItemButtonChromeBottomLeft: {
    bottom: 2,
    left: 2,
  },

  shippingPreviewItemButtonChromeBottomRight: {
    right: 2,
    bottom: 2,
  },

  shippingPreviewItemButtonInner: {
    position: "relative",
    minHeight: 52.8125,
    borderRadius: 32.5,
    backgroundColor: "#FFFCF2",
    ...thickBlackBorderWithShadow,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26.25,
    paddingVertical: 13.75,
    zIndex: 1,
  },

  shippingPreviewItemButtonText: {
    color: "#111111",
    fontSize: 21.875,
    lineHeight: 26.5625,
    textAlign: "center",
  },

  shippingPreviewReadyButton: {
    width: 237,
    minHeight: 55.5,
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignSelf: "center",
    marginTop: 0,
    paddingHorizontal: 15,
    paddingVertical: 9,
    overflow: "hidden",
  },

  shippingPreviewReadyButtonShadowFrame: {
    alignSelf: "center",
    borderRadius: 28,
    backgroundColor: "#f7b967",
    ...thickBlackBorderShadow,
  },

  shippingPreviewReadyButtonShadowFrameBack: {
    backgroundColor: "#FFFFFF",
  },

  shippingPreviewBackButton: {
    backgroundColor: "#FFFFFF",
  },

  shippingPreviewBackButtonSideLeft: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 28,
    backgroundColor: "#f7b967",
  },

  shippingPreviewBackButtonSideRight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: 28,
    backgroundColor: "#f7b967",
  },

  shippingPreviewReadyButtonTriangle: {
    position: "absolute",
    right: 56,
    top: "50%",
    width: 0,
    height: 0,
    transform: [{ translateY: -1 }],
    borderTopWidth: 10.5,
    borderBottomWidth: 10.5,
    borderLeftWidth: 16.5,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#FFFFFF",
  },

  shippingPreviewReadyButtonTriangleBack: {
    position: "absolute",
    left: 56,
    top: "50%",
    width: 0,
    height: 0,
    transform: [{ translateY: -1 }],
    borderTopWidth: 10.5,
    borderBottomWidth: 10.5,
    borderRightWidth: 16.5,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "#111111",
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
  },

  shippingPreviewBackButtonText: {
    color: "#111111",
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
    ...heavyBlackBorderWithShadow,
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

  piccolaOverlayNavBar: {
    position: "absolute",
    top: 28,
    left: 0,
    right: 0,
    height: 45.36,
    backgroundColor: "#f7b967",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  piccolaOverlayNavItem: {
    position: "relative",
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  piccolaOverlayNavItemInverted: {
    backgroundColor: "#FFFFFF",
  },

  piccolaOverlayNavItemBottomHairline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 0.375,
    backgroundColor: "rgba(17, 17, 17, 0.28)",
  },

  piccolaOverlayNavItemVerticalHairline: {
    position: "absolute",
    top: 0,
    bottom: 0.75,
    width: 0.375,
    backgroundColor: "rgba(17, 17, 17, 0.28)",
  },

  piccolaOverlayNavItemLeftHairline: {
    left: 0,
  },

  piccolaOverlayNavItemRightHairline: {
    right: 0,
  },

  piccolaOverlayNavItemText: {
    fontFamily: bodyFont,
    fontSize: 18,
    lineHeight: 22.5,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },

  piccolaOverlayNavItemTextInverted: {
    color: "#f7b967",
  },

  piccolaOverlayTopFill: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 73.36,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: "#f7b967",
  },

  piccolaOverlayBottomFill: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 28,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    borderTopWidth: 0.375,
    borderTopColor: "rgba(17, 17, 17, 0.28)",
    backgroundColor: "#f7b967",
  },

  piccolaOverlayContent: {
    width: "100%",
    height: "100%",
    alignItems: "center",
  },

  piccolaOverlayHeading: {
    width: "100%",
    fontFamily: "TT Fors Light",
    fontSize: 36,
    lineHeight: 43.5,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 0,
  },

  piccolaOverlayBody: {
    width: "100%",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  piccolaOverlayImage: {
    width: 201.70458,
    height: 201.70458,
    borderRadius: 100.85229,
    marginBottom: 8,
  },

  piccolaOverlayDescriptionRow: {
    width: "100%",
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
  },

  piccolaOverlayDescriptionColumn: {
    alignSelf: "stretch",
    justifyContent: "flex-end",
    paddingBottom: 7,
  },

  piccolaOverlayDescription: {
    width: "100%",
    fontFamily: bodyFont,
    fontSize: 14.7,
    lineHeight: 19.425,
    color: "#111111",
    textAlign: "justify",
  },

  piccolaOverlayDescriptionLead: {
    fontWeight: "700",
  },

  piccolaOverlayActionColumn: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 7,
  },

  piccolaOverlayPriceSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  piccolaOverlayPrice: {
    fontFamily: "TT Fors Light",
    fontSize: 27,
    lineHeight: 32.4,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
  },

  piccolaOverlayBuyButton: {
    width: 77.22,
    minHeight: 41.58,
    borderRadius: 10.5,
    ...thickBlackBorderWithShadow,
    backgroundColor: "#f7b967",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 11.88,
    paddingVertical: 7.92,
  },

  piccolaOverlayBuyButtonText: {
    fontFamily: bodyFont,
    fontSize: 15.84,
    lineHeight: 19.8,
    fontWeight: "900",
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
    borderRadius: 28,
    ...thickBlackBorder,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    overflow: "hidden",
  },

  truckOverlayWindowShadowFrame: {
    width: 298.2,
    height: 298.2,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    ...thickBlackBorderShadow,
  },

  truckOverlayWindowFull: {
    width: "100%",
    height: "100%",
  },
});
