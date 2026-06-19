import { Platform, StyleSheet } from "react-native";

import {
  heavyBlackBorderWithShadow,
  tappableButtonShadowPlate,
  thickBlackBorder,
  thickBlackBorderShadow,
  thickBlackBorderWithShadow,
} from "./borderEffects";

const logoFont = "Dream Avenue";
const bodyFont = Platform.select({
  web: "TT Fors",
  default: "System",
});
const shippingPreviewReadyTriangleHeight = 8.9775;
const shippingPreviewReadyTriangleWidth = 14.1075;
const shippingPreviewBackTriangleHeight = 9.975;
const shippingPreviewBackTriangleWidth = 15.675;
const appHairlineWidth = 0.375;
const appHairlineColor = "rgba(17, 17, 17, 0.28)";

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

  shopScreenDimLayer: {
    position: "absolute",
    top: 120,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9000,
    elevation: 9000,
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
    backgroundColor: "#FFFFFF",
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
    width: 170.64,
    minHeight: 55.5,
    borderRadius: Platform.select({
      web: 24,
      default: 22.16,
    }),
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignSelf: "center",
    marginTop: 0,
    paddingHorizontal: 15,
    paddingVertical: 9,
    overflow: "hidden",
  },

  shippingPreviewReadyButtonShadowFrame: {
    position: "relative",
    alignSelf: "center",
    borderRadius: Platform.select({
      web: 24,
      default: 22.16,
    }),
    backgroundColor: "#f7b967",
    ...thickBlackBorderShadow,
    overflow: "visible",
  },

  shippingPreviewReadyButtonShadowPlate: {
    ...tappableButtonShadowPlate,
    top: 0,
    left: 0,
    width: 170.64,
    height: 55.5,
    borderRadius: Platform.select({
      web: 24,
      default: 22.16,
    }),
  },

  shippingPreviewReadyButtonShadowFrameBack: {
    backgroundColor: "#FFFFFF",
  },

  shippingPreviewReadyButtonHidden: {
    opacity: 0,
  },

  shippingPreviewReadyButtonLiftFrame: {
    position: "absolute",
    zIndex: 10001,
    elevation: 10001,
  },

  shippingPreviewGoBackSideButtonFrame: {
    position: "absolute",
    height: 55.5,
    zIndex: 10001,
    elevation: 10001,
    overflow: "visible",
  },

  shippingPreviewGoBackSideButtonShadowPlate: {
    ...tappableButtonShadowPlate,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 10.5,
  },

  shippingPreviewGoBackSideButton: {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius: 10.5,
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  shippingPreviewCartCheckBadge: {
    position: "absolute",
    top: -7.284375,
    right: -7.284375,
    width: 21.853125,
    height: 21.853125,
    borderRadius: 10.9265625,
    zIndex: 2,
    elevation: 2,
  },

  shippingPreviewCartCheckBadgeText: {
    fontFamily: bodyFont,
    fontSize: 15,
    lineHeight: 15,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    includeFontPadding: false,
  },

  shippingPreviewBackButton: {
    backgroundColor: "#FFFFFF",
  },

  shippingPreviewReadyButtonTriangle: {
    position: "absolute",
    right: 44.8,
    top: "50%",
    width: 0,
    height: 0,
    transform: [{ translateY: 0 }],
    borderTopWidth: shippingPreviewReadyTriangleHeight,
    borderBottomWidth: shippingPreviewReadyTriangleHeight,
    borderLeftWidth: shippingPreviewReadyTriangleWidth,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#FFFFFF",
  },

  shippingPreviewReadyButtonTriangleBack: {
    position: "absolute",
    left: 44.8,
    top: "50%",
    width: 0,
    height: 0,
    transform: [{ translateY: -1 }],
    borderTopWidth: shippingPreviewBackTriangleHeight,
    borderBottomWidth: shippingPreviewBackTriangleHeight,
    borderRightWidth: shippingPreviewBackTriangleWidth,
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
    fontSize: 22,
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
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },

  piccolaOverlayNavActiveIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
    elevation: 1,
    backgroundColor: "#f7b967",
    borderBottomWidth: 0.375,
    borderBottomColor: "rgba(17, 17, 17, 0.28)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  piccolaOverlayNavItem: {
    position: "relative",
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    zIndex: 3,
    elevation: 3,
  },

  piccolaOverlayNavItemInverted: {
    backgroundColor: "transparent",
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
    color: "#f7b967",
    textAlign: "center",
  },

  piccolaOverlayNavItemTextInverted: {
    color: "#f7b967",
  },

  piccolaOverlayNavItemTextActive: {
    color: "#FFFFFF",
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

  cartOverlayTopFill: {
    height: 28,
    borderBottomWidth: appHairlineWidth,
    borderBottomColor: appHairlineColor,
  },

  cartOverlayContent: {
    position: "absolute",
    top: 28,
    right: 0,
    bottom: 28,
    left: 0,
  },

  cartOverlayBottomBanner: {
    position: "absolute",
    right: 0,
    bottom: 28,
    left: 0,
    height: 126,
    borderTopWidth: appHairlineWidth,
    borderTopColor: appHairlineColor,
    backgroundColor: "#FFFFFF",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingTop: 12,
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 12,
  },

  cartOverlayBottomGrandTotal: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 111,
    alignItems: "center",
  },

  cartOverlayBottomGrandTotalLabel: {
    width: "100%",
    fontFamily: "TT Fors Light",
    fontSize: 21.25,
    lineHeight: 25,
    fontWeight: "900",
    color: "#111111",
    textAlign: "center",
  },

  cartOverlayBottomGrandTotalAmount: {
    minWidth: 55,
    maxWidth: "100%",
    borderWidth: appHairlineWidth,
    borderColor: appHairlineColor,
    paddingHorizontal: 6.25,
    fontFamily: "TT Fors Light",
    fontSize: 21.25,
    lineHeight: 25,
    fontWeight: "900",
    color: "#1f8f3a",
    textAlign: "center",
  },

  cartOverlayCheckoutButton: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 111,
    height: 55.5,
    borderRadius: 10.5,
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  cartOverlayCheckoutButtonText: {
    fontFamily: bodyFont,
    fontSize: 15.84,
    lineHeight: 19.8,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },

  cartOverlayBottomSummaryColumn: {
    position: "absolute",
    top: 12,
    bottom: 12,
    left: 12,
    width: 168,
    justifyContent: "flex-end",
  },

  cartOverlayBottomProductRows: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 168,
    justifyContent: "flex-start",
  },

  cartOverlayBottomSummaryRow: {
    width: 168,
    flexDirection: "row",
    alignItems: "center",
  },

  cartOverlayBottomSummarySpacerRow: {
    width: 168,
    height: 8,
  },

  cartOverlayBottomProductName: {
    width: 82,
    fontFamily: "TT Fors Light",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800",
    color: "#111111",
    textAlign: "left",
  },

  cartOverlayBottomQuantity: {
    width: 30,
    fontFamily: "TT Fors Light",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800",
    color: "#111111",
    textAlign: "left",
  },

  cartOverlayBottomTotal: {
    width: 56,
    fontFamily: "TT Fors Light",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800",
    color: "#111111",
    textAlign: "right",
  },

  cartOverlayContentList: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "flex-start",
    flexWrap: "nowrap",
  },

  cartOverlayEmptyMessageFrame: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },

  cartOverlayEmptyMessage: {
    fontFamily: "TT Fors",
    fontSize: 28,
    lineHeight: 34,
    color: "#111111",
    textAlign: "center",
  },

  cartOverlayEmptyBrand: {
    fontFamily: logoFont,
    fontSize: 40,
    lineHeight: 48,
    marginVertical: 6,
    color: "#111111",
    textAlign: "center",
  },

  cartOverlayProductColumnGroup: {
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  cartOverlayProductEntry: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 2,
  },

  cartOverlayProductDivider: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: appHairlineWidth,
    backgroundColor: appHairlineColor,
  },

  cartOverlayProductRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    overflow: "visible",
  },

  cartOverlayProductBlock: {
    width: 100.85229,
    alignItems: "center",
  },

  cartOverlayQuantityFrame: {
    position: "relative",
    width: 43.70625,
    height: 41.625,
    marginTop: 45.3215,
    marginLeft: 10.86,
    borderRadius: 10.5,
    overflow: "visible",
  },

  cartOverlayQuantityColumn: {
    width: 39.335625,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  cartOverlayQuantityTriangleButton: {
    width: 39.335625,
    height: 25.353,
    alignItems: "center",
    justifyContent: "center",
  },

  cartOverlayQuantityBox: {
    width: 39.335625,
    height: 37.4625,
  },

  cartOverlayProductImage: {
    width: 90.767061,
    height: 90.767061,
    borderRadius: 45.3835305,
  },

  cartOverlayProductName: {
    width: "100%",
    fontFamily: "TT Fors Light",
    fontSize: 13,
    lineHeight: 15.708,
    fontWeight: "800",
    color: "#111111",
    textAlign: "center",
  },

  cartOverlayProductPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 4,
  },

  cartOverlayProductPrice: {
    fontFamily: "TT Fors Light",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800",
    color: "#111111",
    textAlign: "center",
  },

  cartOverlayProductTotal: {
    fontFamily: "TT Fors Light",
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "800",
    color: "#111111",
    textAlign: "center",
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

  piccolaOverlayHeadingTouchBand: {
    marginTop: 0,
  },

  piccolaOverlayBody: {
    width: "100%",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  piccolaOverlayChevronTouchBand: {
    width: "100%",
    alignItems: "center",
    paddingTop: 16,
  },

  piccolaOverlayImageRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -4,
    marginBottom: 5,
  },

  piccolaOverlayImageStage: {
    flex: 1,
    height: 201.70458,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  piccolaOverlayImageMask: {
    width: 201.70458,
    height: 201.70458,
    borderRadius: 100.85229,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  overlayImageArrowTouchTarget: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  overlayImageArrowBox: {
    width: 16,
    height: 21,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  overlayImageArrowOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  overlayImageArrowChevron: {
    width: 13.5,
    height: 13.5,
    borderTopWidth: 2.8125,
    borderColor: "#111111",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },

  overlayImageArrowChevronMuted: {
    borderColor: "rgba(17, 17, 17, 0.28)",
  },

  overlayImageArrowChevronLeft: {
    borderLeftWidth: 2.8125,
    transform: [{ rotate: "-45deg" }],
  },

  overlayImageArrowChevronRight: {
    borderRightWidth: 2.8125,
    transform: [{ rotate: "45deg" }],
  },

  piccolaOverlayImage: {
    width: 201.70458,
    height: 201.70458,
    borderRadius: 100.85229,
    marginBottom: 0,
  },

  piccolaOverlayAnimatedImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 201.70458,
    height: 201.70458,
    borderRadius: 100.85229,
  },

  piccolaOverlayDescriptionRow: {
    width: "100%",
    flex: 0,
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "flex-start",
  },

  piccolaOverlayDescriptionColumn: {
    alignSelf: "stretch",
    justifyContent: "flex-start",
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
    position: "relative",
    width: 77.22,
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
    overflow: "visible",
  },

  piccolaOverlayPopularTag: {
    position: "absolute",
    top: 5.86,
    left: 0,
    right: 0,
    fontFamily: bodyFont,
    fontSize: 12.5,
    lineHeight: 12.5,
    fontWeight: "900",
    letterSpacing: 0.5832,
    color: "#FF0000",
    textAlign: "center",
    opacity: 0.9,
  },

  piccolaOverlayPopularTagGreen: {
    color: "#1f8f3a",
  },

  piccolaOverlayPriceSlot: {
    position: "absolute",
    top: 17.36,
    right: 0,
    bottom: 42.5604,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  piccolaOverlayPriceSlotBottom: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    height: 27,
    alignItems: "center",
    justifyContent: "center",
  },

  piccolaOverlayPrice: {
    fontFamily: "TT Fors Light",
    fontSize: 19.9,
    lineHeight: 27,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
  },

  piccolaOverlayBuyButtonFrame: {
    position: "absolute",
    bottom: 3,
    left: 10.86,
    width: 55.5,
    height: 44.4,
    borderRadius: 10.5,
    overflow: "visible",
  },

  piccolaOverlayBuyButtonShadowPlate: {
    ...tappableButtonShadowPlate,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 10.5,
  },

  piccolaOverlayBuyButtonShadowPlateTapped: {
    backgroundColor: "rgba(17, 17, 17, 0.035)",
  },

  piccolaOverlayBuyButton: {
    width: "100%",
    height: "100%",
    borderRadius: 10.5,
    ...thickBlackBorderWithShadow,
    backgroundColor: "#1f8f3a",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  piccolaOverlayBuyButtonAdded: {
    backgroundColor: "#FFFFFF",
  },

  piccolaOverlayBuyButtonTapped: {
    backgroundColor: "#8FC79D",
    borderColor: "#888888",
  },

  piccolaOverlayBuyButtonText: {
    fontFamily: bodyFont,
    fontSize: 15.84,
    lineHeight: 19.8,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },

  piccolaOverlayBuyButtonTextAdded: {
    color: "#111111",
  },

  piccolaOverlayBuyButtonTextTapped: {
    color: "#FEF6EC",
  },

  piccolaOverlayQuantityNumber: {
    fontSize: 15.84,
    lineHeight: 19.8,
  },

  piccolaOverlayQuantityZeroBox: {
    backgroundColor: "#FFFFFF",
  },

  piccolaOverlayQuantityZeroText: {
    color: appHairlineColor,
  },

  piccolaOverlayQuantityShadowPlate: {
    backgroundColor: "transparent",
    borderRadius: 0,
  },

  piccolaOverlayQuantityBox: {
    width: 29.1375,
    borderRadius: 0,
    borderWidth: appHairlineWidth,
    borderColor: appHairlineColor,
    boxShadow: undefined,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },

  piccolaOverlayQuantityTopBox: {
    position: "absolute",
    top: -47.9175,
    left: 0,
    width: 29.1375,
    height: 29.1375,
    borderRadius: 10.5,
    zIndex: 1,
  },

  piccolaOverlayQuantityTopBoxFill: {
    backgroundColor: "#1f8f3a",
  },

  piccolaOverlayQuantityTopBoxPending: {
    backgroundColor: "#FFFFFF",
  },

  piccolaOverlayQuantityTopCheck: {
    transform: [{ translateY: -0.2 }],
  },

  piccolaOverlayQuantityFrame: {
    position: "absolute",
    top: 6.9375,
    left: 68.275,
    width: 29.1375,
    height: 41.625,
    borderRadius: 10.5,
    overflow: "visible",
  },

  piccolaOverlayQuantityChevronOutside: {
    position: "absolute",
    left: 0,
    width: 29.1375,
    height: 18.78,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    elevation: 2,
  },

  piccolaOverlayQuantityChevronLeft: {
    top: -18.78,
  },

  piccolaOverlayQuantityChevronRight: {
    bottom: -18.78,
  },

  piccolaOverlayQuantityTriangleSvg: {
    width: "100%",
    height: "100%",
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
    backgroundColor: "#FFFCF2",
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
    backgroundColor: "#FFFCF2",
    ...thickBlackBorderShadow,
  },

  truckOverlayWindowFull: {
    width: "100%",
    height: "100%",
  },
});
