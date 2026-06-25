import {
  Animated,
  BackHandler,
  Easing,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, {
  Defs,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import ButtonShadowPlate from "../components/ButtonShadowPlate";
import {
  formatCartCurrency,
  formatCartPriceTotal,
  overlayNavProducts,
  piccolaProduct,
  shopProducts as products,
} from "../data/shopOverlayProducts";
import shopStyles from "../styles/shopStyles";
import { logoFont } from "../styles/typography";
import { arrowHintPeakOpacity } from "../utils/headerSwipeContext";
import {
  getHeaderTopBarHeight,
  getTopSafeInset,
} from "../utils/platformLayout";
import { useShopCart } from "../utils/shopCartContext";

const initialOverlayNavIndex = overlayNavProducts.findIndex(
  (product) => product.name === piccolaProduct.name
);
const shippingPreviewChromeStops = [
  { offset: "0%", color: "#111111" },
  { offset: "14%", color: "#26170e" },
  { offset: "31%", color: "#5b3218" },
  { offset: "52%", color: "#99582a" },
  { offset: "73%", color: "#d08a3d" },
  { offset: "100%", color: "#f7b967" },
];

function renderOverlayDescription(description) {
  const match = description.match(/^(Serving\s+\d+)(.*)$/);

  if (!match) {
    return description;
  }

  return (
    <>
      <Text style={shopStyles.piccolaOverlayDescriptionLead}>{match[1]}</Text>
      {match[2]}
    </>
  );
}
const shippingPreviewChromeCorners = [
  {
    key: "topLeft",
    cx: "100%",
    cy: "100%",
    style: shopStyles.shippingPreviewItemButtonChromeTopLeft,
  },
  {
    key: "topRight",
    cx: "0%",
    cy: "100%",
    style: shopStyles.shippingPreviewItemButtonChromeTopRight,
  },
  {
    key: "bottomLeft",
    cx: "100%",
    cy: "0%",
    style: shopStyles.shippingPreviewItemButtonChromeBottomLeft,
  },
  {
    key: "bottomRight",
    cx: "0%",
    cy: "0%",
    style: shopStyles.shippingPreviewItemButtonChromeBottomRight,
  },
];

const shippingPreviewImages = [
  {
    key: "truck",
    image: require("../truck1_square_whitefill.png"),
    label: "12 hour\nshipping",
    style: shopStyles.shippingPreviewIconTruck,
  },
  {
    key: "bargain",
    image: require("../bargain_square_whitefill.png"),
    label: "$10\ndelivery",
    style: shopStyles.shippingPreviewIconBargain,
  },
  {
    key: "soflo",
    image: require("../soflo_square.png"),
    label: "M. Dade\nBroward",
    style: shopStyles.shippingPreviewIconSoflo,
  },
];

const deliveryOverlayRows = [
  [
    { key: "firstName", label: "First name:" },
    { key: "lastName", label: "Last name:" },
  ],
  [
    { key: "address", label: "Street:", flex: 3 },
    { key: "apartment", label: "Apartment/House #:", flex: 2 },
  ],
  [
    { key: "city", label: "City:" },
    { key: "state", label: "State:" },
  ],
];
const paymentOverlayMethods = [
  "Google Pay",
  "Apple Pay",
  "Debit/Credit Card",
];

const shopMainHorizontalPadding = 24;
const truckOverlayHorizontalMargin = shopMainHorizontalPadding * 0.5;
const truckOverlayBorderWidth = 2;
const truckOverlayInnerHorizontalPadding = truckOverlayHorizontalMargin;
const productOverlayIOSScale = Platform.OS === "ios" ? 0.82 : 1;
const scaleProductOverlay = (value) => value * productOverlayIOSScale;
const piccolaOverlayImageHalfSize = scaleProductOverlay(100.85229);
const piccolaOverlayActionWidth = scaleProductOverlay(77.22);
const piccolaOverlayQuantityTriangleWidth = scaleProductOverlay(43.70625);
const piccolaOverlayQuantityTriangleHeight = scaleProductOverlay(28.17);
const piccolaOverlayQuantityTriangleStrokeWidth = scaleProductOverlay(2);
const piccolaOverlayQuantityTopBoxHeight = scaleProductOverlay(29.1375);
const cartOverlayFilledIOSScale = Platform.OS === "ios" ? 0.72 : 1;
const scaleCartOverlayFilled = (value) => value * cartOverlayFilledIOSScale;
const cartOverlayAddedProductAssetScale = 1.5;
const scaleCartOverlayAddedProduct = (value) =>
  scaleCartOverlayFilled(value * cartOverlayAddedProductAssetScale);
const cartOverlayCounterImageFitScale = 0.86;
const cartOverlayControlSizeScale = 0.9;
const cartOverlayQuantityProductShapeTotalHeight = 18.78 * 2 + 41.625;
const cartOverlayQuantityProductShapeWidthRatio =
  29.1375 / cartOverlayQuantityProductShapeTotalHeight;
const cartOverlayQuantityProductShapeTriangleHeightRatio =
  18.78 / cartOverlayQuantityProductShapeTotalHeight;
const cartOverlayQuantityProductShapeBoxHeightRatio =
  41.625 / cartOverlayQuantityProductShapeTotalHeight;
const cartOverlayQuantityProductShapeFontSizeRatio =
  15.84 / cartOverlayQuantityProductShapeTotalHeight;
const cartOverlayQuantityProductShapeLineHeightRatio =
  19.8 / cartOverlayQuantityProductShapeTotalHeight;
const cartOverlayProductBlockBaseWidth =
  scaleCartOverlayAddedProduct(100.85229);
const cartOverlayProductImageBaseSize =
  scaleCartOverlayAddedProduct(90.767061);
const cartOverlayQuantityStackBaseHeight =
  scaleCartOverlayAddedProduct(25.353 * 2 + 37.4625);
const cartOverlayQuantityBaseWidth =
  cartOverlayQuantityStackBaseHeight *
  cartOverlayQuantityProductShapeWidthRatio;
const cartOverlayQuantityTriangleBaseHeight =
  cartOverlayQuantityStackBaseHeight *
  cartOverlayQuantityProductShapeTriangleHeightRatio;
const cartOverlayQuantityBoxBaseHeight =
  cartOverlayQuantityStackBaseHeight *
  cartOverlayQuantityProductShapeBoxHeightRatio;
const cartOverlayQuantityNumberBaseFontSize =
  cartOverlayQuantityStackBaseHeight *
  cartOverlayQuantityProductShapeFontSizeRatio;
const cartOverlayQuantityNumberBaseLineHeight =
  cartOverlayQuantityStackBaseHeight *
  cartOverlayQuantityProductShapeLineHeightRatio;
const cartOverlayRemoveButtonBaseSize =
  scaleCartOverlayAddedProduct(39.335625);
const cartOverlayRemoveButtonTextBaseSize =
  scaleCartOverlayAddedProduct(32);
const cartOverlayDeliveryFee = 10;
const cartOverlayTaxRate = 0.06;
const piccolaOverlayPriceSlotTop = scaleProductOverlay(17.36);
const piccolaOverlayPopularTagBottom = scaleProductOverlay(18.36);
const piccolaOverlayPriceSlotBottomHeight = scaleProductOverlay(27);
const piccolaOverlayPriceSlotBottomInset = scaleProductOverlay(2.25);
const piccolaOverlayBuyButtonLeft = scaleProductOverlay(10.86);
const piccolaOverlayBuyButtonWidth = scaleProductOverlay(55.5);
const piccolaOverlayBuyButtonHeight = scaleProductOverlay(55.5);
const piccolaOverlayNavBarHeight = scaleProductOverlay(45.36);
const piccolaOverlayQuantityActionIconSize = scaleProductOverlay(17);
const piccolaOverlayActionStackGap = scaleProductOverlay(5.5);
const piccolaOverlayActionStackMinHeight =
  piccolaOverlayPopularTagBottom +
  piccolaOverlayActionStackGap * 2 +
  piccolaOverlayBuyButtonHeight +
  piccolaOverlayPriceSlotBottomHeight +
  piccolaOverlayPriceSlotBottomInset;
const overlayOrangeBandHeight = 28;
const cartOverlayCheckoutBoxScale = Platform.OS === "ios" ? 0.78 : 1;
const scaleCartOverlayCheckoutBox = (value) =>
  value * cartOverlayCheckoutBoxScale;
const cartOverlayCheckoutButtonHeight = scaleCartOverlayCheckoutBox(55.5);
const cartOverlayReceiptScale = Platform.OS === "ios" ? 0.78 : 1;
const scaleCartOverlayReceipt = (value) => value * cartOverlayReceiptScale;
const cartOverlayBottomBannerMinHeight = overlayOrangeBandHeight * 4.5;
const cartOverlayBottomSummaryLineHeight = scaleCartOverlayReceipt(16);
const cartOverlayBottomSummarySpacerHeight = scaleCartOverlayReceipt(8);
const cartOverlayBottomGrandTotalLineHeight = scaleCartOverlayReceipt(25);
const cartOverlayBottomControlsGap = 4;
const piccolaOverlayHeadingTopPadding = 16;
const shopMainPaddingTop = 26.8125;
const stickyCartEdgeOffset = 18;
const stickyCartButtonSize = 55.5;
const shippingPreviewIOSLayoutScale = Platform.OS === "ios" ? 0.77 : 1;
const scaleShippingPreview = (value) =>
  value * shippingPreviewIOSLayoutScale;
const shippingTitleOfferingsLineHeight = Platform.select({
  web: 40.00798828125,
  ios: 23.5,
  default: 36.673989598125,
});
const shippingPreviewRowTopGap = scaleShippingPreview(19.6875);
const shippingPreviewTruckHeight = scaleShippingPreview(121.01386125);
const shippingPreviewTruckBottomGap = scaleShippingPreview(16);
const shippingPreviewBargainHeight = scaleShippingPreview(141.4423825);
const shippingPreviewBargainBottomGap = scaleShippingPreview(16);
const shippingPreviewSofloHeight = scaleShippingPreview(139.60546875);
const shippingPreviewReadyButtonWidth = 154.0026;
const shippingPreviewReadyButtonHeight = 55.5;
const shippingPreviewReadyButtonCenterOffsetY = scaleShippingPreview(-8);
const shippingPreviewInitialMeasurements = {
  titleHeight: shippingTitleOfferingsLineHeight,
  rowY: shippingTitleOfferingsLineHeight + shippingPreviewRowTopGap,
  sofloY:
    shippingPreviewTruckHeight +
    shippingPreviewTruckBottomGap +
    shippingPreviewBargainHeight +
    shippingPreviewBargainBottomGap,
  sofloHeight: shippingPreviewSofloHeight,
  readyHeight: shippingPreviewReadyButtonHeight,
};
const shippingPreviewSofloVisualOffsetY = scaleShippingPreview(-3);

function PiccolaQuantityActionIcon({
  confirmed,
  size = piccolaOverlayQuantityActionIconSize,
}) {
  return (
    <Svg
      height={size}
      style={shopStyles.piccolaOverlayQuantityTopCheck}
      viewBox="0 0 24 24"
      width={size}
    >
      <Path
        d={confirmed ? "M20 6 9 17l-5-5" : "M12 5v14M5 12h14"}
        fill="none"
        stroke={confirmed ? "#FFFFFF" : "#247C3A"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3.2}
      />
    </Svg>
  );
}

function PiccolaQuantityTriangle({ direction, muted }) {
  const strokeInset = piccolaOverlayQuantityTriangleStrokeWidth / 2;
  const fillColor = muted ? "#FBDCB3" : "#f7b967";
  const strokeColor = muted ? "#888888" : "#111111";
  const path =
    direction === "up"
      ? [
          `M ${piccolaOverlayQuantityTriangleWidth / 2} ${strokeInset}`,
          `L ${
            piccolaOverlayQuantityTriangleWidth - strokeInset
          } ${piccolaOverlayQuantityTriangleHeight - strokeInset}`,
          `L ${strokeInset} ${
            piccolaOverlayQuantityTriangleHeight - strokeInset
          }`,
          "Z",
        ].join(" ")
      : [
          `M ${strokeInset} ${strokeInset}`,
          `L ${
            piccolaOverlayQuantityTriangleWidth - strokeInset
          } ${strokeInset}`,
          `L ${piccolaOverlayQuantityTriangleWidth / 2} ${
            piccolaOverlayQuantityTriangleHeight - strokeInset
          }`,
          "Z",
        ].join(" ");

  return (
    <Svg
      height="100%"
      style={shopStyles.piccolaOverlayQuantityTriangleSvg}
      viewBox={`0 0 ${piccolaOverlayQuantityTriangleWidth} ${piccolaOverlayQuantityTriangleHeight}`}
      width="100%"
    >
      <Path
        d={path}
        fill={fillColor}
        stroke={strokeColor}
        strokeLinejoin="round"
        strokeWidth={piccolaOverlayQuantityTriangleStrokeWidth}
      />
    </Svg>
  );
}

function ShippingPreviewChromeCorners() {
  return shippingPreviewChromeCorners.map((corner) => {
    const gradientId = `shipping-preview-chrome-${corner.key}`;

    return (
      <View
        key={corner.key}
        pointerEvents="none"
        style={[shopStyles.shippingPreviewItemButtonChromeCorner, corner.style]}
      >
        <Svg
          height="100%"
          preserveAspectRatio="none"
          style={shopStyles.shippingPreviewItemButtonChromeFill}
          viewBox="0 0 52 52"
          width="100%"
        >
          <Defs>
            <RadialGradient
              cx={corner.cx}
              cy={corner.cy}
              fx={corner.cx}
              fy={corner.cy}
              id={gradientId}
              r="108%"
            >
              {shippingPreviewChromeStops.map((stop) => (
                <Stop
                  key={stop.offset}
                  offset={stop.offset}
                  stopColor={stop.color}
                />
              ))}
            </RadialGradient>
          </Defs>
          <Rect
            fill={`url(#${gradientId})`}
            height="52"
            width="52"
            x="0"
            y="0"
          />
        </Svg>
      </View>
    );
  });
}

export default function ShopScreen() {
  const { openCart } = useLocalSearchParams();
  const initialOpenCartRequest = Array.isArray(openCart)
    ? openCart[0]
    : openCart;
  const shouldOpenCartInitially = Boolean(initialOpenCartRequest);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const { bottom: bottomInset } = safeAreaInsets;
  const topSafeInset = getTopSafeInset(safeAreaInsets);
  const resolvedShopHeaderHeight = getHeaderTopBarHeight(safeAreaInsets);
  const headerY = useRef(new Animated.Value(0)).current;
  const [isTruckOverlayVisible, setIsTruckOverlayVisible] = useState(
    shouldOpenCartInitially
  );
  const [isCartOverlayVisible, setIsCartOverlayVisible] = useState(
    shouldOpenCartInitially
  );
  const [isDeliveryOverlayVisible, setIsDeliveryOverlayVisible] =
    useState(false);
  const [isPaymentOverlayVisible, setIsPaymentOverlayVisible] =
    useState(false);
  const [activeOverlayProductName, setActiveOverlayProductName] = useState(
    piccolaProduct.name
  );
  const [
    piccolaOverlayDescriptionHeight,
    setPiccolaOverlayDescriptionHeight,
  ] = useState(0);
  const [shippingPreviewMeasurements, setShippingPreviewMeasurements] =
    useState(shippingPreviewInitialMeasurements);
  const {
    cartOverlayActionRequest,
    consumeCartOverlayActionRequest,
    discardUnconfirmedOverlayProductDraft,
    overlayCartAccruedTotal,
    overlayCartBillableProducts,
    overlayCartProducts,
    overlayProductConfirmations,
    overlayProductQuantities,
    pruneZeroQuantityCartEntries,
    setIsShopOverlayVisible,
    updateOverlayProductConfirmation,
    updateOverlayProductQuantity,
  } = useShopCart();
  const [overlayImageOutgoingProductName, setOverlayImageOutgoingProductName] =
    useState(null);
  const [overlayImageDirection, setOverlayImageDirection] = useState(-1);
  const [overlayImageStageWidth, setOverlayImageStageWidth] = useState(0);
  const [overlayNavBarWidth, setOverlayNavBarWidth] = useState(0);
  const overlayImageProgress = useRef(new Animated.Value(1)).current;
  const overlayImageAnimationRef = useRef(null);
  const overlayNavIndicatorProgress = useRef(
    new Animated.Value(initialOverlayNavIndex)
  ).current;
  const overlayNavIndicatorAnimationRef = useRef(null);
  const overlayHeldArrowOpacity = useRef(new Animated.Value(0)).current;
  const overlayDirectionalLeftArrowOpacity = useRef(
    new Animated.Value(0)
  ).current;
  const overlayDirectionalRightArrowOpacity = useRef(
    new Animated.Value(0)
  ).current;
  const overlayDirectionalArrowBaseSuppression = useRef(
    new Animated.Value(0)
  ).current;
  const overlayDirectionalArrowResetTimeoutRef = useRef(null);
  const handledOpenCartParamRef = useRef(initialOpenCartRequest || null);
  const overlaySwipeStartXRef = useRef(null);
  const overlaySwipeStartYRef = useRef(null);
  const overlaySwipeCommittedRef = useRef(false);
  const activeOverlayProduct =
    products.find((product) => product.name === activeOverlayProductName) ||
    piccolaProduct;
  const overlayImageOutgoingProduct =
    products.find((product) => product.name === overlayImageOutgoingProductName) ||
    null;
  const activeOverlayProductPrice =
    activeOverlayProduct.overlayPrice || activeOverlayProduct.price;
  const activeOverlayProductBadgeText =
    activeOverlayProduct.name === "Buon Natale"
      ? "ON SALE"
      : activeOverlayProduct.name === "Sei Perfetto"
      ? ""
      : "POPULAR";
  const activeOverlayProductKey = activeOverlayProduct.name;
  const activeOverlayQuantity =
    overlayProductQuantities[activeOverlayProductKey] || 0;
  const isActiveOverlayCheckConfirmed = Boolean(
    overlayProductConfirmations[activeOverlayProductKey]
  );
  const showOverlayAddedState =
    activeOverlayQuantity > 0 && isActiveOverlayCheckConfirmed;
  const showOverlayQuantityControls = true;
  const showOverlayQuantityMuted = activeOverlayQuantity === 0;
  const showOverlayQuantityCheckConfirmed =
    activeOverlayQuantity > 0 && isActiveOverlayCheckConfirmed;
  const showOverlayQuantitySecondaryMuted =
    showOverlayQuantityMuted || showOverlayQuantityCheckConfirmed;

  const updateActiveOverlayQuantity = (updater) => {
    updateOverlayProductQuantity(activeOverlayProductKey, updater);
  };

  const updateActiveOverlayConfirmation = (updater) => {
    updateOverlayProductConfirmation(activeOverlayProductKey, updater);
  };

  const isCartAddItemsActionVisible =
    isTruckOverlayVisible && isCartOverlayVisible;
  const isDeliveryPaymentActionVisible =
    isTruckOverlayVisible && isDeliveryOverlayVisible;
  const isPaymentViewCartActionVisible =
    isTruckOverlayVisible && isPaymentOverlayVisible;
  const shippingPreviewActionButtonLabel = isCartAddItemsActionVisible
    ? "Add items"
    : isDeliveryPaymentActionVisible
    ? "Payment"
    : isPaymentViewCartActionVisible
    ? "View cart"
    : isTruckOverlayVisible
    ? "Benefits"
    : "Shop";
  const shippingPreviewActionAccessibilityLabel = isCartAddItemsActionVisible
    ? "Add items"
    : isDeliveryPaymentActionVisible
    ? "Payment"
    : isPaymentViewCartActionVisible
    ? "View cart"
    : isTruckOverlayVisible
    ? "Benefits"
    : "Open Piccola overlay";
  const overlayNavBarResolvedWidth =
    overlayNavBarWidth ||
    Math.max(0, windowWidth - truckOverlayHorizontalMargin * 2);
  const overlayNavItemWidth =
    overlayNavBarResolvedWidth / overlayNavProducts.length;
  const overlayNavIndicatorTranslateX = Animated.multiply(
    overlayNavIndicatorProgress,
    overlayNavItemWidth
  );

  const clearOverlayDirectionalArrowLinger = () => {
    overlayDirectionalLeftArrowOpacity.stopAnimation();
    overlayDirectionalRightArrowOpacity.stopAnimation();
    overlayDirectionalArrowBaseSuppression.stopAnimation();
    overlayDirectionalLeftArrowOpacity.setValue(0);
    overlayDirectionalRightArrowOpacity.setValue(0);
    overlayDirectionalArrowBaseSuppression.setValue(0);
  };

  const startOverlayDirectionalArrowLinger = (direction) => {
    overlayHeldArrowOpacity.stopAnimation();
    overlayHeldArrowOpacity.setValue(0);
    overlayDirectionalLeftArrowOpacity.stopAnimation();
    overlayDirectionalRightArrowOpacity.stopAnimation();
    overlayDirectionalArrowBaseSuppression.stopAnimation();
    overlayDirectionalArrowBaseSuppression.setValue(1);
    overlayDirectionalLeftArrowOpacity.setValue(
      direction === "left" ? arrowHintPeakOpacity : 0
    );
    overlayDirectionalRightArrowOpacity.setValue(
      direction === "right" ? arrowHintPeakOpacity : 0
    );
  };

  const showOverlayHeldArrows = () => {
    overlayHeldArrowOpacity.stopAnimation();
    overlayHeldArrowOpacity.setValue(arrowHintPeakOpacity);
  };

  const hideOverlayHeldArrows = () => {
    overlayHeldArrowOpacity.stopAnimation();
    overlayHeldArrowOpacity.setValue(0);
  };

  const overlayVisibleArrowOpacity = overlayHeldArrowOpacity.interpolate({
    inputRange: [0, arrowHintPeakOpacity],
    outputRange: [0, arrowHintPeakOpacity],
    extrapolate: "clamp",
  });
  const overlayDirectionalBaseArrowOpacity = Animated.multiply(
    overlayVisibleArrowOpacity,
    overlayDirectionalArrowBaseSuppression.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
      extrapolate: "clamp",
    })
  );
  const overlayLeftArrowOpacity = Animated.add(
    overlayDirectionalBaseArrowOpacity,
    overlayDirectionalLeftArrowOpacity
  ).interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const overlayRightArrowOpacity = Animated.add(
    overlayDirectionalBaseArrowOpacity,
    overlayDirectionalRightArrowOpacity
  ).interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const overlayImageTravelDistance = Math.max(
    overlayImageStageWidth / 2 + piccolaOverlayImageHalfSize,
    150
  );
  const overlayIncomingStartOffset =
    overlayImageDirection < 0
      ? overlayImageTravelDistance
      : -overlayImageTravelDistance;
  const overlayOutgoingEndOffset = -overlayIncomingStartOffset;
  const overlayIncomingImageTranslateX = overlayImageProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [overlayIncomingStartOffset, 0],
    extrapolate: "clamp",
  });
  const overlayOutgoingImageTranslateX = overlayImageProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, overlayOutgoingEndOffset],
    extrapolate: "clamp",
  });
  const overlayIncomingImageOpacity = overlayImageProgress.interpolate({
    inputRange: [0, 0.52, 0.82, 1],
    outputRange: [0, 0.08, 0.68, 1],
    extrapolate: "clamp",
  });
  const overlayOutgoingImageOpacity = overlayImageProgress.interpolate({
    inputRange: [0, 0.18, 0.36, 1],
    outputRange: [1, 0.22, 0, 0],
    extrapolate: "clamp",
  });

  const getOverlayProductTransitionDirection = (fromName, toName) => {
    const fromIndex = overlayNavProducts.findIndex(
      (product) => product.name === fromName
    );
    const toIndex = overlayNavProducts.findIndex(
      (product) => product.name === toName
    );

    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      return -1;
    }

    const lastOverlayIndex = overlayNavProducts.length - 1;

    if (fromIndex === lastOverlayIndex && toIndex === 0) return -1;
    if (fromIndex === 0 && toIndex === lastOverlayIndex) return 1;

    return toIndex > fromIndex ? -1 : 1;
  };

  const transitionOverlayProductImage = (nextProductName, direction) => {
    if (!nextProductName || nextProductName === activeOverlayProductName) {
      return;
    }

    if (overlayImageAnimationRef.current) {
      const previousAnimation = overlayImageAnimationRef.current;
      overlayImageAnimationRef.current = null;
      previousAnimation.stop();
    }

    if (overlayNavIndicatorAnimationRef.current) {
      const previousNavAnimation = overlayNavIndicatorAnimationRef.current;
      overlayNavIndicatorAnimationRef.current = null;
      previousNavAnimation.stop();
    }

    const nextOverlayNavIndex = overlayNavProducts.findIndex(
      (product) => product.name === nextProductName
    );

    discardUnconfirmedOverlayProductDraft(activeOverlayProductName);
    setOverlayImageOutgoingProductName(activeOverlayProductName);
    setOverlayImageDirection(direction);
    overlayImageProgress.setValue(0);
    setActiveOverlayProductName(nextProductName);

    if (nextOverlayNavIndex >= 0) {
      const navAnimation = Animated.timing(overlayNavIndicatorProgress, {
        toValue: nextOverlayNavIndex,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });

      overlayNavIndicatorAnimationRef.current = navAnimation;
      navAnimation.start(() => {
        if (overlayNavIndicatorAnimationRef.current === navAnimation) {
          overlayNavIndicatorAnimationRef.current = null;
        }
      });
    }

    const animation = Animated.timing(overlayImageProgress, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    overlayImageAnimationRef.current = animation;

    animation.start(({ finished }) => {
      if (finished) {
        setOverlayImageOutgoingProductName(null);
      }

      if (overlayImageAnimationRef.current === animation) {
        overlayImageAnimationRef.current = null;
      }
    });
  };

  const handleOverlayProductNameSelect = (nextProductName) => {
    const direction = getOverlayProductTransitionDirection(
      activeOverlayProductName,
      nextProductName
    );

    transitionOverlayProductImage(nextProductName, direction);
  };

  const renderOverlayArrowChevron = (direction, muted = false) => (
    <View
      style={[
        shopStyles.overlayImageArrowChevron,
        muted && shopStyles.overlayImageArrowChevronMuted,
        direction === "left"
          ? shopStyles.overlayImageArrowChevronLeft
          : shopStyles.overlayImageArrowChevronRight,
      ]}
    />
  );

  const goToOverlayPreviousProduct = () => {
    const currentIndex = overlayNavProducts.findIndex(
      (product) => product.name === activeOverlayProductName
    );
    if (currentIndex < 0) return;

    const previousIndex =
      (currentIndex + overlayNavProducts.length - 1) %
      overlayNavProducts.length;
    startOverlayDirectionalArrowLinger("left");
    transitionOverlayProductImage(overlayNavProducts[previousIndex].name, 1);
  };

  const goToOverlayNextProduct = () => {
    const currentIndex = overlayNavProducts.findIndex(
      (product) => product.name === activeOverlayProductName
    );
    if (currentIndex < 0) return;

    const nextIndex = (currentIndex + 1) % overlayNavProducts.length;
    startOverlayDirectionalArrowLinger("right");
    transitionOverlayProductImage(overlayNavProducts[nextIndex].name, -1);
  };

  const getOverlayBandTouchPoint = (event) => {
    const primaryTouch =
      event?.nativeEvent?.touches?.[0] ||
      event?.nativeEvent?.changedTouches?.[0] ||
      event?.nativeEvent;

    return {
      x:
        typeof primaryTouch?.pageX === "number"
          ? primaryTouch.pageX
          : primaryTouch?.locationX,
      y:
        typeof primaryTouch?.pageY === "number"
          ? primaryTouch.pageY
          : primaryTouch?.locationY,
    };
  };

  const handleOverlayBandTouchStart = (event) => {
    const { x, y } = getOverlayBandTouchPoint(event);

    overlaySwipeStartXRef.current = x;
    overlaySwipeStartYRef.current = y;
    overlaySwipeCommittedRef.current = false;
    showOverlayHeldArrows();
  };

  const handleOverlayBandTouchMove = (event) => {
    if (overlaySwipeCommittedRef.current) return;

    const startX = overlaySwipeStartXRef.current;
    const startY = overlaySwipeStartYRef.current;
    const { x: currentX, y: currentY } = getOverlayBandTouchPoint(event);

    if (
      typeof startX !== "number" ||
      typeof startY !== "number" ||
      typeof currentX !== "number" ||
      typeof currentY !== "number"
    ) {
      return;
    }

    const dx = currentX - startX;
    const dy = Math.abs(currentY - startY);
    const minimumHorizontalSwipeDistance = 12.5;
    const horizontalDominanceRatio = 0.4375;
    const isHorizontalSwipeIntent =
      Math.abs(dx) >= minimumHorizontalSwipeDistance &&
      Math.abs(dx) > dy * horizontalDominanceRatio;

    if (!isHorizontalSwipeIntent) return;

    overlaySwipeCommittedRef.current = true;

    if (dx < 0) {
      goToOverlayNextProduct();
    } else {
      goToOverlayPreviousProduct();
    }
  };

  const handleOverlayBandTouchEnd = () => {
    overlaySwipeStartXRef.current = null;
    overlaySwipeStartYRef.current = null;
    overlaySwipeCommittedRef.current = false;
    hideOverlayHeldArrows();
  };

  useEffect(() => {
    if (overlayDirectionalArrowResetTimeoutRef.current) {
      clearTimeout(overlayDirectionalArrowResetTimeoutRef.current);
    }

    overlayDirectionalArrowResetTimeoutRef.current = setTimeout(() => {
      clearOverlayDirectionalArrowLinger();
      overlayDirectionalArrowResetTimeoutRef.current = null;
    }, 130);

    return () => {
      if (overlayDirectionalArrowResetTimeoutRef.current) {
        clearTimeout(overlayDirectionalArrowResetTimeoutRef.current);
      }
    };
  }, [activeOverlayProductName]);

  useEffect(() => {
    return () => {
      if (overlayImageAnimationRef.current) {
        overlayImageAnimationRef.current.stop();
      }

      if (overlayNavIndicatorAnimationRef.current) {
        overlayNavIndicatorAnimationRef.current.stop();
      }
    };
  }, []);
  const shippingPreviewSofloBottomY =
    shippingPreviewMeasurements.rowY +
    shippingPreviewMeasurements.sofloY +
    shippingPreviewMeasurements.sofloHeight +
    shippingPreviewSofloVisualOffsetY;
  const shippingPreviewAvailableBottomY =
    windowHeight - bottomInset - resolvedShopHeaderHeight - shopMainPaddingTop;
  const shippingPreviewReadyButtonAvailableGap =
    shippingPreviewAvailableBottomY -
    shippingPreviewSofloBottomY -
    shippingPreviewMeasurements.readyHeight;
  const shippingPreviewStackBottomY =
    shippingPreviewMeasurements.rowY +
    shippingPreviewMeasurements.sofloY +
    shippingPreviewMeasurements.sofloHeight;
  const shippingPreviewStickyCartAlignedMarginTop = Math.max(
    0,
    windowHeight -
      bottomInset -
      stickyCartEdgeOffset -
      shippingPreviewMeasurements.readyHeight -
      resolvedShopHeaderHeight -
      shopMainPaddingTop -
      shippingPreviewStackBottomY
  );
  const shippingPreviewReadyButtonStickyCartAlignedLeft = Math.max(
    0,
    windowWidth -
      shopMainHorizontalPadding -
      stickyCartEdgeOffset * 2 -
      stickyCartButtonSize -
      shippingPreviewReadyButtonWidth
  );
  const shippingPreviewReadyButtonCenteredMarginTop =
    Platform.OS === "ios"
      ? shippingPreviewStickyCartAlignedMarginTop
      : Math.max(
          0,
          shippingPreviewReadyButtonAvailableGap -
            (shippingPreviewReadyButtonAvailableGap / 2 -
              shippingPreviewReadyButtonCenterOffsetY) *
              0.75
        );
  const shippingPreviewReadyButtonTopY =
    typeof shippingPreviewMeasurements.readyY === "number"
      ? shippingPreviewMeasurements.readyY
      : shippingPreviewMeasurements.rowY +
        shippingPreviewMeasurements.sofloY +
        shippingPreviewMeasurements.sofloHeight +
        shippingPreviewReadyButtonCenteredMarginTop;
  const shippingPreviewActionButtonScreenTop =
    resolvedShopHeaderHeight +
    shopMainPaddingTop +
    shippingPreviewReadyButtonTopY;
  const shopHeaderOffsetStyle = topSafeInset
    ? {
        top: resolvedShopHeaderHeight,
      }
    : null;
  const shippingPreviewGoBackButtonLeft =
    (windowWidth - shippingPreviewReadyButtonWidth) / 2;
  const truckOverlayVerticalGap = 24;
  const truckOverlayPreviousTop =
    shopMainPaddingTop +
    shippingPreviewMeasurements.titleHeight +
    truckOverlayVerticalGap;
  const truckOverlayReadyButtonTopY =
    shopMainPaddingTop + shippingPreviewReadyButtonTopY;
  const truckOverlayTop = truckOverlayVerticalGap;
  const truckOverlayBottom =
    truckOverlayReadyButtonTopY - truckOverlayVerticalGap;
  const truckOverlayHeight = Math.max(
    120,
    truckOverlayBottom - truckOverlayTop
  );
  const truckOverlayPreviousHeight = Math.max(
    120,
    truckOverlayBottom - truckOverlayPreviousTop
  );
  const truckOverlayRawContentOffsetTop = Math.max(
    0,
    truckOverlayPreviousTop - truckOverlayTop
  );
  const truckOverlayNavContentGap = Math.max(
    0,
    truckOverlayVerticalGap +
      truckOverlayRawContentOffsetTop -
      piccolaOverlayNavBarHeight
  );
  const truckOverlayContentOffsetTop = Math.max(
    0,
    truckOverlayRawContentOffsetTop - truckOverlayNavContentGap / 2
  );
  const truckOverlayContentHeight = Math.max(
    0,
    truckOverlayPreviousHeight - truckOverlayVerticalGap * 2
  );
  const piccolaOverlayInnerWidth =
    windowWidth -
    truckOverlayHorizontalMargin * 2 -
    truckOverlayBorderWidth * 2 -
    truckOverlayInnerHorizontalPadding * 2;
  const piccolaOverlayAvailableParagraphWidth = Math.max(
    0,
    piccolaOverlayInnerWidth -
      piccolaOverlayActionWidth -
      truckOverlayInnerHorizontalPadding
  );
  const piccolaOverlayParagraphWidth = Math.min(
    piccolaOverlayAvailableParagraphWidth,
    windowWidth * 0.5
  );
  const piccolaOverlayActionColumnHeight = Math.max(
    piccolaOverlayDescriptionHeight || 0,
    piccolaOverlayActionStackMinHeight
  );
  const piccolaOverlaySwappedBuyButtonTop =
    piccolaOverlayActionColumnHeight > 0
      ? Math.max(
          piccolaOverlayPopularTagBottom,
          piccolaOverlayPopularTagBottom +
            (piccolaOverlayActionColumnHeight -
              piccolaOverlayPriceSlotBottomHeight -
              piccolaOverlayPriceSlotBottomInset -
              piccolaOverlayPopularTagBottom -
              piccolaOverlayBuyButtonHeight) /
              2
        )
      : piccolaOverlayPriceSlotTop;
  const piccolaOverlayPopularToAddGap = Math.max(
    0,
    piccolaOverlaySwappedBuyButtonTop - piccolaOverlayPopularTagBottom
  );
  const piccolaOverlayQuantityTopBoxTop =
    -piccolaOverlayQuantityTriangleHeight -
    piccolaOverlayPopularToAddGap -
    piccolaOverlayQuantityTopBoxHeight;
  const cartOverlayProductTop =
    overlayOrangeBandHeight + piccolaOverlayHeadingTopPadding;
  const cartOverlayCreamHorizontalInset = truckOverlayInnerHorizontalPadding;
  const cartOverlayCreamVerticalInset = cartOverlayCreamHorizontalInset;
  const cartOverlayControlPairGap = scaleCartOverlayFilled(20);
  const cartOverlayRowAvailableWidth = Math.max(
    0,
    piccolaOverlayInnerWidth - cartOverlayCreamHorizontalInset * 2
  );
  const cartOverlayLaneWidth = cartOverlayRowAvailableWidth / 2;
  const cartOverlayProductAssetFitScale =
    cartOverlayProductBlockBaseWidth > 0
      ? cartOverlayLaneWidth / cartOverlayProductBlockBaseWidth
      : 1;
  const cartOverlayControlsAssetFitScale =
    cartOverlayQuantityBaseWidth + cartOverlayRemoveButtonBaseSize > 0
      ? Math.max(0, cartOverlayLaneWidth - cartOverlayControlPairGap) /
        (cartOverlayQuantityBaseWidth *
          cartOverlayCounterImageFitScale *
          cartOverlayControlSizeScale +
          cartOverlayRemoveButtonBaseSize * cartOverlayControlSizeScale)
      : 1;
  const cartOverlayAssetScale = Math.min(
    1,
    Math.max(
      0,
      Math.min(cartOverlayProductAssetFitScale, cartOverlayControlsAssetFitScale)
    )
  );
  const cartOverlayCounterScale =
    cartOverlayAssetScale *
    cartOverlayCounterImageFitScale *
    cartOverlayControlSizeScale;
  const cartOverlayProductBlockWidth =
    cartOverlayProductBlockBaseWidth * cartOverlayAssetScale;
  const cartOverlayProductImageSize =
    cartOverlayProductImageBaseSize * cartOverlayAssetScale;
  const cartOverlayQuantityWidth =
    cartOverlayQuantityBaseWidth * cartOverlayCounterScale;
  const cartOverlayQuantityTriangleHeight =
    cartOverlayQuantityTriangleBaseHeight * cartOverlayCounterScale;
  const cartOverlayQuantityBoxHeight =
    cartOverlayQuantityBoxBaseHeight * cartOverlayCounterScale;
  const cartOverlayQuantityNumberFontSize =
    cartOverlayQuantityNumberBaseFontSize * cartOverlayCounterScale;
  const cartOverlayQuantityNumberLineHeight =
    cartOverlayQuantityNumberBaseLineHeight * cartOverlayCounterScale;
  const cartOverlayRemoveButtonWidth =
    cartOverlayRemoveButtonBaseSize *
    cartOverlayAssetScale *
    cartOverlayControlSizeScale;
  const cartOverlayRemoveButtonHeight =
    cartOverlayRemoveButtonWidth;
  const cartOverlayRemoveButtonTextSize =
    cartOverlayRemoveButtonTextBaseSize *
    cartOverlayAssetScale *
    cartOverlayControlSizeScale;
  const cartOverlayBottomSummaryRows =
    overlayCartBillableProducts.length +
    (overlayCartBillableProducts.length > 0 ? 2 : 0);
  const cartOverlayBottomSummarySpacers =
    overlayCartBillableProducts.length > 0 ? 2 : 0;
  const cartOverlayBottomSummaryContentHeight =
    cartOverlayBottomSummaryRows * cartOverlayBottomSummaryLineHeight +
    cartOverlayBottomSummarySpacers * cartOverlayBottomSummarySpacerHeight +
    truckOverlayInnerHorizontalPadding * 2;
  const cartOverlayBottomControlsHeight =
    truckOverlayInnerHorizontalPadding +
    cartOverlayCheckoutButtonHeight +
    cartOverlayBottomControlsGap +
    cartOverlayBottomGrandTotalLineHeight * 2 +
    truckOverlayInnerHorizontalPadding;
  const cartOverlayBottomBannerHeight = Math.max(
    cartOverlayBottomBannerMinHeight,
    cartOverlayBottomSummaryContentHeight,
    cartOverlayBottomControlsHeight
  );
  const cartOverlayDeliveryTotal =
    overlayCartBillableProducts.length > 0 ? cartOverlayDeliveryFee : 0;
  const cartOverlayTaxableTotal =
    overlayCartAccruedTotal + cartOverlayDeliveryTotal;
  const cartOverlayTaxes =
    Math.round(cartOverlayTaxableTotal * cartOverlayTaxRate * 100) / 100;
  const cartOverlayGrandTotal =
    cartOverlayTaxableTotal + cartOverlayTaxes;
  const updateShippingPreviewMeasurement = (key, value) => {
    setShippingPreviewMeasurements((current) => {
      if (
        typeof current[key] === "number" &&
        Math.abs(current[key] - value) < 0.5
      ) {
        return current;
      }

      return { ...current, [key]: value };
    });
  };
  const updatePiccolaOverlayDescriptionHeight = (height) => {
    setPiccolaOverlayDescriptionHeight((current) => {
      if (Math.abs(current - height) < 0.5) return current;

      return height;
    });
  };

  const openTruckOverlay = () => {
    if (overlayNavIndicatorAnimationRef.current) {
      overlayNavIndicatorAnimationRef.current.stop();
      overlayNavIndicatorAnimationRef.current = null;
    }

    overlayNavIndicatorProgress.setValue(initialOverlayNavIndex);
    setActiveOverlayProductName(piccolaProduct.name);
    setIsCartOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsShopOverlayVisible(true);
    setIsTruckOverlayVisible(true);
  };
  const closeTruckOverlay = () => {
    if (isCartOverlayVisible) {
      pruneZeroQuantityCartEntries();
    }

    discardUnconfirmedOverlayProductDraft(activeOverlayProductName);
    setIsCartOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsShopOverlayVisible(false);
    setIsTruckOverlayVisible(false);
  };
  const toggleTruckOverlay = () => {
    if (isTruckOverlayVisible) {
      if (isCartOverlayVisible) {
        pruneZeroQuantityCartEntries();
        setIsCartOverlayVisible(false);
        return;
      }

      closeTruckOverlay();
      return;
    }

    openTruckOverlay();
  };
  const showProductOverlayFromCart = () => {
    pruneZeroQuantityCartEntries();
    setIsCartOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
  };
  const showDeliveryOverlayFromCart = () => {
    if (Platform.OS !== "android") {
      return;
    }

    pruneZeroQuantityCartEntries();
    setIsCartOverlayVisible(false);
    setIsDeliveryOverlayVisible(true);
    setIsPaymentOverlayVisible(false);
  };
  const showPaymentOverlayFromDelivery = () => {
    if (Platform.OS !== "android") {
      return;
    }

    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(true);
  };
  const showCartOverlayFromPayment = () => {
    if (Platform.OS !== "android") {
      return;
    }

    setIsPaymentOverlayVisible(false);
    setIsCartOverlayVisible(true);
  };
  const handleShippingPreviewActionPress = () => {
    if (isCartAddItemsActionVisible) {
      showProductOverlayFromCart();
      return;
    }

    if (isDeliveryPaymentActionVisible) {
      showPaymentOverlayFromDelivery();
      return;
    }

    if (isPaymentViewCartActionVisible) {
      showCartOverlayFromPayment();
      return;
    }

    toggleTruckOverlay();
  };

  useEffect(() => {
    setIsShopOverlayVisible(isTruckOverlayVisible);

    return () => {
      setIsShopOverlayVisible(false);
    };
  }, [isTruckOverlayVisible, setIsShopOverlayVisible]);

  useEffect(() => {
    if (!cartOverlayActionRequest.pending) return;

    discardUnconfirmedOverlayProductDraft(activeOverlayProductName);
    setIsShopOverlayVisible(true);
    setIsTruckOverlayVisible(true);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsCartOverlayVisible(true);
    consumeCartOverlayActionRequest(cartOverlayActionRequest.id);
  }, [
    activeOverlayProductName,
    cartOverlayActionRequest,
    consumeCartOverlayActionRequest,
    discardUnconfirmedOverlayProductDraft,
    setIsShopOverlayVisible,
  ]);

  useEffect(() => {
    const openCartRequest = Array.isArray(openCart) ? openCart[0] : openCart;

    if (
      !openCartRequest ||
      handledOpenCartParamRef.current === openCartRequest
    ) {
      return;
    }

    handledOpenCartParamRef.current = openCartRequest;
    discardUnconfirmedOverlayProductDraft(activeOverlayProductName);
    setIsShopOverlayVisible(true);
    setIsTruckOverlayVisible(true);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsCartOverlayVisible(true);
  }, [
    activeOverlayProductName,
    discardUnconfirmedOverlayProductDraft,
    openCart,
    setIsShopOverlayVisible,
  ]);

  useEffect(() => {
    if (Platform.OS !== "android" || !isTruckOverlayVisible) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        closeTruckOverlay();
        return true;
      }
    );

    return () => subscription.remove();
  }, [
    activeOverlayProductName,
    isTruckOverlayVisible,
    overlayProductConfirmations,
  ]);

  const renderShippingPreviewActionButton = ({
    frameStyle,
    hidden = false,
    onLayout,
  } = {}) => (
    <View
      onLayout={onLayout}
      pointerEvents={hidden ? "none" : "auto"}
      style={[
        shopStyles.shippingPreviewReadyButtonShadowFrame,
        isTruckOverlayVisible &&
          !isCartAddItemsActionVisible &&
          shopStyles.shippingPreviewReadyButtonShadowFrameBack,
        isCartAddItemsActionVisible &&
          shopStyles.shippingPreviewAddItemsButtonShadowFrame,
        hidden && shopStyles.shippingPreviewReadyButtonHidden,
        frameStyle,
      ]}
    >
      <ButtonShadowPlate
        style={shopStyles.shippingPreviewReadyButtonShadowPlate}
      />
      <Pressable
        accessibilityLabel={shippingPreviewActionAccessibilityLabel}
        accessibilityRole="button"
        onPress={handleShippingPreviewActionPress}
        style={[
          shopStyles.shippingPill,
          shopStyles.shippingPillOverlay,
          shopStyles.shippingPreviewReadyButton,
          isTruckOverlayVisible &&
            !isCartAddItemsActionVisible &&
            shopStyles.shippingPreviewBackButton,
          isCartAddItemsActionVisible && shopStyles.shippingPreviewAddItemsButton,
        ]}
      >
        <View style={shopStyles.shippingPreviewActionButtonContent}>
          {isTruckOverlayVisible ? (
            <View
              style={[
                shopStyles.shippingPreviewActionTriangleSlot,
                !isCartAddItemsActionVisible &&
                  shopStyles.shippingPreviewActionTriangleSlotBack,
              ]}
            >
              <View
                style={
                  isCartAddItemsActionVisible
                    ? shopStyles.shippingPreviewAddItemsButtonTriangle
                    : shopStyles.shippingPreviewReadyButtonTriangleBack
                }
              />
            </View>
          ) : null}
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={[
              shopStyles.shippingPillText,
              shopStyles.shippingPillTextOverlay,
              shopStyles.shippingPreviewReadyButtonText,
              shopStyles.shippingPreviewReadyButtonTextPrimary,
              isTruckOverlayVisible && shopStyles.shippingPreviewBackButtonText,
            ]}
          >
            {shippingPreviewActionButtonLabel}
          </Text>
          {!isTruckOverlayVisible ? (
            <View style={shopStyles.shippingPreviewActionTriangleSlot}>
              <View style={shopStyles.shippingPreviewReadyButtonTriangle} />
            </View>
          ) : null}
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={shopStyles.screen}>
      <View
        pointerEvents="none"
        style={[shopStyles.shopBackgroundHero, shopHeaderOffsetStyle]}
      >
        <Image
          source={require("../background1.png")}
          style={shopStyles.shopBackgroundImage}
          resizeMode="cover"
        />
      </View>
      <View style={shopStyles.headerOverlay}>
        <AppHeader
          dimHeaderExceptShopButton={isTruckOverlayVisible}
          scrollY={headerY}
          showCarousel={false}
          showHero={false}
        />
      </View>

      <View style={shopStyles.content}>
        <View style={shopStyles.main}>
          <View style={shopStyles.shippingTitle}>
            <Text
              onLayout={({ nativeEvent: { layout } }) =>
                updateShippingPreviewMeasurement("titleHeight", layout.height)
              }
              style={[
                shopStyles.shippingTitleLine,
                shopStyles.shippingTitleBodyLine,
                shopStyles.shippingTitleAlwaysLine,
                {
                  width: windowWidth,
                  marginLeft: -shopMainHorizontalPadding,
                  paddingHorizontal: 0,
                  fontFamily: logoFont,
                  fontWeight: "500",
                  textAlign: "center",
                  textShadowColor: "#111111",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 0.3,
                },
              ]}
            >
              Deliciousness awaits...
            </Text>
            <View
              onLayout={({ nativeEvent: { layout } }) =>
                updateShippingPreviewMeasurement("rowY", layout.y)
              }
              style={shopStyles.shippingPreviewRow}
            >
              {shippingPreviewImages.map((preview) => {
                const previewStyle =
                  preview.style ||
                  (preview.large
                    ? shopStyles.shippingPreviewIconLarge
                    : shopStyles.shippingPreviewIcon);
                const previewRowStyle = [
                  shopStyles.shippingPreviewItemRow,
                  preview.key === "truck" &&
                    shopStyles.shippingPreviewItemRowTruck,
                  preview.key === "bargain" &&
                    shopStyles.shippingPreviewItemRowBargain,
                ];
                const previewButton = (
                  <View style={shopStyles.shippingPreviewItemButtonOuter}>
                    <View
                      style={[
                        shopStyles.shippingPill,
                        shopStyles.shippingPillOverlay,
                        shopStyles.shippingPreviewItemButton,
                      ]}
                    >
                      <ShippingPreviewChromeCorners />
                      <View style={shopStyles.shippingPreviewItemButtonInner}>
                        <Text
                          allowFontScaling={false}
                          numberOfLines={2}
                          style={[
                            shopStyles.shippingPillText,
                            shopStyles.shippingPillTextOverlay,
                            shopStyles.shippingPreviewReadyButtonText,
                            shopStyles.shippingPreviewItemButtonText,
                          ]}
                        >
                          {preview.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
                const previewImage =
                  preview.key === "truck" ? (
                    <View
                      style={[
                        shopStyles.shippingPreviewImageSlot,
                        preview.key === "bargain" && {
                          transform: [{ translateX: -1 }],
                        },
                        preview.key === "soflo" && {
                          transform: [{ translateX: 1 }],
                        },
                      ]}
                    >
                      <View style={previewStyle}>
                        <Image
                          source={preview.image}
                          style={shopStyles.shippingPreviewIconFill}
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={shopStyles.shippingPreviewImageSlot}>
                      <Image
                        source={preview.image}
                        style={previewStyle}
                        resizeMode="contain"
                      />
                    </View>
                  );

                if (preview.key === "truck") {
                  return (
                    <View key={preview.key} style={previewRowStyle}>
                      {previewImage}
                      <View style={shopStyles.shippingPreviewButtonSlot}>
                        {previewButton}
                      </View>
                    </View>
                  );
                }

                return (
                  <View
                    key={preview.key}
                    onLayout={
                      preview.key === "soflo"
                        ? ({ nativeEvent: { layout } }) => {
                            updateShippingPreviewMeasurement(
                              "sofloY",
                              layout.y
                            );
                            updateShippingPreviewMeasurement(
                              "sofloHeight",
                              layout.height
                            );
                          }
                        : undefined
                    }
                    style={previewRowStyle}
                  >
                    {previewImage}
                    <View style={shopStyles.shippingPreviewButtonSlot}>
                      {previewButton}
                    </View>
                  </View>
                );
              })}
            </View>
            {renderShippingPreviewActionButton({
              frameStyle: {
                marginTop: shippingPreviewReadyButtonCenteredMarginTop,
                ...(Platform.OS === "ios"
                  ? {
                      alignSelf: "flex-start",
                      marginLeft: shippingPreviewReadyButtonStickyCartAlignedLeft,
                    }
                  : null),
              },
              hidden: isTruckOverlayVisible,
              onLayout: ({ nativeEvent: { layout } }) => {
                updateShippingPreviewMeasurement("readyY", layout.y);
                updateShippingPreviewMeasurement("readyHeight", layout.height);
              },
            })}
          </View>
        </View>
      </View>

      {isTruckOverlayVisible ? (
        <View
          pointerEvents="none"
          style={[shopStyles.shopScreenDimLayer, shopHeaderOffsetStyle]}
        />
      ) : null}

      {isTruckOverlayVisible ? (
        <View style={[shopStyles.truckOverlayTouchFrame, shopHeaderOffsetStyle]}>
          <Pressable
            accessibilityLabel="Close truck overlay"
            accessibilityRole="button"
            onPress={closeTruckOverlay}
            style={shopStyles.truckOverlayDismissLayer}
          />
          <View
            pointerEvents="box-none"
            style={[
              shopStyles.truckOverlayFrame,
              {
                top: truckOverlayTop,
                left: truckOverlayHorizontalMargin,
                right: truckOverlayHorizontalMargin,
                height: truckOverlayHeight,
              },
            ]}
          >
            <View
              style={[
                shopStyles.truckOverlayWindowShadowFrame,
                shopStyles.truckOverlayWindowFull,
              ]}
            >
              <View
                onStartShouldSetResponder={() =>
                  !isCartOverlayVisible &&
                  !isDeliveryOverlayVisible &&
                  !isPaymentOverlayVisible
                }
                style={[
                  shopStyles.truckOverlayWindow,
                  shopStyles.truckOverlayWindowFull,
                  {
                    paddingHorizontal: truckOverlayInnerHorizontalPadding,
                    paddingVertical: truckOverlayVerticalGap,
                    justifyContent: "flex-start",
                  },
                ]}
              >
                <View
                  pointerEvents="none"
                  style={[
                    shopStyles.piccolaOverlayTopFill,
                    (isCartOverlayVisible ||
                      isDeliveryOverlayVisible ||
                      isPaymentOverlayVisible) &&
                      shopStyles.cartOverlayTopFill,
                  ]}
                />
                <View
                  pointerEvents="none"
                  style={shopStyles.piccolaOverlayBottomFill}
                />
                {isCartOverlayVisible ? (
                  <View
                    style={[
                      shopStyles.cartOverlayBottomBanner,
                      {
                        height: cartOverlayBottomBannerHeight,
                      },
                    ]}
                  >
                    <View style={shopStyles.cartOverlayBottomProductRows}>
                      {overlayCartBillableProducts.map((product) => {
                        const productQuantity =
                          overlayProductQuantities[product.name] || 0;
                        const productPrice =
                          product.overlayPrice || product.price;

                        return (
                          <View
                            key={product.name}
                            style={shopStyles.cartOverlayBottomSummaryRow}
                          >
                            <Text
                              allowFontScaling={false}
                              numberOfLines={1}
                              style={shopStyles.cartOverlayBottomProductName}
                            >
                              {product.name}
                            </Text>
                            <Text
                              allowFontScaling={false}
                              numberOfLines={1}
                              style={shopStyles.cartOverlayBottomQuantity}
                            >
                              x {productQuantity}
                            </Text>
                            <Text
                              allowFontScaling={false}
                              numberOfLines={1}
                              style={shopStyles.cartOverlayBottomTotal}
                            >
                              ={" "}
                              {formatCartPriceTotal(
                                productPrice,
                                productQuantity
                              )}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                    <View style={shopStyles.cartOverlayBottomSummaryColumn}>
                      {overlayCartBillableProducts.length > 0 ? (
                        <>
                          <View
                            pointerEvents="none"
                            style={shopStyles.cartOverlayBottomSummarySpacerRow}
                          />
                          <View style={shopStyles.cartOverlayBottomSummaryRow}>
                            <Text
                              allowFontScaling={false}
                              numberOfLines={1}
                              style={shopStyles.cartOverlayBottomProductName}
                            >
                              Delivery fee
                            </Text>
                            <Text
                              allowFontScaling={false}
                              numberOfLines={1}
                              style={shopStyles.cartOverlayBottomQuantity}
                            />
                            <Text
                              allowFontScaling={false}
                              numberOfLines={1}
                              style={shopStyles.cartOverlayBottomTotal}
                            >
                              = {formatCartCurrency(cartOverlayDeliveryFee)}
                            </Text>
                          </View>
                          <View
                            pointerEvents="none"
                            style={shopStyles.cartOverlayBottomSummarySpacerRow}
                          />
                          <View style={shopStyles.cartOverlayBottomSummaryRow}>
                            <Text
                              allowFontScaling={false}
                              numberOfLines={1}
                              style={shopStyles.cartOverlayBottomProductName}
                            >
                              Taxes
                            </Text>
                            <Text
                              allowFontScaling={false}
                              numberOfLines={1}
                              style={shopStyles.cartOverlayBottomQuantity}
                            />
                            <Text
                              allowFontScaling={false}
                              numberOfLines={1}
                              style={shopStyles.cartOverlayBottomTotal}
                            >
                              = {formatCartCurrency(cartOverlayTaxes)}
                            </Text>
                          </View>
                        </>
                      ) : null}
                    </View>
                    <View style={shopStyles.cartOverlayBottomGrandTotal}>
                      <Text style={shopStyles.cartOverlayBottomGrandTotalLabel}>
                        TOTAL
                      </Text>
                      <Text
                        adjustsFontSizeToFit
                        numberOfLines={1}
                        style={shopStyles.cartOverlayBottomGrandTotalAmount}
                      >
                        {formatCartCurrency(cartOverlayGrandTotal)}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityLabel="Checkout"
                      accessibilityRole="button"
                      onPress={showDeliveryOverlayFromCart}
                      style={shopStyles.cartOverlayCheckoutButton}
                    >
                      <Text style={shopStyles.cartOverlayCheckoutButtonText}>
                        Checkout
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
                {isCartOverlayVisible ? (
                  <>
                    <ScrollView
                      automaticallyAdjustContentInsets={false}
                      automaticallyAdjustKeyboardInsets={false}
                      contentContainerStyle={shopStyles.cartOverlayContentList}
                      contentInsetAdjustmentBehavior="never"
                      keyboardShouldPersistTaps="handled"
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                      style={[
                        shopStyles.cartOverlayContent,
                        {
                          top: cartOverlayProductTop,
                          right: truckOverlayInnerHorizontalPadding,
                          bottom:
                            overlayOrangeBandHeight +
                            cartOverlayBottomBannerHeight,
                          left: truckOverlayInnerHorizontalPadding,
                        },
                      ]}
                    >
                      {overlayCartProducts.length === 0 ? (
                        <View style={shopStyles.cartOverlayEmptyMessageFrame}>
                          <Text
                            allowFontScaling={false}
                            style={shopStyles.cartOverlayEmptyMessage}
                          >
                            Your
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={shopStyles.cartOverlayEmptyBrand}
                          >
                            Alla Vostra
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={shopStyles.cartOverlayEmptyMessage}
                          >
                            shopping cart
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={shopStyles.cartOverlayEmptyMessage}
                          >
                            is empty
                          </Text>
                        </View>
                      ) : null}
                      {overlayCartProducts.length > 0
                        ? overlayCartProducts.map((product, index) => {
                      const productQuantity =
                        overlayProductQuantities[product.name] || 0;
                      const productPrice =
                        product.overlayPrice || product.price;

                      return (
                        <View
                          key={product.name}
                          style={shopStyles.cartOverlayProductColumnGroup}
                        >
                          {index > 0 ? (
                            <View
                              style={shopStyles.cartOverlayProductDivider}
                            />
                          ) : null}
                          <View
                            style={[
                              shopStyles.cartOverlayProductEntry,
                              {
                                paddingHorizontal:
                                  cartOverlayCreamHorizontalInset,
                                paddingVertical: cartOverlayCreamVerticalInset,
                              },
                            ]}
                          >
                              <View
                                style={[
                                  shopStyles.cartOverlayProductLane,
                                  {
                                    width: cartOverlayLaneWidth,
                                  },
                                ]}
                              >
                                <View
                                  style={[
                                    shopStyles.cartOverlayProductBlock,
                                    {
                                      width: cartOverlayProductBlockWidth,
                                    },
                                  ]}
                                >
                                  <Text
                                    allowFontScaling={false}
                                    numberOfLines={1}
                                    style={[
                                      shopStyles.cartOverlayProductName,
                                      { width: cartOverlayLaneWidth },
                                    ]}
                                  >
                                    {`${product.name} (${productPrice})`}
                                  </Text>
                                  <Image
                                    source={product.image}
                                    style={[
                                      shopStyles.cartOverlayProductImage,
                                      {
                                        width: cartOverlayProductImageSize,
                                        height: cartOverlayProductImageSize,
                                        borderRadius:
                                          cartOverlayProductImageSize / 2,
                                      },
                                    ]}
                                    resizeMode="contain"
                                  />
                                </View>
                              </View>
                              <View
                                style={[
                                  shopStyles.cartOverlayControlsLane,
                                  {
                                    width: cartOverlayLaneWidth,
                                  },
                                ]}
                              >
                                <View
                                  style={shopStyles.cartOverlayControlsGroup}
                                >
                                  <View
                                    style={[
                                      shopStyles.cartOverlayQuantityColumn,
                                      {
                                        width: cartOverlayQuantityWidth,
                                      },
                                    ]}
                                  >
                                    <Pressable
                                      accessibilityLabel={`Add one ${product.name}`}
                                      accessibilityRole="button"
                                      hitSlop={8}
                                      onPress={() => {
                                        updateOverlayProductQuantity(
                                          product.name,
                                          (current) =>
                                            Math.min(9, current + 1)
                                        );
                                      }}
                                      style={[
                                        shopStyles.cartOverlayQuantityTriangleButton,
                                        {
                                          width: cartOverlayQuantityWidth,
                                          height:
                                            cartOverlayQuantityTriangleHeight,
                                        },
                                      ]}
                                    >
                                      <PiccolaQuantityTriangle
                                        direction="up"
                                        muted={productQuantity === 0}
                                      />
                                    </Pressable>
                                    <View
                                      style={[
                                        shopStyles.piccolaOverlayBuyButton,
                                        shopStyles.piccolaOverlayBuyButtonAdded,
                                        shopStyles.piccolaOverlayQuantityBox,
                                        shopStyles.cartOverlayQuantityBox,
                                        {
                                          width: cartOverlayQuantityWidth,
                                          height: cartOverlayQuantityBoxHeight,
                                        },
                                      ]}
                                    >
                                      <Text
                                        allowFontScaling={false}
                                        style={[
                                          shopStyles.piccolaOverlayBuyButtonText,
                                          productQuantity === 0
                                            ? shopStyles.piccolaOverlayQuantityZeroText
                                            : shopStyles.piccolaOverlayBuyButtonTextAdded,
                                          shopStyles.piccolaOverlayQuantityNumber,
                                          shopStyles.cartOverlayQuantityNumber,
                                          {
                                            fontSize:
                                              cartOverlayQuantityNumberFontSize,
                                            lineHeight:
                                              cartOverlayQuantityNumberLineHeight,
                                          },
                                        ]}
                                      >
                                        {productQuantity}
                                      </Text>
                                    </View>
                                    <Pressable
                                      accessibilityLabel={`Remove one ${product.name}`}
                                      accessibilityRole="button"
                                      hitSlop={8}
                                      onPress={() => {
                                        updateOverlayProductQuantity(
                                          product.name,
                                          (current) =>
                                            Math.max(0, current - 1)
                                        );
                                      }}
                                      style={[
                                        shopStyles.cartOverlayQuantityTriangleButton,
                                        {
                                          width: cartOverlayQuantityWidth,
                                          height:
                                            cartOverlayQuantityTriangleHeight,
                                        },
                                      ]}
                                    >
                                      <PiccolaQuantityTriangle
                                        direction="down"
                                        muted={productQuantity === 0}
                                      />
                                    </Pressable>
                                  </View>
                                  <Pressable
                                    accessibilityLabel={`Remove ${product.name} from cart`}
                                    accessibilityRole="button"
                                    hitSlop={8}
                                    onPress={() => {
                                      updateOverlayProductQuantity(
                                        product.name,
                                        () => 0
                                      );
                                      updateOverlayProductConfirmation(
                                        product.name,
                                        false
                                      );
                                    }}
                                    style={[
                                      shopStyles.piccolaOverlayBuyButton,
                                      shopStyles.cartOverlayRemoveButton,
                                      {
                                        width: cartOverlayRemoveButtonWidth,
                                        height: cartOverlayRemoveButtonHeight,
                                        marginLeft: cartOverlayControlPairGap,
                                      },
                                    ]}
                                  >
                                    <Text
                                      allowFontScaling={false}
                                      numberOfLines={1}
                                      style={[
                                        shopStyles.piccolaOverlayBuyButtonText,
                                        shopStyles.cartOverlayRemoveButtonText,
                                        {
                                          fontSize:
                                            cartOverlayRemoveButtonTextSize,
                                          lineHeight:
                                            cartOverlayRemoveButtonTextSize,
                                        },
                                      ]}
                                    >
                                      -
                                    </Text>
                                  </Pressable>
                                </View>
                              </View>
                            </View>
                        </View>
                      );
                    })
                        : null}
                    </ScrollView>
                  </>
                ) : isDeliveryOverlayVisible ? (
                  <View style={shopStyles.deliveryOverlayContent}>
                    <Text
                      allowFontScaling={false}
                      numberOfLines={1}
                      style={shopStyles.deliveryOverlayHeading}
                    >
                      Delivery Address:
                    </Text>
                    {deliveryOverlayRows.map((row, rowIndex) => (
                      <View
                        key={`delivery-row-${rowIndex}`}
                        style={shopStyles.deliveryOverlayRow}
                      >
                        {row.map((field) => (
                          <View
                            key={field.key}
                            style={[
                              shopStyles.deliveryOverlayField,
                              field.flex ? { flex: field.flex } : null,
                            ]}
                          >
                            <Text
                              allowFontScaling={false}
                              numberOfLines={1}
                              style={shopStyles.deliveryOverlayFieldLabel}
                            >
                              {field.label}
                            </Text>
                            <TextInput
                              allowFontScaling={false}
                              autoCorrect={false}
                              style={shopStyles.deliveryOverlayFieldInput}
                              underlineColorAndroid="transparent"
                            />
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                ) : isPaymentOverlayVisible ? (
                  <View style={shopStyles.paymentOverlayContent}>
                    <Text
                      allowFontScaling={false}
                      numberOfLines={1}
                      style={shopStyles.paymentOverlayHeading}
                    >
                      Payment
                    </Text>
                    <Text
                      allowFontScaling={false}
                      numberOfLines={1}
                      style={shopStyles.paymentOverlaySectionHeading}
                    >
                      Payment Method:
                    </Text>
                    <View style={shopStyles.paymentOverlayMethodList}>
                      {paymentOverlayMethods.map((method) => (
                        <Pressable
                          accessibilityLabel={method}
                          accessibilityRole="button"
                          key={method}
                          style={shopStyles.paymentOverlayMethodButton}
                        >
                          <Text
                            allowFontScaling={false}
                            numberOfLines={1}
                            style={shopStyles.paymentOverlayMethodButtonText}
                          >
                            {method}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : (
                  <>
                    <View
                      onLayout={({ nativeEvent: { layout } }) => {
                        if (
                          Math.abs(overlayNavBarWidth - layout.width) < 0.5
                        ) {
                          return;
                        }

                        setOverlayNavBarWidth(layout.width);
                      }}
                      style={shopStyles.piccolaOverlayNavBar}
                    >
                      <Animated.View
                        pointerEvents="none"
                        style={[
                          shopStyles.piccolaOverlayNavActiveIndicator,
                          {
                            transform: [
                              { translateX: overlayNavIndicatorTranslateX },
                            ],
                            width: overlayNavItemWidth,
                          },
                        ]}
                      >
                        <View
                          pointerEvents="none"
                          style={[
                            shopStyles.piccolaOverlayNavItemVerticalHairline,
                            shopStyles.piccolaOverlayNavItemLeftHairline,
                          ]}
                        />
                        <View
                          pointerEvents="none"
                          style={[
                            shopStyles.piccolaOverlayNavItemVerticalHairline,
                            shopStyles.piccolaOverlayNavItemRightHairline,
                          ]}
                        />
                      </Animated.View>
                      {overlayNavProducts.map((product) => {
                        const isActive =
                          product.name === activeOverlayProduct.name;

                        return (
                          <Pressable
                            accessibilityLabel={`Show ${product.name}`}
                            accessibilityRole="button"
                            key={product.name}
                            onPress={() =>
                              handleOverlayProductNameSelect(product.name)
                            }
                            style={[
                              shopStyles.piccolaOverlayNavItem,
                              !isActive &&
                                shopStyles.piccolaOverlayNavItemInverted,
                            ]}
                          >
                            <Text
                              allowFontScaling={false}
                              numberOfLines={1}
                              style={[
                                shopStyles.piccolaOverlayNavItemText,
                                isActive &&
                                  shopStyles.piccolaOverlayNavItemTextActive,
                              ]}
                            >
                              {product.name}
                            </Text>
                            <View
                              pointerEvents="none"
                              style={
                                shopStyles.piccolaOverlayNavItemBottomHairline
                              }
                            />
                          </Pressable>
                        );
                      })}
                    </View>
                    <View
                      style={[
                        shopStyles.piccolaOverlayContent,
                        {
                          height: truckOverlayContentHeight,
                          marginTop: truckOverlayContentOffsetTop,
                        },
                      ]}
                    >
                      <View style={shopStyles.piccolaOverlayBody}>
                        <View
                          onTouchStart={handleOverlayBandTouchStart}
                          onTouchMove={handleOverlayBandTouchMove}
                          onTouchEnd={handleOverlayBandTouchEnd}
                          onTouchCancel={handleOverlayBandTouchEnd}
                          style={shopStyles.piccolaOverlayChevronTouchBand}
                        >
                          <Text
                            allowFontScaling={false}
                            numberOfLines={1}
                            style={[
                              shopStyles.piccolaOverlayHeading,
                              shopStyles.piccolaOverlayHeadingTouchBand,
                            ]}
                          >
                            {activeOverlayProduct.name}
                          </Text>
                          <View style={shopStyles.piccolaOverlayImageRow}>
                            <Pressable
                              accessibilityLabel="Previous overlay product"
                              accessibilityRole="button"
                              onPress={goToOverlayPreviousProduct}
                              onPressIn={showOverlayHeldArrows}
                              onPressOut={hideOverlayHeldArrows}
                              style={shopStyles.overlayImageArrowTouchTarget}
                            >
                              <View style={shopStyles.overlayImageArrowBox}>
                                {renderOverlayArrowChevron("left", true)}
                                <Animated.View
                                  pointerEvents="none"
                                  style={[
                                    shopStyles.overlayImageArrowOverlay,
                                    { opacity: overlayLeftArrowOpacity },
                                  ]}
                                >
                                  {renderOverlayArrowChevron("left")}
                                </Animated.View>
                              </View>
                            </Pressable>
                            <View
                              onLayout={({ nativeEvent: { layout } }) => {
                                if (
                                  Math.abs(
                                    overlayImageStageWidth - layout.width
                                  ) < 0.5
                                ) {
                                  return;
                                }

                                setOverlayImageStageWidth(layout.width);
                              }}
                              style={shopStyles.piccolaOverlayImageStage}
                            >
                              <View style={shopStyles.piccolaOverlayImageMask}>
                                {overlayImageOutgoingProduct ? (
                                  <Animated.Image
                                    source={overlayImageOutgoingProduct.image}
                                    style={[
                                      shopStyles.piccolaOverlayAnimatedImage,
                                      {
                                        opacity: overlayOutgoingImageOpacity,
                                        transform: [
                                          {
                                            translateX:
                                              overlayOutgoingImageTranslateX,
                                          },
                                        ],
                                      },
                                    ]}
                                    resizeMode="contain"
                                  />
                                ) : null}
                                <Animated.Image
                                  source={activeOverlayProduct.image}
                                  style={[
                                    shopStyles.piccolaOverlayAnimatedImage,
                                    {
                                      opacity: overlayImageOutgoingProduct
                                        ? overlayIncomingImageOpacity
                                        : 1,
                                      transform: [
                                        {
                                          translateX: overlayImageOutgoingProduct
                                            ? overlayIncomingImageTranslateX
                                            : 0,
                                        },
                                      ],
                                    },
                                  ]}
                                  resizeMode="contain"
                                />
                              </View>
                            </View>
                            <Pressable
                              accessibilityLabel="Next overlay product"
                              accessibilityRole="button"
                              onPress={goToOverlayNextProduct}
                              onPressIn={showOverlayHeldArrows}
                              onPressOut={hideOverlayHeldArrows}
                              style={shopStyles.overlayImageArrowTouchTarget}
                            >
                              <View style={shopStyles.overlayImageArrowBox}>
                                {renderOverlayArrowChevron("right", true)}
                                <Animated.View
                                  pointerEvents="none"
                                  style={[
                                    shopStyles.overlayImageArrowOverlay,
                                    { opacity: overlayRightArrowOpacity },
                                  ]}
                                >
                                  {renderOverlayArrowChevron("right")}
                                </Animated.View>
                              </View>
                            </Pressable>
                          </View>
                        </View>
                        <View style={shopStyles.piccolaOverlayDescriptionRow}>
                          <View
                            style={[
                              shopStyles.piccolaOverlayDescriptionColumn,
                              { width: piccolaOverlayParagraphWidth },
                            ]}
                          >
                            <Text
                              allowFontScaling={false}
                              onLayout={({ nativeEvent: { layout } }) =>
                                updatePiccolaOverlayDescriptionHeight(
                                  layout.height
                                )
                              }
                              style={shopStyles.piccolaOverlayDescription}
                            >
                              {renderOverlayDescription(
                                activeOverlayProduct.description
                              )}
                            </Text>
                          </View>
                          <View
                            style={[
                              shopStyles.piccolaOverlayActionColumn,
                              {
                                height: piccolaOverlayActionColumnHeight,
                                marginLeft: truckOverlayInnerHorizontalPadding,
                              },
                            ]}
                          >
                            <Text
                              allowFontScaling={false}
                              numberOfLines={1}
                              style={[
                                shopStyles.piccolaOverlayPopularTag,
                                activeOverlayProductBadgeText === "POPULAR" &&
                                  shopStyles.piccolaOverlayPopularTagGreen,
                              ]}
                            >
                              {activeOverlayProductBadgeText}
                            </Text>
                            <View
                              style={shopStyles.piccolaOverlayPriceSlotBottom}
                            >
                              <Text
                                allowFontScaling={false}
                                numberOfLines={1}
                                style={shopStyles.piccolaOverlayPrice}
                              >
                                {activeOverlayProductPrice}
                              </Text>
                            </View>
                            <View
                              style={[
                                shopStyles.piccolaOverlayBuyButtonFrame,
                                {
                                  bottom: undefined,
                                  top: piccolaOverlaySwappedBuyButtonTop,
                                  left: piccolaOverlayBuyButtonLeft,
                                  width: piccolaOverlayBuyButtonWidth,
                                  height: piccolaOverlayBuyButtonHeight,
                                },
                              ]}
                            >
                              <ButtonShadowPlate
                                style={[
                                  shopStyles.piccolaOverlayBuyButtonShadowPlate,
                                  showOverlayAddedState &&
                                    shopStyles.piccolaOverlayBuyButtonShadowPlateTapped,
                                ]}
                              />
                              <Pressable
                                accessibilityRole="button"
                                onPress={() => {
                                  updateActiveOverlayQuantity((current) =>
                                    current > 0 ? current : 1
                                  );
                                  updateActiveOverlayConfirmation(true);
                                }}
                                style={[
                                  shopStyles.piccolaOverlayBuyButton,
                                  showOverlayAddedState &&
                                    shopStyles.piccolaOverlayBuyButtonTapped,
                                ]}
                              >
                                <Text
                                  allowFontScaling={false}
                                  numberOfLines={1}
                                  style={[
                                    shopStyles.piccolaOverlayBuyButtonText,
                                    showOverlayAddedState &&
                                      shopStyles.piccolaOverlayBuyButtonTextTapped,
                                  ]}
                                >
                                  ADD
                                </Text>
                              </Pressable>
                              {showOverlayQuantityControls ? (
                                <View
                                  style={
                                    shopStyles.piccolaOverlayQuantityFrame
                                  }
                                >
                                  {showOverlayQuantityCheckConfirmed ? (
                                    <Pressable
                                      accessibilityLabel={`Confirm ${activeOverlayProduct.name}`}
                                      accessibilityRole="button"
                                      hitSlop={8}
                                      onPress={() =>
                                        updateActiveOverlayConfirmation(
                                          (current) => !current
                                        )
                                      }
                                      style={[
                                        shopStyles.piccolaOverlayBuyButton,
                                        shopStyles.piccolaOverlayQuantityTopBoxFill,
                                        shopStyles.piccolaOverlayQuantityTopBox,
                                        {
                                          top: piccolaOverlayQuantityTopBoxTop,
                                        },
                                      ]}
                                    >
                                      <PiccolaQuantityActionIcon
                                        confirmed
                                      />
                                    </Pressable>
                                  ) : null}
                                  <ButtonShadowPlate
                                    style={[
                                      shopStyles.piccolaOverlayBuyButtonShadowPlate,
                                      shopStyles.piccolaOverlayQuantityShadowPlate,
                                      showOverlayQuantityMuted &&
                                        shopStyles.piccolaOverlayBuyButtonShadowPlateTapped,
                                    ]}
                                  />
                                  <Pressable
                                    accessibilityLabel={`Add one ${activeOverlayProduct.name}`}
                                    accessibilityRole="button"
                                    hitSlop={8}
                                    onPress={() => {
                                      updateActiveOverlayConfirmation(false);
                                      updateActiveOverlayQuantity((current) =>
                                        Math.min(9, current + 1)
                                      );
                                    }}
                                    style={[
                                      shopStyles.piccolaOverlayQuantityChevronOutside,
                                      shopStyles.piccolaOverlayQuantityChevronLeft,
                                    ]}
                                  >
                                    <PiccolaQuantityTriangle
                                      direction="up"
                                      muted={showOverlayQuantitySecondaryMuted}
                                    />
                                  </Pressable>
                                  <View
                                    style={[
                                      shopStyles.piccolaOverlayBuyButton,
                                      showOverlayQuantityMuted
                                        ? shopStyles.piccolaOverlayQuantityZeroBox
                                        : shopStyles.piccolaOverlayBuyButtonAdded,
                                      shopStyles.piccolaOverlayQuantityBox,
                                    ]}
                                  >
                                    <Text
                                      allowFontScaling={false}
                                      numberOfLines={1}
                                      style={[
                                        shopStyles.piccolaOverlayBuyButtonText,
                                        showOverlayQuantitySecondaryMuted
                                          ? shopStyles.piccolaOverlayQuantityZeroText
                                          : shopStyles.piccolaOverlayBuyButtonTextAdded,
                                        shopStyles.piccolaOverlayQuantityNumber,
                                      ]}
                                    >
                                      {activeOverlayQuantity}
                                    </Text>
                                  </View>
                                  <Pressable
                                    accessibilityLabel={`Remove one ${activeOverlayProduct.name}`}
                                    accessibilityRole="button"
                                    hitSlop={8}
                                    onPress={() => {
                                      updateActiveOverlayConfirmation(false);
                                      updateActiveOverlayQuantity((current) =>
                                        Math.max(0, current - 1)
                                      );
                                    }}
                                    style={[
                                      shopStyles.piccolaOverlayQuantityChevronOutside,
                                      shopStyles.piccolaOverlayQuantityChevronRight,
                                    ]}
                                  >
                                    <PiccolaQuantityTriangle
                                      direction="down"
                                      muted={showOverlayQuantitySecondaryMuted}
                                    />
                                  </Pressable>
                                </View>
                              ) : null}
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      ) : null}

      {isTruckOverlayVisible
        ? renderShippingPreviewActionButton({
            frameStyle: [
              shopStyles.shippingPreviewReadyButtonLiftFrame,
              {
                top: shippingPreviewActionButtonScreenTop,
                left: shippingPreviewGoBackButtonLeft,
              },
            ],
          })
        : null}

    </View>
  );
}
