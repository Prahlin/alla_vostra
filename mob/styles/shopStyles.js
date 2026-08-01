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
import {
  mainHorizontalPadding,
  mainMaxWidth,
  scaleLayout,
  scaleVerticalGap,
  isLargeAndroidViewport,
  isSmallAndroidViewport,
  smallAndroidCreamAreaScale,
} from "../utils/responsiveLayout";
import {
  shopOverlayActionToStickyButtonRatio,
  stickyButtonEdgeOffset,
  stickyButtonRadius,
  stickyButtonSize,
} from "../utils/stickyButtonLayout";

const shippingPreviewIOSLayoutScale = 0.77;
const scaleShippingPreview = (value) =>
  Platform.select({
    ios: value * shippingPreviewIOSLayoutScale,
    default: scaleVerticalGap(value) * smallAndroidCreamAreaScale,
  });
const shippingPreviewSmallAndroidStackScale = isSmallAndroidViewport ? 0.95 : 1;
const productOverlayIOSScale = 0.82;
const scaleProductOverlay = (value) =>
  Platform.select({
    ios: value * productOverlayIOSScale,
    default: value * smallAndroidCreamAreaScale,
  });
const productOverlayImageLargeAndroidScale = isLargeAndroidViewport ? 1.3 : 1;
const scaleProductOverlayImage = (value) =>
  scaleProductOverlay(value * productOverlayImageLargeAndroidScale);
const cartOverlayFilledIOSScale = 0.72;
const scaleCartOverlayFilled = (value) =>
  Platform.select({
    ios: value * cartOverlayFilledIOSScale,
    default: value * smallAndroidCreamAreaScale,
  });
const cartOverlayAddedProductAssetScale = 1.215;
const scaleCartOverlayAddedProduct = (value) =>
  scaleCartOverlayFilled(value * cartOverlayAddedProductAssetScale);
const cartOverlayReceiptIOSScale = 0.78;
const scaleCartOverlayReceipt = (value) =>
  Platform.select({
    ios: value * cartOverlayReceiptIOSScale,
    default: value * smallAndroidCreamAreaScale,
  });
const scaleCartOverlayGrandTotal = (value) =>
  Platform.select({
    ios: value * 0.68,
    default: value * smallAndroidCreamAreaScale,
  });
const scaleCartOverlayCheckoutBox = (value) =>
  Platform.select({
    ios: value * 0.78,
    default: value * smallAndroidCreamAreaScale,
  });
const isAndroidPlatform = Platform.OS === "android";
const isSmallAndroidPlatform = isAndroidPlatform && isSmallAndroidViewport;
const overlayActionButtonHeight = isAndroidPlatform
  ? stickyButtonSize * shopOverlayActionToStickyButtonRatio
  : scaleCartOverlayCheckoutBox(55.5);
const overlayActionButtonWidth = isAndroidPlatform
  ? overlayActionButtonHeight * 2
  : scaleCartOverlayCheckoutBox(111);
const overlayActionButtonRadius = isAndroidPlatform
  ? stickyButtonRadius * shopOverlayActionToStickyButtonRatio
  : scaleCartOverlayCheckoutBox(10.5);
const overlayActionButtonTextFontSize = isAndroidPlatform
  ? overlayActionButtonHeight * (15.84 / 55.5)
  : scaleCartOverlayGrandTotal(15.84);
const overlayProductActionButtonSize = isAndroidPlatform
  ? overlayActionButtonHeight
  : scaleProductOverlay(55.5);
const overlayProductActionButtonRadius = isAndroidPlatform
  ? overlayActionButtonRadius
  : scaleProductOverlay(10.5);
const overlayProductActionButtonTextFontSize = isAndroidPlatform
  ? isSmallAndroidPlatform
    ? scaleProductOverlay(15.84)
    : overlayProductActionButtonSize * (15.84 / 55.5)
  : scaleProductOverlay(15.84);
const overlayProductActionButtonTextLineHeight = isAndroidPlatform
  ? isSmallAndroidPlatform
    ? scaleProductOverlay(19.8)
    : overlayProductActionButtonSize * (19.8 / 55.5)
  : scaleProductOverlay(19.8);
const standardAndroidOverlayActionButtonHeight = 55.5;
const scaleAndroidOverlayActionRelative = (value) =>
  isAndroidPlatform
    ? overlayActionButtonHeight *
      (value / standardAndroidOverlayActionButtonHeight)
    : value;
const scaleProductOverlayText = (value) =>
  isAndroidPlatform
    ? scaleAndroidOverlayActionRelative(value)
    : scaleProductOverlay(value);
const scaleProductsOverlayText = (value) =>
  isSmallAndroidPlatform
    ? scaleProductOverlay(value)
    : scaleProductOverlayText(value);
const scaleShippingPreviewItem = (value) =>
  isSmallAndroidPlatform
    ? value * shippingPreviewSmallAndroidStackScale
    : scaleShippingPreview(value);
const scaleCartOverlayReceiptText = (value) =>
  isAndroidPlatform
    ? scaleAndroidOverlayActionRelative(value)
    : scaleCartOverlayReceipt(value);
const scaleCartOverlayGrandTotalText = (value) =>
  isAndroidPlatform
    ? scaleAndroidOverlayActionRelative(value)
    : scaleCartOverlayGrandTotal(value);
const scaleCartOverlayAddedProductText = (value) =>
  isAndroidPlatform
    ? scaleAndroidOverlayActionRelative(
        value * cartOverlayAddedProductAssetScale,
      )
    : scaleCartOverlayAddedProduct(value);
const confirmationOverlayButtonWidth = overlayActionButtonWidth;
const confirmationOverlayButtonHeight = overlayActionButtonHeight;
const confirmationOverlayFooterInset = 12;
const confirmationOverlayFooterBottom = 12;
const cartOverlayReceiptBlockWidth = "60%";
const cartOverlayReceiptQuantityColumnWidth = scaleCartOverlayReceipt(30);
const cartOverlayReceiptTotalColumnWidth = scaleCartOverlayReceipt(62);
const cartOverlayBottomFeeTaxSpacerHeight = Math.max(
  0,
  scaleCartOverlayGrandTotalText(46) - scaleCartOverlayReceiptText(32),
);
const shippingPreviewReadyTriangleHeight = 8.9775;
const shippingPreviewReadyTriangleWidth = 14.1075;
const shippingPreviewBackTriangleHeight = 9.975;
const shippingPreviewBackTriangleWidth = 15.675;
const shippingPreviewReadyButtonHeight = scaleLayout(55.5);
const shippingPreviewActionSideBoxWidth = scaleLayout(40.0640625);
const shippingPreviewActionSideBoxHeight = shippingPreviewReadyButtonHeight;
const shippingPreviewActionSideBoxGap = 0;
const shippingPreviewActionSideBoxBleed = scaleLayout(10);
const shippingPreviewActionCenterBandHeight = scaleLayout(3);
const overlayOrangeBandHeight = 28;
const appHairlineWidth = 0.375;
const appHairlineColor = "rgba(17, 17, 17, 0.28)";
const cartOverlayFilledDividerOpacity = 0.45;
const cartOverlayProductVerticalDividerWidth = isSmallAndroidViewport
  ? Math.max(appHairlineWidth, StyleSheet.hairlineWidth)
  : appHairlineWidth;
const deliveryOverlayHorizontalInset = 12;
const deliveryOverlayContactFieldGap = scaleAndroidOverlayActionRelative(8);
const deliveryOverlayFieldHeightScale = 0.81 * 1.25;
const deliveryOverlayDefaultFieldHeight = scaleAndroidOverlayActionRelative(
  48 * deliveryOverlayFieldHeightScale,
);
const deliveryOverlayIOSFieldHeight = 38.4 * deliveryOverlayFieldHeightScale;
const paymentOverlayCompactFieldHeight = Platform.select({
  ios: 30,
  default: scaleAndroidOverlayActionRelative(34),
});
const paymentOverlayCompactStripeCardHeight = Platform.select({
  ios: 220,
  default: scaleAndroidOverlayActionRelative(242),
});
const paymentOverlayCardDetailsDoneButtonHeight = isAndroidPlatform
  ? overlayActionButtonHeight
  : scaleCartOverlayCheckoutBox(36);
const deliveryTimeWheelOptionHeight = Platform.select({
  ios: deliveryOverlayIOSFieldHeight,
  default: deliveryOverlayDefaultFieldHeight,
});
const deliveryTimeWheelScrollStepHeight = deliveryTimeWheelOptionHeight * 1.25;
const deliveryTimeWheelVerticalInset = 0;
const deliveryTimeWheelBorderRadius = isAndroidPlatform
  ? scaleAndroidOverlayActionRelative(10.5)
  : scaleCartOverlayCheckoutBox(10.5);
const deliveryTimeWheelTriangleWidth = isAndroidPlatform
  ? scaleAndroidOverlayActionRelative(24)
  : scaleCartOverlayCheckoutBox(24);
const deliveryTimeWheelTriangleHeight =
  deliveryTimeWheelTriangleWidth * (28.17 / 43.70625);
const deliveryTimeWheelStackGap = scaleAndroidOverlayActionRelative(4);
const deliveryTimeWheelGroupHeight =
  deliveryTimeWheelOptionHeight +
  deliveryTimeWheelTriangleHeight * 2 +
  deliveryTimeWheelStackGap * 2;
const deliveryOverlayFieldLabelLineHeights = {
  ios: 10.5,
  default: scaleAndroidOverlayActionRelative(12.5),
};
const deliveryOverlayFieldInputLineHeights = {
  ios: 18,
  default: scaleAndroidOverlayActionRelative(19),
};
const deliveryOverlayDefaultInputHeight = Math.max(
  deliveryOverlayFieldInputLineHeights.default,
  scaleAndroidOverlayActionRelative(32 * deliveryOverlayFieldHeightScale),
);
const deliveryOverlayIOSInputHeight = Math.max(
  deliveryOverlayFieldInputLineHeights.ios,
  20 * deliveryOverlayFieldHeightScale,
);
const deliveryOverlayFieldVerticalPadding = Platform.select({
  ios: Math.max(
    0,
    (deliveryOverlayIOSFieldHeight -
      deliveryOverlayFieldLabelLineHeights.ios -
      deliveryOverlayIOSInputHeight) /
      2,
  ),
  default: Math.max(
    0,
    (deliveryOverlayDefaultFieldHeight -
      deliveryOverlayFieldLabelLineHeights.default -
      deliveryOverlayDefaultInputHeight) /
      2,
  ),
});
const deliveryOverlayPhoneCheckboxGap = deliveryOverlayContactFieldGap;
const deliveryOverlayPhoneCheckboxSize = Platform.select({
  ios: deliveryOverlayIOSFieldHeight / 2,
  default: deliveryOverlayDefaultFieldHeight / 2,
});
const deliveryOverlayIOSContactBlockHeight =
  deliveryOverlayIOSFieldHeight * 3 + deliveryOverlayContactFieldGap * 2;
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
    maxWidth: mainMaxWidth,
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: mainHorizontalPadding,
    paddingTop: scaleVerticalGap(26.8125),
  },

  shippingTitle: {
    width: "100%",
    marginBottom: scaleVerticalGap(84),
  },

  shippingTitleLine: {
    ...tightText,
    width: "100%",
    paddingHorizontal: scaleLayout(22),
    fontFamily: logoFont,
    fontSize: Platform.select({
      web: 39.375,
      default: scaleAndroidOverlayActionRelative(35.625),
    }),
    lineHeight: Platform.select({
      web: 45,
      default: scaleAndroidOverlayActionRelative(41.25),
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
      default: scaleAndroidOverlayActionRelative(24.4921875),
    }),
    lineHeight: Platform.select({
      web: 30.9375,
      default: scaleAndroidOverlayActionRelative(28.359375),
    }),
  },

  shippingTitleLogoLine: {
    marginTop: scaleVerticalGap(5.15625),
    fontSize: Platform.select({
      web: 70.875,
      default: scaleAndroidOverlayActionRelative(64.125),
    }),
    lineHeight: Platform.select({
      web: 81,
      default: scaleAndroidOverlayActionRelative(74.25),
    }),
  },

  shippingTitleVostraLine: {
    marginTop: -scaleVerticalGap(30),
  },

  shippingTitleAlwaysLine: {
    ...tightText,
    fontSize: Platform.select({
      web: 35.00698991625,
      ios: 20,
      default: scaleAndroidOverlayActionRelative(31.6729905525),
    }),
    lineHeight: Platform.select({
      web: 40.00798828125,
      ios: 23.5,
      default: scaleAndroidOverlayActionRelative(36.673989598125),
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
    width: scaleShippingPreviewItem(141.4423825),
    height: scaleShippingPreviewItem(141.4423825),
    marginHorizontal: 0,
  },

  shippingPreviewIconTruck: {
    width: scaleShippingPreviewItem(121.01386125),
    height: scaleShippingPreviewItem(121.01386125),
    marginHorizontal: 0,
    transform: [
      { translateX: scaleShippingPreviewItem(-2) },
      { translateY: scaleShippingPreviewItem(3) },
    ],
  },

  shippingPreviewIconBargain: {
    width: scaleShippingPreviewItem(141.4423825),
    height: scaleShippingPreviewItem(141.4423825),
    marginHorizontal: 0,
    transform: [{ translateX: scaleShippingPreviewItem(-5) }],
  },

  shippingPreviewIconLarge: {
    width: scaleShippingPreviewItem(127.75125),
    height: scaleShippingPreviewItem(89.3475),
    marginHorizontal: 0,
  },

  shippingPreviewIconSoflo: {
    width: scaleShippingPreviewItem(139.60546875),
    height: scaleShippingPreviewItem(139.60546875),
    marginHorizontal: 0,
    transform: [{ translateY: scaleShippingPreviewItem(1) }],
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
    width: scaleShippingPreviewItem(141.4423825),
    alignItems: "flex-end",
    justifyContent: "center",
  },

  shippingPreviewButtonSlot: {
    width: scaleShippingPreviewItem(160),
    marginLeft: scaleShippingPreviewItem(14),
    alignItems: "flex-start",
  },

  shippingPreviewItemButtonOuter: {
    borderRadius: scaleShippingPreviewItem(37.5),
    backgroundColor: "#f7b967",
    ...thickBlackBorderWithShadow,
    borderWidth: scaleShippingPreviewItem(2),
  },

  shippingPreviewItemButton: {
    position: "relative",
    minHeight: Platform.select({
      ios: scaleShippingPreview(78),
      default: scaleShippingPreviewItem(57.8125),
    }),
    backgroundColor: "#f7b967",
    borderWidth: scaleShippingPreviewItem(2),
    borderColor: "#f7b967",
    ...thickBlackBorderShadow,
    marginTop: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: "hidden",
  },

  shippingPreviewItemButtonChromeCorner: {
    position: "absolute",
    width: scaleShippingPreviewItem(52),
    height: scaleShippingPreviewItem(52),
    zIndex: 0,
    elevation: 0,
    overflow: "hidden",
  },

  shippingPreviewItemButtonChromeFill: {
    ...StyleSheet.absoluteFillObject,
  },

  shippingPreviewItemButtonChromeTopLeft: {
    top: scaleShippingPreviewItem(2),
    left: scaleShippingPreviewItem(2),
  },

  shippingPreviewItemButtonChromeTopRight: {
    top: scaleShippingPreviewItem(2),
    right: scaleShippingPreviewItem(2),
  },

  shippingPreviewItemButtonChromeBottomLeft: {
    bottom: scaleShippingPreviewItem(2),
    left: scaleShippingPreviewItem(2),
  },

  shippingPreviewItemButtonChromeBottomRight: {
    right: scaleShippingPreviewItem(2),
    bottom: scaleShippingPreviewItem(2),
  },

  shippingPreviewItemButtonInner: {
    position: "relative",
    minHeight: Platform.select({
      ios: scaleShippingPreview(72),
      default: scaleShippingPreviewItem(52.8125),
    }),
    borderRadius: scaleShippingPreviewItem(32.5),
    backgroundColor: "#FFFFFF",
    ...thickBlackBorderWithShadow,
    borderWidth: scaleShippingPreviewItem(2),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scaleShippingPreviewItem(26.25),
    paddingVertical: Platform.select({
      ios: scaleShippingPreview(11),
      default: scaleShippingPreviewItem(13.75),
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
    fontSize: Platform.select({
      ios: scaleShippingPreview(21.875),
      default:
        scaleAndroidOverlayActionRelative(21.875) *
        shippingPreviewSmallAndroidStackScale,
    }),
    lineHeight: Platform.select({
      ios: scaleShippingPreview(26.5625),
      default:
        scaleAndroidOverlayActionRelative(26.5625) *
        shippingPreviewSmallAndroidStackScale,
    }),
    fontWeight: Platform.select({
      ios: "900",
      default: "700",
    }),
    textAlign: "center",
  },

  shippingPreviewReadyButton: {
    width: "100%",
    height: shippingPreviewReadyButtonHeight,
    minHeight: shippingPreviewReadyButtonHeight,
    borderRadius: scaleLayout(10.5),
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
    borderTopRightRadius: scaleLayout(10.5),
    borderBottomRightRadius: scaleLayout(10.5),
  },

  shippingPreviewActionSideBoxFrameRight: {
    marginLeft: -shippingPreviewActionSideBoxBleed,
    borderTopLeftRadius: scaleLayout(10.5),
    borderBottomLeftRadius: scaleLayout(10.5),
  },

  shippingPreviewActionSideBoxFrameDimmed: {
    backgroundColor: "#FFD7A0",
  },

  shippingPreviewActionSideBoxFrameConfirmed: {
    backgroundColor: "#247C3A",
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
    borderTopRightRadius: scaleLayout(10.5),
    borderBottomRightRadius: scaleLayout(10.5),
  },

  shippingPreviewActionSideBoxShadowPlateRight: {
    borderTopLeftRadius: scaleLayout(10.5),
    borderBottomLeftRadius: scaleLayout(10.5),
  },

  shippingPreviewActionSideBoxShadowPlateDimmed: {
    backgroundColor: "rgba(17, 17, 17, 0.035)",
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
    overflow: "hidden",
  },

  shippingPreviewActionSideBoxLeft: {
    borderTopRightRadius: scaleLayout(10.5),
    borderBottomRightRadius: scaleLayout(10.5),
  },

  shippingPreviewActionSideBoxRight: {
    borderTopLeftRadius: scaleLayout(10.5),
    borderBottomLeftRadius: scaleLayout(10.5),
  },

  shippingPreviewActionSideBoxDimmed: {
    backgroundColor: "#FFD7A0",
    borderColor: "#888888",
  },

  shippingPreviewActionSideBoxConfirmed: {
    backgroundColor: "#247C3A",
  },

  shippingPreviewReadyButtonShadowFrame: {
    position: "relative",
    alignSelf: "center",
    borderRadius: scaleLayout(10.5),
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
    borderRadius: scaleLayout(10.5),
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

  shopOverlayStickyLeftFrame: {
    position: "absolute",
    left: stickyButtonEdgeOffset,
    width: stickyButtonSize,
    height: stickyButtonSize,
    borderRadius: stickyButtonRadius,
    zIndex: 1000002,
    elevation: 1000002,
    overflow: "visible",
  },

  shopOverlayStickyLeftShadowPlate: {
    ...tappableButtonShadowPlate,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: stickyButtonRadius,
  },

  shopOverlayStickyLeftButton: {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius: stickyButtonRadius,
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  shopOverlayStickyLeftX: {
    position: "relative",
    width: scaleLayout(24),
    height: scaleLayout(24),
    zIndex: 1,
    elevation: 1,
  },

  shopOverlayStickyLeftXStroke: {
    position: "absolute",
    top: scaleLayout(10),
    left: 0,
    width: scaleLayout(24),
    height: scaleLayout(4),
    borderRadius: scaleLayout(2),
    backgroundColor: "#FFFFFF",
  },

  shopOverlayStickyLeftXStrokeForward: {
    transform: [{ rotate: "45deg" }],
  },

  shopOverlayStickyLeftXStrokeBack: {
    transform: [{ rotate: "-45deg" }],
  },

  shippingPreviewGoBackSideButtonFrame: {
    position: "absolute",
    height: scaleLayout(55.5),
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
    borderRadius: scaleLayout(10.5),
  },

  shippingPreviewGoBackSideButton: {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius: scaleLayout(10.5),
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
    fontSize: Platform.select({
      ios: scaleShippingPreview(15),
      default: scaleAndroidOverlayActionRelative(15),
    }),
    lineHeight: Platform.select({
      ios: scaleShippingPreview(15),
      default: scaleAndroidOverlayActionRelative(15),
    }),
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
    backgroundColor: "#FFFCF2",
    overflow: "hidden",
  },

  shippingPreviewActionButtonBandConfirmed: {
    backgroundColor: "#247C3A",
  },

  shippingPreviewActionButtonBandTrack: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },

  shippingPreviewActionButtonBandSegment: {
    flex: 1,
    height: "100%",
    backgroundColor: "#FFFCF2",
  },

  shippingPreviewActionButtonBandActiveSegment: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    height: "100%",
    backgroundColor: "#f7b967",
    zIndex: 2,
    elevation: 0,
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
    borderLeftColor: "#FFFFFF",
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
    fontSize: scaleAndroidOverlayActionRelative(17.5),
    lineHeight: scaleAndroidOverlayActionRelative(21.25),
    color: "#f7b967",
  },

  shippingPreviewReadyButtonTextPrimary: {
    height: Platform.select({
      ios: undefined,
      default: shippingPreviewReadyButtonHeight,
    }),
    fontFamily: Platform.select({
      ios: bodyDemiBoldFont,
      default: bodyFont,
    }),
    color: "#FFFFFF",
    fontSize: Platform.select({
      ios: scaleShippingPreview(18.875),
      default: scaleAndroidOverlayActionRelative(18.875),
    }),
    lineHeight: Platform.select({
      ios: scaleShippingPreview(26.5625),
      default: shippingPreviewReadyButtonHeight,
    }),
    fontWeight: Platform.select({
      ios: "900",
      default: "700",
    }),
    textAlignVertical: "center",
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

    fontSize: scaleAndroidOverlayActionRelative(18),

    lineHeight: scaleAndroidOverlayActionRelative(30),

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
    fontSize: scaleAndroidOverlayActionRelative(31),
    lineHeight: scaleAndroidOverlayActionRelative(37),
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },

  shippingPillTextOverlay: {
    fontSize: scaleAndroidOverlayActionRelative(14),
    lineHeight: scaleAndroidOverlayActionRelative(17),
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
      default: scaleAndroidOverlayActionRelative(38),
    }),
    lineHeight: Platform.select({
      web: 48,
      default: scaleAndroidOverlayActionRelative(44),
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
    fontSize: scaleAndroidOverlayActionRelative(34),
    lineHeight: scaleAndroidOverlayActionRelative(41),
    color: "#111111",
    textAlign: "center",
    marginBottom: 16,
  },

  productPrice: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: scaleAndroidOverlayActionRelative(22),
    lineHeight: scaleAndroidOverlayActionRelative(32),
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
    fontSize: scaleAndroidOverlayActionRelative(16),
    lineHeight: scaleAndroidOverlayActionRelative(22),
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
    overflow: "hidden",
  },

  piccolaOverlayNavActiveIndicatorSharedGradient: {
    position: "absolute",
    left: 0,
    right: 0,
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
    fontSize: scaleProductsOverlayText(18),
    lineHeight: scaleProductsOverlayText(22.5),
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

  cartOverlayCreamScrollbar: {
    position: "absolute",
    width: 8,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: appHairlineWidth * 2,
    borderBottomWidth: 0,
    borderColor: "#111111",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    zIndex: 5,
  },

  cartOverlayCreamScrollbarDimmed: {
    opacity: 0.38,
  },

  cartOverlayCreamScrollbarThumb: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: "#f7b967",
  },

  cartOverlayCreamScrollbarThumbDimmed: {
    backgroundColor: "#FFFFFF",
  },

  deliveryOverlayContent: {
    position: "absolute",
    top: overlayOrangeBandHeight,
    right: 0,
    bottom: 28,
    left: 0,
    backgroundColor: "#FFFCF2",
    paddingHorizontal: deliveryOverlayHorizontalInset,
    paddingTop: 16,
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
    overflow: "hidden",
  },

  paymentOverlayScroll: {
    flex: 1,
    width: "100%",
  },

  paymentOverlayScrollContent: {
    width: "100%",
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
      default: scaleAndroidOverlayActionRelative(15),
    }),
    lineHeight: Platform.select({
      ios: 16,
      default: scaleAndroidOverlayActionRelative(18),
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
    fontSize: scaleAndroidOverlayActionRelative(15),
    lineHeight: scaleAndroidOverlayActionRelative(18),
    fontWeight: "900",
    color: "#111111",
    textAlign: "left",
    marginBottom: 8,
  },

  paymentOverlaySectionHeading: {
    ...tightText,
    width: "100%",
    fontFamily: bodyDemiBoldFont,
    fontSize: scaleAndroidOverlayActionRelative(15),
    lineHeight: scaleAndroidOverlayActionRelative(18),
    fontWeight: "900",
    color: "#111111",
    textAlign: "left",
  },

  paymentOverlayMethodList: {
    width: "100%",
    marginTop: 8,
    rowGap: 6,
  },

  paymentOverlayCardForm: {
    width: "100%",
    marginTop: 10,
  },

  paymentOverlayCardDetailsPopup: {
    alignItems: "stretch",
    justifyContent: "flex-start",
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: paymentOverlayCardDetailsDoneButtonHeight + 18,
  },

  paymentOverlayCardDetailsScroll: {
    flex: 1,
    width: "100%",
    overflow: "visible",
  },

  paymentOverlayCardDetailsScrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: isSmallAndroidPlatform ? 10 : 0,
  },

  paymentOverlayCardDetailsDoneButton: {
    position: "absolute",
    right: 8,
    bottom: 8,
    left: 8,
    height: paymentOverlayCardDetailsDoneButtonHeight,
    borderRadius: isAndroidPlatform
      ? overlayActionButtonRadius
      : scaleCartOverlayCheckoutBox(10.5),
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  paymentOverlayStripeCardBlock: {
    width: "100%",
    flexShrink: 1,
    rowGap: 3,
    marginBottom: 0,
    overflow: "visible",
  },

  paymentOverlayStripeCardLabel: {
    ...tightText,
    width: "100%",
    fontFamily: bodyDemiBoldFont,
    fontSize: Platform.select({
      ios: 8.5,
      default: scaleAndroidOverlayActionRelative(10.5),
    }),
    lineHeight: Platform.select(deliveryOverlayFieldLabelLineHeights),
    fontWeight: "900",
    color: "#111111",
    textAlign: "left",
  },

  paymentOverlayStripeCardFormFrame: {
    width: "100%",
    height: paymentOverlayCompactStripeCardHeight,
    maxHeight: "100%",
    borderWidth: appHairlineWidth,
    borderColor: appHairlineColor,
    backgroundColor: "#FFFFFF",
    overflow: "visible",
  },

  paymentOverlayStripeCardForm: {
    width: "100%",
    height: "100%",
  },

  paymentOverlayPayPalPopup: {
    justifyContent: "center",
  },

  paymentOverlayPayPalContent: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingBottom: paymentOverlayCardDetailsDoneButtonHeight,
    rowGap: 8,
  },

  paymentOverlayPayPalLogo: {
    width: "44%",
    height: 58,
  },

  paymentOverlayPayPalTitle: {
    ...tightText,
    width: "100%",
    fontFamily: bodyDemiBoldFont,
    fontSize: scaleAndroidOverlayActionRelative(24),
    lineHeight: scaleAndroidOverlayActionRelative(30),
    fontWeight: "900",
    color: "#111111",
    textAlign: "center",
  },

  paymentOverlayPayPalBody: {
    ...tightText,
    width: "100%",
    fontFamily: bodyFont,
    fontSize: scaleAndroidOverlayActionRelative(15),
    lineHeight: scaleAndroidOverlayActionRelative(19),
    color: "#4F4F4F",
    textAlign: "center",
  },

  paymentOverlayWalletMethodRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    columnGap: 8,
  },

  paymentOverlayCardMethodStack: {
    alignItems: "center",
    justifyContent: "flex-start",
    rowGap: 8,
  },

  paymentOverlayCardAcceptedBadge: {
    width: scaleCartOverlayCheckoutBox(39),
    height: scaleCartOverlayCheckoutBox(39),
    borderRadius: scaleCartOverlayCheckoutBox(6),
    backgroundColor: "#247C3A",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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

  paymentOverlayWalletMethodButton: {
    borderWidth: appHairlineWidth,
    borderColor: appHairlineColor,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 0,
    overflow: "hidden",
  },

  paymentOverlayWalletMethodButtonSelected: {
    borderWidth: Math.max(2, appHairlineWidth),
    borderColor: "#247C3A",
  },

  paymentOverlayWalletMethodImage: {
    flexShrink: 0,
  },

  paymentOverlayMethodButtonText: {
    ...tightText,
    width: "100%",
    fontFamily: bodyDemiBoldFont,
    fontSize: scaleAndroidOverlayActionRelative(13),
    lineHeight: scaleAndroidOverlayActionRelative(16),
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
    top: 12,
    right: confirmationOverlayFooterInset,
    bottom:
      confirmationOverlayFooterBottom +
      confirmationOverlayButtonHeight +
      confirmationOverlayFooterInset,
    left: confirmationOverlayFooterInset,
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
    height: "100%",
    alignItems: "stretch",
    justifyContent: "flex-start",
    rowGap: 0,
  },

  confirmationOverlayOrderPopupFull: {
    height: "100%",
  },

  confirmationOverlayOrderPopupText: {
    ...tightText,
    width: "100%",
    flex: 2,
    fontFamily: bodyFont,
    fontSize: scaleAndroidOverlayActionRelative(26),
    lineHeight: scaleAndroidOverlayActionRelative(32),
    fontWeight: "400",
    color: "#111111",
    textAlign: "center",
    textAlignVertical: "center",
  },

  confirmationOverlayOrderPopupTextBrand: {
    fontFamily: bodyFont,
    fontWeight: "900",
  },

  confirmationOverlayCartTextAssets: {
    width: "100%",
    flex: 3,
    position: "relative",
    borderBottomWidth: appHairlineWidth,
    borderBottomColor: appHairlineColor,
    flexShrink: 1,
    overflow: "visible",
  },

  confirmationOverlayCartTextProductRows: {
    left: 0,
    width: "100%",
  },

  confirmationOverlayCartTextSummaryColumn: {
    left: 0,
    width: "100%",
  },

  confirmationOverlayCartTextGrandTotalAnchor: {
    position: "absolute",
    right: 0,
    bottom: scaleCartOverlayReceipt(12),
    width: scaleCartOverlayGrandTotal(111),
    height:
      scaleCartOverlayReceipt(24) +
      cartOverlayBottomFeeTaxSpacerHeight +
      scaleCartOverlayReceipt(24),
  },

  confirmationOverlayCartTextGrandTotalBox: {
    width: "100%",
    height: "100%",
    borderWidth: appHairlineWidth,
    borderColor: appHairlineColor,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },

  confirmationOverlayCartTextGrandTotalLabelCell: {
    height: scaleCartOverlayReceipt(24),
    alignItems: "center",
    justifyContent: "center",
    paddingTop: scaleCartOverlayReceipt(2),
  },

  confirmationOverlayCartTextGrandTotalLabelText: {
    ...tightText,
    width: "100%",
    fontFamily: bodyFont,
    fontSize: scaleCartOverlayReceiptText(19.5),
    lineHeight: scaleCartOverlayReceiptText(21),
    fontWeight: "900",
    color: "#111111",
    textAlign: "center",
    textAlignVertical: "center",
  },

  confirmationOverlayCartTextGrandTotalAmountCell: {
    ...tightText,
    height: scaleCartOverlayReceipt(24),
    marginTop: cartOverlayBottomFeeTaxSpacerHeight,
    borderTopWidth: appHairlineWidth,
    borderTopColor: appHairlineColor,
    paddingHorizontal: scaleCartOverlayGrandTotal(6.25),
    fontFamily: bodyFont,
    fontSize: scaleCartOverlayReceiptText(21),
    lineHeight: scaleCartOverlayReceiptText(24),
    fontWeight: "900",
    color: "#247C3A",
    textAlign: "center",
  },

  confirmationOverlayCartTextScaledName: {
    fontFamily: bodyFont,
    fontSize: scaleCartOverlayReceiptText(19.5),
    lineHeight: scaleCartOverlayReceiptText(24),
  },

  confirmationOverlayCartTextScaledValue: {
    fontFamily: bodyFont,
    fontSize: scaleCartOverlayReceiptText(19.5),
    lineHeight: scaleCartOverlayReceiptText(24),
  },

  confirmationOverlayCartTextScaledTotalLetter: {
    fontFamily: bodyFont,
    fontSize: scaleCartOverlayReceiptText(24),
    lineHeight: scaleCartOverlayReceiptText(28.5),
  },

  confirmationOverlayCartTextScaledTotalAmount: {
    fontFamily: bodyFont,
    fontSize: scaleCartOverlayReceiptText(21),
    lineHeight: scaleCartOverlayReceiptText(25.5),
  },

  confirmationOverlayCartTextInnerDivider: {
    width: "100%",
    borderTopWidth: appHairlineWidth,
    borderTopColor: appHairlineColor,
  },

  confirmationOverlayOrderPopupTextFull: {
    flex: 0,
    fontFamily: bodyFont,
    fontSize: scaleProductOverlayText(28),
    lineHeight: scaleProductOverlayText(34),
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
    fontSize: scaleProductOverlayText(40),
    lineHeight: scaleProductOverlayText(48),
    marginVertical: scaleProductOverlay(6),
    color: "#111111",
    textAlign: "center",
  },

  confirmationOverlayRateButton: {
    width: scaleProductOverlay(226),
    height: scaleProductOverlay(50),
    marginTop: scaleProductOverlay(14),
    borderRadius: scaleProductOverlay(8.5),
    backgroundColor: "#FFFCF2",
    ...thickBlackBorderWithShadow,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scaleProductOverlay(12),
    overflow: "visible",
  },

  confirmationOverlayRateButtonTextStack: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: scaleProductOverlay(8),
    alignItems: "center",
    justifyContent: "center",
  },

  confirmationOverlayRateButtonTitle: {
    ...tightText,
    width: "100%",
    fontFamily: bodyDemiBoldFont,
    fontSize: scaleProductOverlayText(13.5),
    lineHeight: scaleProductOverlayText(15.5),
    fontWeight: "900",
    color: "#111111",
    textAlign: "center",
  },

  confirmationOverlayRateButtonSubtitle: {
    ...tightText,
    width: "100%",
    fontFamily: bodyFont,
    fontSize: scaleProductOverlayText(11.7),
    lineHeight: scaleProductOverlayText(13.7),
    fontWeight: "400",
    color: "#111111",
    textAlign: "center",
  },

  confirmationOverlayButton: {
    position: "absolute",
    zIndex: 5,
    elevation: 5,
    width: confirmationOverlayButtonWidth,
    height: confirmationOverlayButtonHeight,
    borderRadius: overlayActionButtonRadius,
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  confirmationOverlayButtonGradient: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  confirmationOverlayYesButton: {
    right: confirmationOverlayFooterInset,
    bottom: confirmationOverlayFooterBottom,
    backgroundColor: "#247C3A",
  },

  confirmationOverlayNoButton: {
    left: confirmationOverlayFooterInset,
    bottom: confirmationOverlayFooterBottom,
    backgroundColor: "#C62828",
  },

  deliveryOverlayRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
    marginBottom: 8,
    overflow: "hidden",
  },

  deliveryOverlayRowCompact: {
    marginBottom: 4,
  },

  deliveryOverlayRowWithStateMessage: {
    marginBottom: deliveryOverlayContactFieldGap,
  },

  deliveryOverlayRowDoubleGapAfter: {
    marginBottom: 16,
  },

  deliveryOverlayFieldGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    columnGap: 6,
    overflow: "hidden",
  },

  deliveryOverlayFieldSpacer: {
    flex: 1,
    minWidth: 0,
  },

  deliveryOverlayStateMessageRow: {
    width: "100%",
    flexDirection: "row",
    columnGap: 6,
    marginBottom: 6,
  },

  deliveryOverlayStateMessageSpacer: {
    display: "none",
    minWidth: 0,
  },

  deliveryOverlayStateMessageText: {
    ...tightText,
    flex: 1,
    minWidth: 0,
    fontFamily: bodyDemiBoldFont,
    fontSize: Platform.select({
      ios: 9.6,
      default: scaleAndroidOverlayActionRelative(13.6),
    }),
    lineHeight: Platform.select({
      ios: 12.4,
      default: scaleAndroidOverlayActionRelative(16.4),
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
    marginBottom: 8,
    overflow: Platform.select({
      ios: "visible",
      default: "visible",
    }),
  },

  deliveryOverlayContactFieldsColumn: {
    width: "100%",
    height: Platform.select({
      ios: deliveryOverlayIOSContactBlockHeight,
      default: undefined,
    }),
    minWidth: 0,
    rowGap: deliveryOverlayContactFieldGap,
  },

  deliveryOverlayContactFieldsRow: {
    width: "100%",
    flexDirection: "row",
    columnGap: 6,
    overflow: "visible",
  },

  deliveryOverlayContactFieldRow: {
    width: "100%",
    flexDirection: "row",
    overflow: "hidden",
  },

  deliveryOverlayContactFieldStack: {
    flex: 1,
    minWidth: 0,
    rowGap: deliveryOverlayPhoneCheckboxGap,
    overflow: "visible",
  },

  deliveryOverlayGiftControlStack: {
    justifyContent: "center",
  },

  deliveryOverlayPhoneCheckboxRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
    overflow: "visible",
  },

  deliveryOverlayPhoneCheckbox: {
    width: deliveryOverlayPhoneCheckboxSize,
    height: deliveryOverlayPhoneCheckboxSize,
    borderWidth: appHairlineWidth,
    borderColor: appHairlineColor,
    backgroundColor: deliveryOverlayInactiveFieldColor,
    alignItems: "center",
    justifyContent: "center",
  },

  deliveryOverlayPhoneCheckboxChecked: {
    backgroundColor: "#FFFFFF",
  },

  deliveryOverlayPhoneCheckboxPressed: {
    opacity: 0.72,
  },

  deliveryOverlayPhoneCheckboxLabel: {
    ...tightText,
    fontFamily: bodyFont,
    fontSize: Platform.select({
      ios: 12,
      default: scaleAndroidOverlayActionRelative(14),
    }),
    lineHeight: Platform.select({
      ios: 14,
      default: scaleAndroidOverlayActionRelative(16),
    }),
    color: "#111111",
    textAlign: "left",
  },

  deliveryOverlayContactEmailErrorText: {
    ...tightText,
    width: "100%",
    fontFamily: bodyFont,
    fontSize: Platform.select({
      ios: 9.5,
      default: scaleAndroidOverlayActionRelative(11.5),
    }),
    lineHeight: Platform.select({
      ios: 11,
      default: scaleAndroidOverlayActionRelative(13),
    }),
    color: "#9B1C1C",
    textAlign: "left",
  },

  deliveryOverlayField: {
    flex: 1,
    minWidth: 0,
    position: "relative",
    height: Platform.select({
      ios: deliveryOverlayIOSFieldHeight,
      default: deliveryOverlayDefaultFieldHeight,
    }),
    borderWidth: appHairlineWidth,
    borderColor: appHairlineColor,
    backgroundColor: deliveryOverlayInactiveFieldColor,
    paddingHorizontal: 8,
    paddingVertical: 0,
    justifyContent: "center",
    overflow: "hidden",
  },

  deliveryOverlayFieldCompact: {
    height: paymentOverlayCompactFieldHeight,
    paddingHorizontal: 6,
  },

  deliveryOverlayFieldStateSurface: {
    backgroundColor: "#FFFFFF",
    opacity: 1,
  },

  deliveryOverlayFieldFaulty: {
    backgroundColor: "#FFF4F2",
    borderColor: "rgba(155, 28, 28, 0.42)",
  },

  deliveryOverlayFieldDisabled: {
    backgroundColor: deliveryOverlayInactiveFieldColor,
  },

  deliveryOverlayStateField: {
    backgroundColor: "#FFFFFF",
    opacity: 1,
    zIndex: 1,
    elevation: 0,
  },

  paymentOverlayIssuerFieldFrame: {
    minWidth: 0,
    height: Platform.select({
      ios: deliveryOverlayIOSFieldHeight,
      default: deliveryOverlayDefaultFieldHeight,
    }),
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
    justifyContent: "space-between",
    overflow: "visible",
  },

  deliveryOverlayFieldLabel: {
    ...tightText,
    width: "100%",
    fontFamily: bodyDemiBoldFont,
    fontSize: Platform.select({
      ios: 8.5,
      default: scaleAndroidOverlayActionRelative(10.5),
    }),
    lineHeight: Platform.select(deliveryOverlayFieldLabelLineHeights),
    fontWeight: "900",
    color: "#111111",
    textAlign: "left",
  },

  deliveryOverlayFieldLabelDisabled: {
    color: "rgba(17, 17, 17, 0.46)",
  },

  deliveryOverlayFieldPrompt: {
    position: "absolute",
    top: 0,
    right: 8,
    bottom: 0,
    left: 8,
    justifyContent: "center",
    zIndex: 2,
    elevation: 2,
  },

  deliveryOverlayFieldPromptText: {
    ...tightText,
    width: "100%",
    fontFamily: bodyDemiBoldFont,
    fontSize: Platform.select({
      ios: 12,
      default: scaleAndroidOverlayActionRelative(15),
    }),
    lineHeight: Platform.select(deliveryOverlayFieldInputLineHeights),
    fontWeight: "800",
    color: "rgba(17, 17, 17, 0.34)",
    textAlign: "left",
  },

  deliveryOverlayFieldPromptTextCompact: {
    fontSize: Platform.select({
      ios: 10,
      default: scaleAndroidOverlayActionRelative(13),
    }),
    lineHeight: Platform.select({
      ios: 12,
      default: scaleAndroidOverlayActionRelative(15),
    }),
  },

  deliveryOverlayFieldPromptTextDisabled: {
    color: "rgba(17, 17, 17, 0.34)",
  },

  paymentOverlayIssuerLabel: {
    ...tightText,
    flexShrink: 0,
    fontFamily: bodyDemiBoldFont,
    fontSize: Platform.select({
      ios: 8.5,
      default: scaleAndroidOverlayActionRelative(10.5),
    }),
    lineHeight: Platform.select(deliveryOverlayFieldLabelLineHeights),
    fontWeight: "900",
    color: "#111111",
    textAlign: "left",
  },

  paymentOverlayIssuerDropdownBox: {
    flex: 1,
    minWidth: 0,
    height: Platform.select({
      ios: deliveryOverlayIOSFieldHeight,
      default: deliveryOverlayDefaultFieldHeight,
    }),
    borderWidth: appHairlineWidth,
    borderColor: appHairlineColor,
    backgroundColor: deliveryOverlayInactiveFieldColor,
    paddingHorizontal: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 4,
    overflow: "hidden",
  },

  deliveryOverlayFieldInput: {
    width: "100%",
    height: "100%",
    margin: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    includeFontPadding: true,
    fontSize: Platform.select({
      ios: 15,
      default: scaleAndroidOverlayActionRelative(15),
    }),
    lineHeight: Platform.select(deliveryOverlayFieldInputLineHeights),
    color: "#111111",
    textAlign: "left",
    textAlignVertical: "center",
  },

  deliveryOverlayFieldInputCompact: {
    fontSize: Platform.select({
      ios: 12,
      default: scaleAndroidOverlayActionRelative(13),
    }),
    lineHeight: Platform.select({
      ios: 14,
      default: scaleAndroidOverlayActionRelative(15),
    }),
  },

  deliveryOverlayFieldInputDisabled: {
    color: "rgba(17, 17, 17, 0.46)",
  },

  deliveryOverlayFieldInputStateSurface: {
    backgroundColor: "#FFFFFF",
    opacity: 1,
  },

  deliveryOverlayFieldInputFaulty: {
    backgroundColor: "#FFF4F2",
  },

  deliveryOverlayStateButton: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: scaleAndroidOverlayActionRelative(4),
  },

  deliveryOverlayStateButtonText: {
    ...tightText,
    flex: 1,
    minWidth: 0,
    fontFamily: bodyFont,
    fontSize: Platform.select({
      ios: 15,
      default: scaleAndroidOverlayActionRelative(15),
    }),
    lineHeight: Platform.select(deliveryOverlayFieldInputLineHeights),
    color: "#111111",
    textAlign: "left",
  },

  deliveryOverlayStateButtonTriangle: {
    width: scaleAndroidOverlayActionRelative(7),
    height: scaleAndroidOverlayActionRelative(5),
    flexShrink: 0,
  },

  deliveryTimeWheelGroup: {
    minWidth: 0,
    height: deliveryTimeWheelGroupHeight,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
    overflow: "visible",
  },

  deliveryTimeWheelStack: {
    flex: 1,
    minWidth: 0,
    height: deliveryTimeWheelGroupHeight,
    alignItems: "center",
    justifyContent: "center",
    rowGap: deliveryTimeWheelStackGap,
    overflow: "visible",
  },

  deliveryTimeWheelTriangle: {
    width: "100%",
    height: deliveryTimeWheelTriangleHeight,
    flexShrink: 0,
  },

  deliveryTimeWheelColumn: {
    width: "100%",
    minWidth: 0,
    height: Platform.select({
      ios: deliveryOverlayIOSFieldHeight,
      default: deliveryOverlayDefaultFieldHeight,
    }),
    position: "relative",
    borderRadius: deliveryTimeWheelBorderRadius,
    backgroundColor: "#FFFFFF",
    ...thickBlackBorder,
    overflow: "hidden",
  },

  deliveryTimeWheelCenterBand: {
    position: "absolute",
    top: deliveryTimeWheelVerticalInset,
    right: 0,
    left: 0,
    height: deliveryTimeWheelOptionHeight,
    backgroundColor: "#FFFFFF",
  },

  deliveryTimeWheelScroll: {
    width: "100%",
    height: "100%",
  },

  deliveryTimeWheelScrollContent: {
    paddingVertical: deliveryTimeWheelVerticalInset,
  },

  deliveryTimeWheelOption: {
    width: "100%",
    height: deliveryTimeWheelScrollStepHeight,
    minHeight: deliveryTimeWheelScrollStepHeight,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 1,
  },

  deliveryTimeWheelOptionContent: {
    width: "100%",
    height: deliveryTimeWheelOptionHeight,
    alignItems: "center",
    justifyContent: "center",
  },

  deliveryTimeWheelOptionText: {
    ...tightText,
    width: "100%",
    fontFamily: bodyDemiBoldFont,
    fontSize: Platform.select({
      ios: 19,
      default: scaleAndroidOverlayActionRelative(23),
    }),
    lineHeight: Platform.select({
      ios: 23,
      default: scaleAndroidOverlayActionRelative(27),
    }),
    fontWeight: "900",
    color: "#111111",
    textAlign: "center",
  },

  deliveryTimeWheelOptionTextSelected: {
    color: "#111111",
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
    height: scaleAndroidOverlayActionRelative(28),
    minHeight: scaleAndroidOverlayActionRelative(28),
    justifyContent: "center",
    borderBottomWidth: appHairlineWidth,
    borderBottomColor: "rgba(17, 17, 17, 0.14)",
    paddingHorizontal: scaleAndroidOverlayActionRelative(7),
    paddingVertical: scaleAndroidOverlayActionRelative(5),
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
      default: scaleAndroidOverlayActionRelative(13),
    }),
    lineHeight: Platform.select({
      ios: 14,
      default: scaleAndroidOverlayActionRelative(16),
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

  cartOverlayBottomGrandTotalAnchor: {
    position: "absolute",
    left: scaleCartOverlayReceipt(12),
    bottom: 12,
    width: cartOverlayReceiptBlockWidth,
    height: scaleCartOverlayGrandTotal(50),
  },

  cartOverlayBottomGrandTotal: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: scaleCartOverlayGrandTotal(111),
    alignItems: "flex-end",
  },

  cartOverlayBottomGrandTotalStack: {
    alignItems: "center",
    justifyContent: "flex-end",
    flexGrow: 1,
    width: "100%",
  },

  cartOverlayBottomGrandTotalOuterBox: {
    height: "100%",
    borderWidth: appHairlineWidth,
    borderColor: appHairlineColor,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  cartOverlayBottomGrandTotalLabel: {
    minWidth: scaleCartOverlayGrandTotal(55),
    width: "100%",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },

  cartOverlayBottomGrandTotalLabelLetter: {
    ...tightText,
    fontFamily: Platform.select({
      ios: bodyDemiBoldFont,
      default: bodyLightFont,
    }),
    fontSize: scaleCartOverlayReceiptText(16),
    lineHeight: scaleCartOverlayReceiptText(19),
    fontWeight: "900",
    color: "#111111",
    textAlign: "center",
  },

  cartOverlayBottomGrandTotalLabelLetterCompact: {
    fontSize: scaleCartOverlayGrandTotalText(17.25),
    lineHeight: scaleCartOverlayGrandTotalText(21),
  },

  cartOverlayBottomGrandTotalAmount: {
    ...tightText,
    minWidth: scaleCartOverlayGrandTotal(55),
    borderTopWidth: appHairlineWidth,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderColor: appHairlineColor,
    paddingHorizontal: scaleCartOverlayGrandTotal(6.25),
    fontFamily: bodyLightFont,
    fontSize: scaleCartOverlayReceiptText(14),
    lineHeight: scaleCartOverlayReceiptText(17),
    fontWeight: "900",
    color: "#247C3A",
    textAlign: "center",
  },

  cartOverlayBottomGrandTotalAmountCompact: {
    fontSize: scaleCartOverlayGrandTotalText(17.25),
    lineHeight: scaleCartOverlayGrandTotalText(21),
  },

  cartOverlayBottomGrandTotalAmountMeasure: {
    position: "absolute",
    left: 0,
    bottom: 0,
    opacity: 0,
  },

  cartOverlayCheckoutButton: {
    position: "absolute",
    right: 12,
    bottom: 12 + overlayActionButtonHeight / 2,
    width: overlayActionButtonWidth,
    height: overlayActionButtonHeight,
    borderRadius: overlayActionButtonRadius,
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  cartOverlayAddItemsButton: {
    backgroundColor: "#247C3A",
  },

  cartOverlayAddItemsButtonDimmed: {
    backgroundColor: "#92BE9D",
    borderColor: "#888888",
  },

  paymentOverlayCheckoutButton: {
    position: "absolute",
    right: 12,
    bottom: 12 + overlayActionButtonHeight / 2,
    width: overlayActionButtonWidth,
    height: overlayActionButtonHeight,
    borderRadius: overlayActionButtonRadius,
    backgroundColor: "#f7b967",
    ...thickBlackBorder,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  paymentOverlayCheckoutButtonDimmed: {
    backgroundColor: "#FFD7A0",
    borderColor: "#888888",
  },

  cartOverlayCheckoutButtonText: {
    ...tightText,
    height: Platform.select({
      ios: undefined,
      default: overlayActionButtonHeight,
    }),
    fontFamily: bodyFont,
    fontSize: overlayActionButtonTextFontSize,
    lineHeight: Platform.select({
      ios: scaleCartOverlayGrandTotal(19.8),
      default: overlayActionButtonHeight,
    }),
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    textAlignVertical: "center",
    zIndex: 1,
    elevation: 1,
  },

  cartOverlayCheckoutButtonTextDimmed: {
    color: "#FFFFFF",
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

  cartOverlayBottomFeeTaxSpacerRow: {
    height: cartOverlayBottomFeeTaxSpacerHeight,
  },

  cartOverlayBottomProductName: {
    ...tightText,
    flex: 1,
    minWidth: 0,
    fontFamily: Platform.select({
      ios: bodyDemiBoldFont,
      default: bodyLightFont,
    }),
    fontSize: scaleCartOverlayReceiptText(13),
    lineHeight: scaleCartOverlayReceiptText(16),
    fontWeight: "900",
    color: "#111111",
    textAlign: "left",
    flexShrink: 1,
  },

  cartOverlayBottomFeeTaxRow: {
    position: "relative",
  },

  cartOverlayBottomFeeTaxLabel: {
    flex: 0,
    width: "50%",
    maxWidth: "50%",
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
    fontSize: scaleCartOverlayReceiptText(13),
    lineHeight: scaleCartOverlayReceiptText(16),
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
    fontSize: scaleCartOverlayReceiptText(13),
    lineHeight: scaleCartOverlayReceiptText(16),
    fontWeight: "900",
    color: "#111111",
    textAlign: "right",
    flexShrink: 0,
  },

  cartOverlayBottomFeeTaxTotal: {
    position: "absolute",
    top: 0,
    right: "50%",
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
    fontSize: scaleProductOverlayText(28),
    lineHeight: scaleProductOverlayText(34),
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
    fontSize: scaleProductOverlayText(40),
    lineHeight: scaleProductOverlayText(48),
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
    position: "relative",
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
    justifyContent: "flex-end",
    flexShrink: 0,
  },

  cartOverlayControlsGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  cartOverlayControlsEvenGroup: {
    width: "100%",
    justifyContent: "space-evenly",
  },

  cartOverlayProductGridCell: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    zIndex: 2,
    elevation: 2,
  },

  cartOverlayProductNamePriceCell: {
    justifyContent: "space-between",
  },

  cartOverlayProductDivider: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: appHairlineWidth * 2,
    backgroundColor: "#111111",
    zIndex: 1,
    elevation: 1,
  },

  cartOverlayProductTopDivider: {
    height: appHairlineWidth * 2,
    backgroundColor: "#111111",
    zIndex: 1,
    elevation: 1,
  },

  cartOverlayProductVerticalDivider: {
    position: "absolute",
    width: cartOverlayProductVerticalDividerWidth,
    backgroundColor: appHairlineColor,
    opacity: cartOverlayFilledDividerOpacity,
    zIndex: 1,
    elevation: 1,
  },

  cartOverlayProductInGridDivider: {
    opacity: cartOverlayFilledDividerOpacity / 2,
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
    fontSize: scaleCartOverlayAddedProductText(15.84),
    lineHeight: scaleCartOverlayAddedProductText(19.8),
  },

  cartOverlayRemoveButton: {
    marginTop: 0,
    marginLeft: 0,
    borderRadius: 999,
    backgroundColor: "#B91F18",
    flexShrink: 0,
  },

  cartOverlayRemoveButtonText: {
    fontSize: scaleCartOverlayAddedProductText(32),
    lineHeight: scaleCartOverlayAddedProductText(32),
    transform: [{ translateY: -1 }, { scaleX: 1.25 }],
  },

  cartOverlayProductImage: {
    width: scaleCartOverlayAddedProduct(90.767061),
    height: scaleCartOverlayAddedProduct(90.767061),
    borderRadius: scaleCartOverlayAddedProduct(45.3835305),
  },

  cartOverlayProductImageDimmed: {
    opacity: 0.42,
  },

  cartOverlayProductName: {
    ...tightText,
    width: "100%",
    fontFamily: bodyFont,
    fontSize: scaleCartOverlayAddedProductText(15),
    lineHeight: scaleCartOverlayAddedProductText(15),
    fontWeight: "400",
    color: "#111111",
    textAlign: "center",
  },

  cartOverlayProductNameOverlay: {
    position: "absolute",
    zIndex: 2,
    elevation: 2,
  },

  cartOverlayProductPrice: {
    fontSize: scaleCartOverlayAddedProductText(13),
    lineHeight: scaleCartOverlayAddedProductText(13),
  },

  cartOverlayProductGuestsText: {
    fontSize: scaleCartOverlayAddedProductText(11),
    lineHeight: scaleCartOverlayAddedProductText(13),
  },

  cartOverlayProductNameControlsOverlay: {
    fontSize: scaleCartOverlayAddedProductText(11),
    lineHeight: scaleCartOverlayAddedProductText(11),
  },

  cartOverlayProductServingCount: {
    fontSize: scaleCartOverlayAddedProductText(13),
    lineHeight: scaleCartOverlayAddedProductText(13),
  },

  cartOverlayProductTotal: {
    ...tightText,
    fontFamily: bodyDemiBoldFont,
    fontSize: scaleCartOverlayAddedProductText(15),
    lineHeight: scaleCartOverlayAddedProductText(18),
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
    alignItems: "center",
  },

  piccolaOverlayHeading: {
    ...tightText,
    width: "100%",
    fontFamily: bodyLightFont,
    fontSize: scaleProductsOverlayText(36),
    lineHeight: scaleProductsOverlayText(43.5),
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
    justifyContent: "space-evenly",
  },

  piccolaOverlayChevronTouchBand: {
    width: "100%",
    alignItems: "center",
    paddingTop: scaleProductOverlay(16),
  },

  piccolaOverlayImageStack: {
    width: "100%",
    alignItems: "center",
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
    height: scaleProductOverlayImage(201.70458),
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  piccolaOverlayImageMask: {
    width: scaleProductOverlayImage(201.70458),
    height: scaleProductOverlayImage(201.70458),
    borderRadius: scaleProductOverlayImage(100.85229),
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
    width: scaleProductOverlayImage(201.70458),
    height: scaleProductOverlayImage(201.70458),
    borderRadius: scaleProductOverlayImage(100.85229),
    marginBottom: 0,
  },

  piccolaOverlayAnimatedImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: scaleProductOverlayImage(201.70458),
    height: scaleProductOverlayImage(201.70458),
    borderRadius: scaleProductOverlayImage(100.85229),
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
    fontSize: scaleProductsOverlayText(14.7),
    lineHeight: scaleProductsOverlayText(19.425),
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
    fontSize: scaleProductsOverlayText(12.5),
    lineHeight: scaleProductsOverlayText(12.5),
    fontWeight: "900",
    letterSpacing: scaleProductOverlay(0.5832),
    color: "#B91F18",
    textAlign: "center",
    opacity: 0.9,
  },

  piccolaOverlayPopularTagGreen: {
    color: "#247C3A",
  },

  piccolaOverlayPopularTagBlue: {
    color: "#1E5EFF",
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
    fontSize: scaleProductsOverlayText(19.9),
    lineHeight: scaleProductsOverlayText(27),
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
  },

  piccolaOverlayBuyButtonFrame: {
    position: "absolute",
    bottom: scaleProductOverlay(3),
    left: scaleProductOverlay(10.86),
    width: overlayProductActionButtonSize,
    height: overlayProductActionButtonSize,
    borderRadius: overlayProductActionButtonRadius,
    overflow: "visible",
  },

  piccolaOverlayBuyButtonShadowPlate: {
    ...tappableButtonShadowPlate,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: overlayProductActionButtonRadius,
  },

  piccolaOverlayBuyButtonShadowPlateTapped: {
    backgroundColor: "rgba(17, 17, 17, 0.035)",
  },

  piccolaOverlayBuyButton: {
    width: "100%",
    height: "100%",
    borderRadius: overlayProductActionButtonRadius,
    ...thickBlackBorderWithShadow,
    backgroundColor: "#247C3A",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: "hidden",
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
    fontSize: overlayProductActionButtonTextFontSize,
    lineHeight: overlayProductActionButtonTextLineHeight,
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
    fontSize: scaleProductsOverlayText(15.84),
    lineHeight: scaleProductsOverlayText(19.8),
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
    zIndex: 1,
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
