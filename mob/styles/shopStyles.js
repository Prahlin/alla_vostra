import { Platform, StyleSheet } from "react-native";

import {
  heavyBlackBorderWithShadow,
  tappableButtonShadowPlate,
  thickBlackBorder,
  thickBlackBorderShadow,
  thickBlackBorderWithShadow,
} from "./borderEffects";
import {
  bodyDemiBoldFont,
  bodyFont,
  bodyLightFont,
  logoFont,
  tightText,
} from "./typography";

const shippingPreviewIOSLayoutScale = 0.77;
const scaleShippingPreview = (value) =>
  Platform.select({
    ios: value * shippingPreviewIOSLayoutScale,
    default: value,
  });
const productOverlayIOSScale = 0.82;
const scaleProductOverlay = (value) =>
  Platform.select({
    ios: value * productOverlayIOSScale,
    default: value,
  });
const cartOverlayFilledIOSScale = 0.72;
const scaleCartOverlayFilled = (value) =>
  Platform.select({
    ios: value * cartOverlayFilledIOSScale,
    default: value,
  });
const cartOverlayAddedProductAssetScale = 1.5;
const scaleCartOverlayAddedProduct = (value) =>
  scaleCartOverlayFilled(value * cartOverlayAddedProductAssetScale);
const cartOverlayReceiptIOSScale = 0.78;
const scaleCartOverlayReceipt = (value) =>
  Platform.select({
    ios: value * cartOverlayReceiptIOSScale,
    default: value,
  });
const scaleCartOverlayGrandTotal = (value) =>
  Platform.select({
    ios: value * 0.68,
    default: value,
  });
const scaleCartOverlayCheckoutBox = (value) =>
  Platform.select({
    ios: value * 0.78,
    default: value,
  });
const cartOverlayReceiptBlockWidth = "60%";
const cartOverlayReceiptQuantityColumnWidth = scaleCartOverlayReceipt(30);
const cartOverlayReceiptTotalColumnWidth = scaleCartOverlayReceipt(62);
const shippingPreviewReadyTriangleHeight = 8.9775;
const shippingPreviewReadyTriangleWidth = 14.1075;
const shippingPreviewBackTriangleHeight = 9.975;
const shippingPreviewBackTriangleWidth = 15.675;
const shippingPreviewActionSideBoxWidth = 40.0640625;
const shippingPreviewActionSideBoxHeight = 58.275;
const shippingPreviewActionSideBoxGap = 0;
const shippingPreviewActionSideBoxBleed = 10;
const shippingPreviewActionCenterBandHeight = 3;
const overlayOrangeBandHeight = 28;
const appHairlineWidth = 0.375;
const appHairlineColor = "rgba(17, 17, 17, 0.28)";
const deliveryOverlayHorizontalInset = 12;
const deliveryOverlayContactFieldGap = 8;
const deliveryOverlayIOSFieldHeight = 38.4;
const deliveryOverlayIOSContactBlockHeight =
  deliveryOverlayIOSFieldHeight * 2 + deliveryOverlayContactFieldGap;
const deliveryOverlayInactiveFieldColor = "#F7F7F7";

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

  headerOverlay: {
    position: "relative",
    zIndex: 1000000,
    elevation: 1000000,
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
    ...tightText,
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
    fontFamily: bodyFont,
  },

  shippingTitleWithLine: {
    ...tightText,
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
    ...tightText,
    fontSize: Platform.select({
      web: 35.00698991625,
      ios: 20,
      default: 31.6729905525,
    }),
    lineHeight: Platform.select({
      web: 40.00798828125,
      ios: 23.5,
      default: 36.673989598125,
    }),
    marginTop: 0,
  },

  shippingPreviewRow: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: scaleShippingPreview(19.6875),
  },

  shippingPreviewIcon: {
    width: scaleShippingPreview(141.4423825),
    height: scaleShippingPreview(141.4423825),
    marginHorizontal: 0,
  },

  shippingPreviewIconTruck: {
    width: scaleShippingPreview(121.01386125),
    height: scaleShippingPreview(121.01386125),
    marginHorizontal: 0,
    transform: [
      { translateX: scaleShippingPreview(-2) },
      { translateY: scaleShippingPreview(3) },
    ],
  },

  shippingPreviewIconBargain: {
    width: scaleShippingPreview(141.4423825),
    height: scaleShippingPreview(141.4423825),
    marginHorizontal: 0,
    transform: [{ translateX: scaleShippingPreview(-5) }],
  },

  shippingPreviewIconLarge: {
    width: scaleShippingPreview(127.75125),
    height: scaleShippingPreview(89.3475),
    marginHorizontal: 0,
  },

  shippingPreviewIconSoflo: {
    width: scaleShippingPreview(139.60546875),
    height: scaleShippingPreview(139.60546875),
    marginHorizontal: 0,
    transform: [{ translateY: scaleShippingPreview(1) }],
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
    marginBottom: scaleShippingPreview(16),
  },

  shippingPreviewItemRowBargain: {
    marginBottom: scaleShippingPreview(16),
  },

  shippingPreviewImageSlot: {
    width: scaleShippingPreview(141.4423825),
    alignItems: "flex-end",
    justifyContent: "center",
  },

  shippingPreviewButtonSlot: {
    width: scaleShippingPreview(160),
    marginLeft: scaleShippingPreview(14),
    alignItems: "flex-start",
  },

  shippingPreviewItemButtonOuter: {
    borderRadius: scaleShippingPreview(37.5),
    backgroundColor: "#f7b967",
    ...thickBlackBorderWithShadow,
    borderWidth: scaleShippingPreview(2),
  },

  shippingPreviewItemButton: {
    position: "relative",
    minHeight: Platform.select({
      ios: scaleShippingPreview(78),
      default: 57.8125,
    }),
    backgroundColor: "#f7b967",
    borderWidth: scaleShippingPreview(2),
    borderColor: "#f7b967",
    ...thickBlackBorderShadow,
    marginTop: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: "hidden",
  },

  shippingPreviewItemButtonChromeCorner: {
    position: "absolute",
    width: scaleShippingPreview(52),
    height: scaleShippingPreview(52),
    zIndex: 0,
    elevation: 0,
    overflow: "hidden",
  },

  shippingPreviewItemButtonChromeFill: {
    ...StyleSheet.absoluteFillObject,
  },

  shippingPreviewItemButtonChromeTopLeft: {
    top: scaleShippingPreview(2),
    left: scaleShippingPreview(2),
  },

  shippingPreviewItemButtonChromeTopRight: {
    top: scaleShippingPreview(2),
    right: scaleShippingPreview(2),
  },

  shippingPreviewItemButtonChromeBottomLeft: {
    bottom: scaleShippingPreview(2),
    left: scaleShippingPreview(2),
  },

  shippingPreviewItemButtonChromeBottomRight: {
    right: scaleShippingPreview(2),
    bottom: scaleShippingPreview(2),
  },

  shippingPreviewItemButtonInner: {
    position: "relative",
    minHeight: Platform.select({
      ios: scaleShippingPreview(72),
      default: 52.8125,
    }),
    borderRadius: scaleShippingPreview(32.5),
    backgroundColor: "#FFFFFF",
    ...thickBlackBorderWithShadow,
    borderWidth: scaleShippingPreview(2),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scaleShippingPreview(26.25),
    paddingVertical: Platform.select({
      ios: scaleShippingPreview(11),
      default: 13.75,
    }),
    zIndex: 1,
  },

  shippingPreviewItemButtonText: {
    ...tightText,
    fontFamily: Platform.select({
      ios: bodyDemiBoldFont,
      default: bodyFont,
    }),
    color: "#111111",
    fontSize: scaleShippingPreview(21.875),
    lineHeight: scaleShippingPreview(26.5625),
    fontWeight: Platform.select({
      ios: "900",
      default: "700",
    }),
    textAlign: "center",
  },

  shippingPreviewReadyButton: {
    width: "100%",
    height: 55.5,
    minHeight: 55.5,
    borderRadius: 10.5,
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    borderWidth: 2,
    alignSelf: "center",
    marginTop: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: "hidden",
  },

  shippingPreviewActionCluster: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    columnGap: shippingPreviewActionSideBoxGap,
    overflow: "visible",
  },

  shippingPreviewActionSideBoxFrame: {
    position: "relative",
    width: shippingPreviewActionSideBoxWidth,
    height: shippingPreviewActionSideBoxHeight,
    borderRadius: scaleShippingPreview(37.5),
    backgroundColor: "#f7b967",
    overflow: "visible",
    zIndex: 2,
  },

  shippingPreviewActionSideBoxFrameLeft: {
    marginRight: -shippingPreviewActionSideBoxBleed,
    borderTopRightRadius: 10.5,
    borderBottomRightRadius: 10.5,
  },

  shippingPreviewActionSideBoxFrameRight: {
    marginLeft: -shippingPreviewActionSideBoxBleed,
    borderTopLeftRadius: 10.5,
    borderBottomLeftRadius: 10.5,
  },

  shippingPreviewActionSideBoxFrameDimmed: {
    backgroundColor: "#D6AE79",
  },

  shippingPreviewActionSideBoxShadowPlate: {
    ...tappableButtonShadowPlate,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: scaleShippingPreview(37.5),
  },

  shippingPreviewActionSideBoxShadowPlateLeft: {
    borderTopRightRadius: 10.5,
    borderBottomRightRadius: 10.5,
  },

  shippingPreviewActionSideBoxShadowPlateRight: {
    borderTopLeftRadius: 10.5,
    borderBottomLeftRadius: 10.5,
  },

  shippingPreviewActionSideBoxShadowPlateDimmed: {
    backgroundColor: "#686868",
  },

  shippingPreviewActionSideBox: {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius: scaleShippingPreview(37.5),
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  shippingPreviewActionSideBoxLeft: {
    borderTopRightRadius: 10.5,
    borderBottomRightRadius: 10.5,
  },

  shippingPreviewActionSideBoxRight: {
    borderTopLeftRadius: 10.5,
    borderBottomLeftRadius: 10.5,
  },

  shippingPreviewActionSideBoxDimmed: {
    backgroundColor: "#D6AE79",
    borderColor: "#777777",
  },

  shippingPreviewReadyButtonShadowFrame: {
    position: "relative",
    alignSelf: "center",
    borderRadius: 10.5,
    backgroundColor: "#f7b967",
    ...thickBlackBorderShadow,
    overflow: "visible",
    zIndex: 1,
  },

  shippingPreviewReadyButtonShadowPlate: {
    ...tappableButtonShadowPlate,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10.5,
  },

  shippingPreviewReadyButtonShadowFrameBack: {
    backgroundColor: "#FFFFFF",
  },

  shippingPreviewAddItemsButtonShadowFrame: {
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
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  shippingPreviewCartCheckBadge: {
    position: "absolute",
    top: scaleShippingPreview(-7.284375),
    right: scaleShippingPreview(-7.284375),
    width: scaleShippingPreview(21.853125),
    height: scaleShippingPreview(21.853125),
    borderRadius: scaleShippingPreview(10.9265625),
    zIndex: 2,
    elevation: 2,
  },

  shippingPreviewCartCheckBadgeText: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: scaleShippingPreview(15),
    lineHeight: scaleShippingPreview(15),
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },

  shippingPreviewBackButton: {
    backgroundColor: "#FFFFFF",
  },

  shippingPreviewAddItemsButton: {
    backgroundColor: "#FFFFFF",
  },

  shippingPreviewActionButtonContent: {
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    columnGap: 12,
    zIndex: 1,
    elevation: 1,
  },

  shippingPreviewActionButtonBand: {
    position: "absolute",
    left: 0,
    right: 0,
    height: shippingPreviewActionCenterBandHeight,
    backgroundColor: "#f7b967",
  },

  shippingPreviewActionButtonBandTop: {
    top: 0,
    borderBottomWidth: appHairlineWidth,
    borderBottomColor: appHairlineColor,
  },

  shippingPreviewActionButtonBandBottom: {
    bottom: 0,
    borderTopWidth: appHairlineWidth,
    borderTopColor: appHairlineColor,
  },

  shippingPreviewActionTriangleSlot: {
    position: "relative",
    width: shippingPreviewReadyTriangleWidth,
    height: "100%",
    overflow: "visible",
  },

  shippingPreviewActionTriangleSlotBack: {
    width: Platform.select({
      ios: shippingPreviewReadyTriangleWidth,
      default: shippingPreviewBackTriangleWidth,
    }),
  },

  shippingPreviewSideButtonTriangleBox: {
    position: "relative",
    width: shippingPreviewReadyTriangleWidth,
    height: shippingPreviewReadyTriangleHeight * 2,
    overflow: "visible",
  },

  shippingPreviewSideButtonTriangleBoxBack: {
    width: Platform.select({
      ios: shippingPreviewReadyTriangleWidth,
      default: shippingPreviewBackTriangleWidth,
    }),
    height: Platform.select({
      ios: shippingPreviewReadyTriangleHeight * 2,
      default: shippingPreviewBackTriangleHeight * 2,
    }),
  },

  shippingPreviewSideButtonTriangleRight: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    borderTopWidth: Platform.select({
      ios: shippingPreviewReadyTriangleHeight,
      default: shippingPreviewBackTriangleHeight,
    }),
    borderBottomWidth: Platform.select({
      ios: shippingPreviewReadyTriangleHeight,
      default: shippingPreviewBackTriangleHeight,
    }),
    borderLeftWidth: Platform.select({
      ios: shippingPreviewReadyTriangleWidth,
      default: shippingPreviewBackTriangleWidth,
    }),
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#FFFFFF",
  },

  shippingPreviewSideButtonTriangleRightDimmed: {
    borderLeftColor: "#F1E2CE",
  },

  shippingPreviewSideButtonTriangleLeft: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 0,
    height: 0,
    borderTopWidth: shippingPreviewReadyTriangleHeight,
    borderBottomWidth: shippingPreviewReadyTriangleHeight,
    borderRightWidth: shippingPreviewReadyTriangleWidth,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "#FFFFFF",
  },

  shippingPreviewSideButtonTriangleLeftBack: {
    borderTopWidth: Platform.select({
      ios: shippingPreviewReadyTriangleHeight,
      default: shippingPreviewBackTriangleHeight,
    }),
    borderBottomWidth: Platform.select({
      ios: shippingPreviewReadyTriangleHeight,
      default: shippingPreviewBackTriangleHeight,
    }),
    borderRightWidth: Platform.select({
      ios: shippingPreviewReadyTriangleWidth,
      default: shippingPreviewBackTriangleWidth,
    }),
  },

  shippingPreviewReadyButtonTriangle: {
    position: "absolute",
    left: 0,
    top: "50%",
    width: 0,
    height: 0,
    transform: [
      {
        translateY: Platform.select({
          ios: -9.75,
          default: -10,
        }),
      },
    ],
    borderTopWidth: shippingPreviewReadyTriangleHeight,
    borderBottomWidth: shippingPreviewReadyTriangleHeight,
    borderLeftWidth: shippingPreviewReadyTriangleWidth,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#111111",
  },

  shippingPreviewAddItemsButtonTriangle: {
    position: "absolute",
    right: 0,
    top: "50%",
    width: 0,
    height: 0,
    transform: [
      {
        translateY: Platform.select({
          ios: -9.75,
          default: -10,
        }),
      },
    ],
    borderTopWidth: shippingPreviewReadyTriangleHeight,
    borderBottomWidth: shippingPreviewReadyTriangleHeight,
    borderRightWidth: shippingPreviewReadyTriangleWidth,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "#111111",
  },

  shippingPreviewReadyButtonTriangleBack: {
    position: "absolute",
    right: 0,
    top: "50%",
    width: 0,
    height: 0,
    transform: [
      {
        translateY: Platform.select({
          ios: -9.75,
          default: -10,
        }),
      },
    ],
    borderTopWidth: Platform.select({
      ios: shippingPreviewReadyTriangleHeight,
      default: shippingPreviewBackTriangleHeight,
    }),
    borderBottomWidth: Platform.select({
      ios: shippingPreviewReadyTriangleHeight,
      default: shippingPreviewBackTriangleHeight,
    }),
    borderRightWidth: Platform.select({
      ios: shippingPreviewReadyTriangleWidth,
      default: shippingPreviewBackTriangleWidth,
    }),
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
    fontFamily: Platform.select({
      ios: bodyDemiBoldFont,
      default: bodyFont,
    }),
    color: "#FFFFFF",
    fontSize: Platform.select({
      ios: scaleShippingPreview(18.875),
      default: 18.875,
    }),
    lineHeight: Platform.select({
      ios: scaleShippingPreview(26.5625),
      default: 24.5625,
    }),
    fontWeight: Platform.select({
      ios: "900",
      default: "700",
    }),
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
    ...tightText,

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
    ...tightText,
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
    ...tightText,
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
    ...tightText,
    fontFamily: bodyFont,
    fontSize: 34,
    lineHeight: 41,
    color: "#111111",
    textAlign: "center",
    marginBottom: 16,
  },

  productPrice: {
    ...tightText,
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
    ...tightText,
    fontFamily: bodyFont,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },

  piccolaOverlayNavBar: {
    position: "absolute",
    top: overlayOrangeBandHeight,
    left: 0,
    right: 0,
    height: scaleProductOverlay(45.36),
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
    paddingHorizontal: scaleProductOverlay(6),
  },

  piccolaOverlayNavItem: {
    position: "relative",
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scaleProductOverlay(6),
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
    ...tightText,
    fontFamily: bodyFont,
    fontSize: scaleProductOverlay(18),
    lineHeight: scaleProductOverlay(22.5),
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
    height: overlayOrangeBandHeight + scaleProductOverlay(45.36),
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

  deliveryOverlayContent: {
    position: "absolute",
    top: overlayOrangeBandHeight,
    right: 0,
    bottom: 28,
    left: 0,
    backgroundColor: "#FFFCF2",
    paddingHorizontal: deliveryOverlayHorizontalInset,
    paddingTop: 32,
  },

  paymentOverlayContent: {
    position: "absolute",
    top: overlayOrangeBandHeight,
    right: 0,
    bottom: 28,
    left: 0,
    backgroundColor: "#FFFCF2",
    paddingHorizontal: 12,
    paddingTop: 12,
  },

  placeholderOverlayContent: {
    position: "absolute",
    top: overlayOrangeBandHeight,
    right: 0,
    bottom: 28,
    left: 0,
    backgroundColor: "#FFFCF2",
  },

  deliveryOverlayHeading: {
    ...tightText,
    width: "100%",
    fontFamily: bodyDemiBoldFont,
    fontSize: Platform.select({
      ios: 13,
      default: 15,
    }),
    lineHeight: Platform.select({
      ios: 16,
      default: 18,
    }),
    fontWeight: "900",
    color: "#111111",
    textAlign: "left",
    marginBottom: deliveryOverlayHorizontalInset,
  },

  paymentOverlayHeading: {
    ...tightText,
    width: "100%",
    fontFamily: bodyDemiBoldFont,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "900",
    color: "#111111",
    textAlign: "left",
    marginBottom: 8,
  },

  paymentOverlaySectionHeading: {
    ...tightText,
    width: "100%",
    fontFamily: bodyDemiBoldFont,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "900",
    color: "#111111",
    textAlign: "left",
  },

  paymentOverlayMethodList: {
    width: "100%",
    marginTop: 8,
    rowGap: 6,
  },

  paymentOverlayMethodButton: {
    width: "100%",
    height: 34,
    borderWidth: appHairlineWidth,
    borderColor: appHairlineColor,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  paymentOverlayMethodButtonText: {
    ...tightText,
    width: "100%",
    fontFamily: bodyDemiBoldFont,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "900",
    color: "#111111",
    textAlign: "center",
  },

  confirmationOverlayOrderPopupLayer: {
    position: "absolute",
    zIndex: 3,
    elevation: 3,
  },

  confirmationOverlayOrderPopupLayerPrompt: {
    left: 24,
    right: scaleCartOverlayCheckoutBox(111) + 48,
    bottom: 24,
    height: 24 + scaleCartOverlayCheckoutBox(111),
  },

  confirmationOverlayOrderPopupLayerFull: {
    top: 24,
    right: 24,
    bottom: 24,
    left: 24,
  },

  confirmationOverlayOrderPopup: {
    width: "100%",
    borderRadius: 10.5,
    backgroundColor: "#FFFFFF",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  confirmationOverlayOrderPopupPrompt: {
    height: 24 + scaleCartOverlayCheckoutBox(111),
  },

  confirmationOverlayOrderPopupFull: {
    height: "100%",
  },

  confirmationOverlayOrderPopupText: {
    ...tightText,
    width: "100%",
    fontFamily: bodyDemiBoldFont,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "900",
    color: "#111111",
    textAlign: "center",
  },

  confirmationOverlayOrderPopupTextFull: {
    fontFamily: bodyFont,
    fontSize: scaleProductOverlay(28),
    lineHeight: scaleProductOverlay(34),
    fontWeight: "400",
  },

  confirmationOverlayOrderImage: {
    width: scaleProductOverlay(108),
    height: scaleProductOverlay(108),
    alignSelf: "center",
    marginVertical: scaleProductOverlay(8),
  },

  confirmationOverlayOrderPopupBrand: {
    ...tightText,
    width: "100%",
    fontFamily: logoFont,
    fontSize: scaleProductOverlay(40),
    lineHeight: scaleProductOverlay(48),
    marginVertical: scaleProductOverlay(6),
    color: "#111111",
    textAlign: "center",
  },

  confirmationOverlayButton: {
    position: "absolute",
    right: 24,
    width: scaleCartOverlayCheckoutBox(111),
    height: scaleCartOverlayCheckoutBox(55.5),
    borderRadius: scaleCartOverlayCheckoutBox(10.5),
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  confirmationOverlayYesButton: {
    bottom: 48 + scaleCartOverlayCheckoutBox(55.5),
    backgroundColor: "#247C3A",
  },

  confirmationOverlayNoButton: {
    bottom: 24,
    backgroundColor: "#C62828",
  },

  deliveryOverlayRow: {
    width: "100%",
    flexDirection: "row",
    columnGap: 6,
    marginBottom: 8,
    overflow: "hidden",
  },

  deliveryOverlayRowWithStateMessage: {
    marginBottom: 2,
  },

  deliveryOverlayRowDoubleGapAfter: {
    marginBottom: 32,
  },

  deliveryOverlayFieldGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    columnGap: 6,
    overflow: "hidden",
  },

  deliveryOverlayStateMessageRow: {
    width: "100%",
    flexDirection: "row",
    columnGap: 6,
    marginBottom: 6,
  },

  deliveryOverlayStateMessageSpacer: {
    flex: 5,
    minWidth: 0,
  },

  deliveryOverlayStateMessageText: {
    ...tightText,
    flex: 5,
    minWidth: 0,
    fontFamily: bodyDemiBoldFont,
    fontSize: Platform.select({
      ios: 4.8,
      default: 6.8,
    }),
    lineHeight: Platform.select({
      ios: 6.2,
      default: 8.2,
    }),
    fontWeight: "900",
    color: "#B91F18",
    textAlign: "left",
  },

  deliveryOverlayContactBlock: {
    width: "100%",
    height: Platform.select({
      ios: deliveryOverlayIOSContactBlockHeight,
      default: undefined,
    }),
    flexDirection: "row",
    columnGap: 6,
    marginBottom: 8,
    overflow: Platform.select({
      ios: "visible",
      default: "hidden",
    }),
  },

  deliveryOverlayContactFieldsColumn: {
    width: "50%",
    height: Platform.select({
      ios: deliveryOverlayIOSContactBlockHeight,
      default: undefined,
    }),
    minWidth: 0,
    rowGap: deliveryOverlayContactFieldGap,
  },

  deliveryOverlayContactFieldRow: {
    width: "100%",
    flexDirection: "row",
    overflow: "hidden",
  },

  deliveryOverlayTruckLane: {
    position: "absolute",
    left: "50%",
    right: deliveryOverlayHorizontalInset,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    zIndex: 0,
    elevation: 0,
  },

  deliveryOverlayContactTruckImage: {
    width: "47.3%",
    height: 52.8,
    zIndex: 0,
    elevation: 0,
  },

  deliveryOverlayField: {
    flex: 1,
    minWidth: 0,
    minHeight: Platform.select({
      ios: deliveryOverlayIOSFieldHeight,
      default: 48,
    }),
    borderWidth: appHairlineWidth,
    borderColor: appHairlineColor,
    backgroundColor: deliveryOverlayInactiveFieldColor,
    paddingHorizontal: 7,
    paddingTop: 5,
    paddingBottom: 5,
    justifyContent: "space-between",
    overflow: "hidden",
  },

  deliveryOverlayFieldStateSurface: {
    backgroundColor: "#FFFFFF",
    opacity: 1,
  },

  deliveryOverlayStateField: {
    backgroundColor: "#FFFFFF",
    opacity: 1,
    zIndex: 1,
    elevation: 0,
  },

  deliveryOverlayFieldLabel: {
    ...tightText,
    width: "100%",
    fontFamily: bodyDemiBoldFont,
    fontSize: Platform.select({
      ios: 8.5,
      default: 10.5,
    }),
    lineHeight: Platform.select({
      ios: 10.5,
      default: 12.5,
    }),
    fontWeight: "900",
    color: "#111111",
    textAlign: "left",
  },

  deliveryOverlayFieldInput: {
    ...tightText,
    width: "100%",
    minHeight: Platform.select({
      ios: 15.2,
      default: 19,
    }),
    margin: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    fontFamily: bodyFont,
    fontSize: Platform.select({
      ios: 12,
      default: 14,
    }),
    lineHeight: Platform.select({
      ios: 15,
      default: 17,
    }),
    color: "#111111",
    textAlign: "left",
    textAlignVertical: "center",
  },

  deliveryOverlayFieldInputStateSurface: {
    backgroundColor: "#FFFFFF",
    opacity: 1,
  },

  deliveryOverlayStateButton: {
    width: "100%",
    minHeight: Platform.select({
      ios: 15.2,
      default: 19,
    }),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 4,
  },

  deliveryOverlayStateButtonText: {
    ...tightText,
    flex: 1,
    minWidth: 0,
    fontFamily: bodyFont,
    fontSize: Platform.select({
      ios: 12,
      default: 14,
    }),
    lineHeight: Platform.select({
      ios: 15,
      default: 17,
    }),
    color: "#111111",
    textAlign: "left",
  },

  deliveryOverlayStateButtonPlaceholder: {
    color: "rgba(17, 17, 17, 0.38)",
  },

  deliveryOverlayStateButtonTriangle: {
    width: 7,
    height: 5,
    flexShrink: 0,
  },

  deliveryOverlayStateDropdownLayer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10004,
    elevation: 10004,
  },

  deliveryOverlayStateDropdownDismissArea: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
    elevation: 1,
  },

  deliveryOverlayStateDropdown: {
    position: "absolute",
    borderWidth: appHairlineWidth,
    borderColor: appHairlineColor,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    zIndex: 40,
    elevation: 40,
  },

  deliveryOverlayStateDropdownScroll: {
    width: "100%",
    height: "100%",
  },

  deliveryOverlayStateOption: {
    height: 28,
    minHeight: 28,
    justifyContent: "center",
    borderBottomWidth: appHairlineWidth,
    borderBottomColor: "rgba(17, 17, 17, 0.14)",
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  deliveryOverlayStateOptionSelected: {
    backgroundColor: "#FFFFFF",
  },

  deliveryOverlayStateOptionCentered: {
    backgroundColor: "#f7b967",
  },

  deliveryOverlayStateOptionText: {
    ...tightText,
    width: "100%",
    fontFamily: bodyFont,
    fontSize: Platform.select({
      ios: 11,
      default: 13,
    }),
    lineHeight: Platform.select({
      ios: 14,
      default: 16,
    }),
    color: "#111111",
    textAlign: "left",
  },

  deliveryOverlayStateOptionTextSelected: {
    color: "#111111",
  },

  deliveryOverlayStateOptionTextCentered: {
    color: "#FFFFFF",
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
    width: scaleCartOverlayGrandTotal(111),
    alignItems: "center",
  },

  cartOverlayBottomGrandTotalLabel: {
    ...tightText,
    width: "100%",
    fontFamily: Platform.select({
      ios: bodyDemiBoldFont,
      default: bodyLightFont,
    }),
    fontSize: scaleCartOverlayGrandTotal(21.25),
    lineHeight: scaleCartOverlayGrandTotal(25),
    fontWeight: "900",
    color: "#111111",
    textAlign: "center",
  },

  cartOverlayBottomGrandTotalAmount: {
    ...tightText,
    minWidth: scaleCartOverlayGrandTotal(55),
    maxWidth: "100%",
    borderWidth: appHairlineWidth,
    borderColor: appHairlineColor,
    paddingHorizontal: scaleCartOverlayGrandTotal(6.25),
    fontFamily: bodyLightFont,
    fontSize: scaleCartOverlayGrandTotal(21.25),
    lineHeight: scaleCartOverlayGrandTotal(25),
    fontWeight: "900",
    color: "#247C3A",
    textAlign: "center",
  },

  cartOverlayCheckoutButton: {
    position: "absolute",
    right: 12,
    top: 12,
    width: scaleCartOverlayCheckoutBox(111),
    height: scaleCartOverlayCheckoutBox(55.5),
    borderRadius: scaleCartOverlayCheckoutBox(10.5),
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  paymentOverlayCheckoutButton: {
    position: "absolute",
    right: 12,
    bottom: 12 + scaleCartOverlayCheckoutBox(27.75),
    width: scaleCartOverlayCheckoutBox(111),
    height: scaleCartOverlayCheckoutBox(55.5),
    borderRadius: scaleCartOverlayCheckoutBox(10.5),
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  paymentOverlayCheckoutButtonDimmed: {
    backgroundColor: "#D6AE79",
    borderColor: "#777777",
  },

  cartOverlayCheckoutButtonText: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: scaleCartOverlayGrandTotal(15.84),
    lineHeight: scaleCartOverlayGrandTotal(19.8),
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },

  cartOverlayCheckoutButtonTextDimmed: {
    color: "#F1E2CE",
  },

  cartOverlayBottomSummaryColumn: {
    position: "absolute",
    top: scaleCartOverlayReceipt(12),
    bottom: scaleCartOverlayReceipt(12),
    left: scaleCartOverlayReceipt(12),
    width: cartOverlayReceiptBlockWidth,
    justifyContent: "flex-end",
  },

  cartOverlayBottomProductRows: {
    position: "absolute",
    top: scaleCartOverlayReceipt(12),
    left: scaleCartOverlayReceipt(12),
    width: cartOverlayReceiptBlockWidth,
    justifyContent: "flex-start",
  },

  cartOverlayBottomSummaryRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

  cartOverlayBottomSummarySpacerRow: {
    width: "100%",
    height: scaleCartOverlayReceipt(8),
  },

  cartOverlayBottomProductName: {
    ...tightText,
    flex: 1,
    minWidth: 0,
    fontFamily: Platform.select({
      ios: bodyDemiBoldFont,
      default: bodyLightFont,
    }),
    fontSize: scaleCartOverlayReceipt(13),
    lineHeight: scaleCartOverlayReceipt(16),
    fontWeight: "900",
    color: "#111111",
    textAlign: "left",
    flexShrink: 1,
  },

  cartOverlayBottomQuantity: {
    ...tightText,
    width: cartOverlayReceiptQuantityColumnWidth,
    minWidth: cartOverlayReceiptQuantityColumnWidth,
    maxWidth: cartOverlayReceiptQuantityColumnWidth,
    fontFamily: Platform.select({
      ios: bodyDemiBoldFont,
      default: bodyLightFont,
    }),
    fontSize: scaleCartOverlayReceipt(13),
    lineHeight: scaleCartOverlayReceipt(16),
    fontWeight: "900",
    color: "#111111",
    textAlign: "left",
    flexShrink: 0,
  },

  cartOverlayBottomTotal: {
    ...tightText,
    width: cartOverlayReceiptTotalColumnWidth,
    minWidth: cartOverlayReceiptTotalColumnWidth,
    maxWidth: cartOverlayReceiptTotalColumnWidth,
    fontFamily: Platform.select({
      ios: bodyDemiBoldFont,
      default: bodyLightFont,
    }),
    fontSize: scaleCartOverlayReceipt(13),
    lineHeight: scaleCartOverlayReceipt(16),
    fontWeight: "900",
    color: "#111111",
    textAlign: "right",
    flexShrink: 0,
  },

  cartOverlayContentList: {
    width: "100%",
    minHeight: "100%",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    flexWrap: "nowrap",
    paddingBottom: scaleCartOverlayFilled(8),
  },

  cartOverlayEmptyMessageFrame: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  cartOverlayEmptyMessage: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: scaleProductOverlay(28),
    lineHeight: scaleProductOverlay(34),
    color: "#111111",
    textAlign: "center",
  },

  cartOverlayEmptyMessageFirstLine: {
    transform: [
      {
        translateY: Platform.select({
          android: -4,
          default: 0,
        }),
      },
    ],
  },

  cartOverlayEmptyBrand: {
    ...tightText,
    fontFamily: logoFont,
    fontSize: scaleProductOverlay(40),
    lineHeight: scaleProductOverlay(48),
    marginVertical: scaleProductOverlay(6),
    color: "#111111",
    textAlign: "center",
  },

  cartOverlayProductColumnGroup: {
    position: "relative",
    width: "100%",
    alignItems: "stretch",
    justifyContent: "flex-start",
  },

  cartOverlayProductEntry: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    columnGap: 0,
    paddingHorizontal: 0,
    paddingVertical: scaleCartOverlayFilled(8),
    overflow: "visible",
  },

  cartOverlayProductLane: {
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  cartOverlayControlsLane: {
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  cartOverlayControlsGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  cartOverlayProductDivider: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: appHairlineWidth,
    backgroundColor: appHairlineColor,
  },

  cartOverlayProductRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    overflow: "visible",
  },

  cartOverlayProductBlock: {
    width: scaleCartOverlayAddedProduct(100.85229),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  cartOverlayQuantityFrame: {
    position: "relative",
    width: scaleCartOverlayAddedProduct(43.70625),
    height: scaleCartOverlayAddedProduct(41.625),
    marginTop: scaleCartOverlayAddedProduct(45.3215),
    marginLeft: scaleCartOverlayAddedProduct(10.86),
    borderRadius: scaleCartOverlayAddedProduct(10.5),
    overflow: "visible",
  },

  cartOverlayQuantityColumn: {
    width: scaleCartOverlayAddedProduct(39.335625),
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  cartOverlayQuantityTriangleButton: {
    width: scaleCartOverlayAddedProduct(39.335625),
    height: scaleCartOverlayAddedProduct(25.353),
    alignItems: "center",
    justifyContent: "center",
  },

  cartOverlayQuantityBox: {
    width: scaleCartOverlayAddedProduct(39.335625),
    height: scaleCartOverlayAddedProduct(37.4625),
  },

  cartOverlayQuantityNumber: {
    fontSize: scaleCartOverlayAddedProduct(15.84),
    lineHeight: scaleCartOverlayAddedProduct(19.8),
  },

  cartOverlayRemoveButton: {
    marginTop: 0,
    marginLeft: 0,
    borderRadius: 999,
    backgroundColor: "#B91F18",
    flexShrink: 0,
  },

  cartOverlayRemoveButtonText: {
    fontSize: scaleCartOverlayAddedProduct(32),
    lineHeight: scaleCartOverlayAddedProduct(32),
  },

  cartOverlayProductImage: {
    width: scaleCartOverlayAddedProduct(90.767061),
    height: scaleCartOverlayAddedProduct(90.767061),
    borderRadius: scaleCartOverlayAddedProduct(45.3835305),
  },

  cartOverlayProductName: {
    ...tightText,
    width: "100%",
    fontFamily: bodyFont,
    fontSize: scaleCartOverlayAddedProduct(11),
    lineHeight: scaleCartOverlayAddedProduct(11),
    fontWeight: "400",
    color: "#111111",
    textAlign: "center",
  },

  cartOverlayProductTotal: {
    ...tightText,
    fontFamily: bodyDemiBoldFont,
    fontSize: scaleCartOverlayAddedProduct(15),
    lineHeight: scaleCartOverlayAddedProduct(18),
    fontWeight: "900",
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
    ...tightText,
    width: "100%",
    fontFamily: bodyLightFont,
    fontSize: scaleProductOverlay(36),
    lineHeight: scaleProductOverlay(43.5),
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
    marginTop: scaleProductOverlay(20),
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
    paddingTop: scaleProductOverlay(16),
  },

  piccolaOverlayImageRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: scaleProductOverlay(-4),
    marginBottom: scaleProductOverlay(5),
  },

  piccolaOverlayImageStage: {
    flex: 1,
    height: scaleProductOverlay(201.70458),
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  piccolaOverlayImageMask: {
    width: scaleProductOverlay(201.70458),
    height: scaleProductOverlay(201.70458),
    borderRadius: scaleProductOverlay(100.85229),
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
    width: scaleProductOverlay(16),
    height: scaleProductOverlay(21),
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
    width: scaleProductOverlay(13.5),
    height: scaleProductOverlay(13.5),
    borderTopWidth: scaleProductOverlay(2.8125),
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
    borderLeftWidth: scaleProductOverlay(2.8125),
    transform: [{ rotate: "-45deg" }],
  },

  overlayImageArrowChevronRight: {
    borderRightWidth: scaleProductOverlay(2.8125),
    transform: [{ rotate: "45deg" }],
  },

  piccolaOverlayImage: {
    width: scaleProductOverlay(201.70458),
    height: scaleProductOverlay(201.70458),
    borderRadius: scaleProductOverlay(100.85229),
    marginBottom: 0,
  },

  piccolaOverlayAnimatedImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: scaleProductOverlay(201.70458),
    height: scaleProductOverlay(201.70458),
    borderRadius: scaleProductOverlay(100.85229),
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
    paddingBottom: scaleProductOverlay(7),
  },

  piccolaOverlayDescription: {
    ...tightText,
    width: "100%",
    fontFamily: bodyFont,
    fontSize: scaleProductOverlay(14.7),
    lineHeight: scaleProductOverlay(19.425),
    color: "#111111",
    textAlign: "justify",
  },

  piccolaOverlayDescriptionLead: {
    fontWeight: "700",
  },

  piccolaOverlayActionColumn: {
    position: "relative",
    width: scaleProductOverlay(77.22),
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scaleProductOverlay(7),
    overflow: "visible",
  },

  piccolaOverlayPopularTag: {
    ...tightText,
    position: "absolute",
    top: scaleProductOverlay(5.86),
    left: 0,
    right: 0,
    fontFamily: bodyFont,
    fontSize: scaleProductOverlay(12.5),
    lineHeight: scaleProductOverlay(12.5),
    fontWeight: "900",
    letterSpacing: scaleProductOverlay(0.5832),
    color: "#B91F18",
    textAlign: "center",
    opacity: 0.9,
  },

  piccolaOverlayPopularTagGreen: {
    color: "#247C3A",
  },

  piccolaOverlayPriceSlot: {
    position: "absolute",
    top: scaleProductOverlay(17.36),
    right: 0,
    bottom: scaleProductOverlay(42.5604),
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  piccolaOverlayPriceSlotBottom: {
    position: "absolute",
    right: 0,
    bottom: scaleProductOverlay(2.25),
    left: 0,
    height: scaleProductOverlay(27),
    alignItems: "center",
    justifyContent: "center",
  },

  piccolaOverlayPrice: {
    ...tightText,
    fontFamily: bodyLightFont,
    fontSize: scaleProductOverlay(19.9),
    lineHeight: scaleProductOverlay(27),
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
  },

  piccolaOverlayBuyButtonFrame: {
    position: "absolute",
    bottom: scaleProductOverlay(3),
    left: scaleProductOverlay(10.86),
    width: scaleProductOverlay(55.5),
    height: scaleProductOverlay(44.4),
    borderRadius: scaleProductOverlay(10.5),
    overflow: "visible",
  },

  piccolaOverlayBuyButtonShadowPlate: {
    ...tappableButtonShadowPlate,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: scaleProductOverlay(10.5),
  },

  piccolaOverlayBuyButtonShadowPlateTapped: {
    backgroundColor: "rgba(17, 17, 17, 0.035)",
  },

  piccolaOverlayBuyButton: {
    width: "100%",
    height: "100%",
    borderRadius: scaleProductOverlay(10.5),
    ...thickBlackBorderWithShadow,
    backgroundColor: "#247C3A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  piccolaOverlayBuyButtonAdded: {
    backgroundColor: "#FFFFFF",
  },

  piccolaOverlayBuyButtonTapped: {
    backgroundColor: "#92BE9D",
    borderColor: "#888888",
  },

  piccolaOverlayBuyButtonText: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: scaleProductOverlay(15.84),
    lineHeight: scaleProductOverlay(19.8),
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
    fontSize: scaleProductOverlay(15.84),
    lineHeight: scaleProductOverlay(19.8),
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
    width: scaleProductOverlay(29.1375),
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
    top: scaleProductOverlay(-47.9175),
    left: 0,
    width: scaleProductOverlay(29.1375),
    height: scaleProductOverlay(29.1375),
    borderRadius: scaleProductOverlay(10.5),
    zIndex: 1,
  },

  piccolaOverlayQuantityTopBoxFill: {
    backgroundColor: "#247C3A",
  },

  piccolaOverlayQuantityTopBoxPending: {
    backgroundColor: "#FFFFFF",
  },

  piccolaOverlayQuantityTopCheck: {
    transform: [{ translateY: scaleProductOverlay(-0.2) }],
  },

  piccolaOverlayQuantityFrame: {
    position: "absolute",
    top: scaleProductOverlay(6.9375),
    left: scaleProductOverlay(68.275),
    width: scaleProductOverlay(29.1375),
    height: scaleProductOverlay(41.625),
    borderRadius: scaleProductOverlay(10.5),
    overflow: "visible",
  },

  piccolaOverlayQuantityChevronOutside: {
    position: "absolute",
    left: 0,
    width: scaleProductOverlay(29.1375),
    height: scaleProductOverlay(18.78),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    elevation: 2,
  },

  piccolaOverlayQuantityChevronLeft: {
    top: scaleProductOverlay(-18.78),
  },

  piccolaOverlayQuantityChevronRight: {
    bottom: scaleProductOverlay(-18.78),
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
