import {
  Animated,
  BackHandler,
  Easing,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import ButtonShadowPlate from "../components/ButtonShadowPlate";
import shopStyles from "../styles/shopStyles";
import { arrowHintPeakOpacity } from "../utils/headerSwipeContext";

const products = [
  {
    name: "Piccola",
    price: "$55",
    image: require("../janny1brevised.png"),
    paymentUrl: "https://www.paypal.com/ncp/payment/UFKT9RHKL9YJY",
    description:
      "Serving 4, this mouth watering treat is a curation of the finest cheeses and charcuterie found anywhere around South Florida",
  },
  {
    name: "Sei Perfetto",
    price: "$66",
    image: require("../janny2drevised.png"),
    paymentUrl: "https://www.paypal.com/ncp/payment/UFKT9RHKL9YJY",
    description:
      "Serving 6, this delicacy effortlessly captures the joyous feeling of being surrounded by beloved family, trusted friends, and loyal clients",
  },
  {
    name: "Buon Natale",
    price: "$77",
    image: require("../janny3erevised.png"),
    paymentUrl: "https://www.paypal.com/ncp/payment/UFKT9RHKL9YJY",
    description:
      "Serving 8, this generous cheese board brings a full Alla Vostra spread to large gatherings, joyous celebrations, and festive holiday tables",
  },
];

function createInitialOverlayProductState(initialValue) {
  return products.reduce((state, product) => {
    state[product.name] = initialValue;
    return state;
  }, {});
}

function getCartPriceValue(price) {
  const numericPrice = Number(String(price).replace(/[^0-9.]/g, ""));

  return Number.isFinite(numericPrice) ? numericPrice : 0;
}

function formatCartCurrency(total) {
  return `$${total.toLocaleString("en-US")}`;
}

function formatCartPriceTotal(price, quantity) {
  return formatCartCurrency(getCartPriceValue(price) * quantity);
}

const piccolaProduct = products[0];
const overlayNavProducts = [products[1], products[0], products[2]];
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

const shopHeaderHeight = 120;
const shopMainHorizontalPadding = 24;
const truckOverlayHorizontalMargin = shopMainHorizontalPadding * 0.5;
const truckOverlayBorderWidth = 2;
const truckOverlayInnerHorizontalPadding = truckOverlayHorizontalMargin;
const piccolaOverlayActionWidth = 77.22;
const piccolaOverlayQuantityTriangleWidth = 43.70625;
const piccolaOverlayQuantityTriangleHeight = 28.17;
const piccolaOverlayQuantityTriangleStrokeWidth = 2;
const piccolaOverlayQuantityTopBoxHeight = 29.1375;
const piccolaOverlayPriceSlotTop = 17.36;
const piccolaOverlayPopularTagBottom = 18.36;
const piccolaOverlayPriceSlotBottomHeight = 27;
const piccolaOverlayBuyButtonLeft = 10.86;
const piccolaOverlayBuyButtonWidth = 55.5;
const piccolaOverlayBuyButtonHeight = 55.5;
const piccolaOverlayNavBarHeight = 45.36;
const overlayOrangeBandHeight = 28;
const cartOverlayBottomBannerHeight = overlayOrangeBandHeight * 3;
const piccolaOverlayHeadingTopPadding = 16;
const shopMainPaddingTop = 26.8125;
const shippingTitleOfferingsLineHeight = Platform.select({
  web: 40.00798828125,
  default: 36.673989598125,
});
const shippingPreviewRowTopGap = 19.6875;
const shippingPreviewTruckHeight = 121.01386125;
const shippingPreviewTruckBottomGap = 16;
const shippingPreviewBargainHeight = 141.4423825;
const shippingPreviewBargainBottomGap = 16;
const shippingPreviewSofloHeight = 139.60546875;
const shippingPreviewReadyButtonWidth = 170.64;
const shippingPreviewReadyButtonHeight = 55.5;
const shippingPreviewReadyButtonReadyTriangleWidth = 14.1075;
const shippingPreviewReadyButtonBackTriangleWidth = 15.675;
const shippingPreviewReadyButtonCenterOffsetY = -8;
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
const shippingPreviewSofloVisualOffsetY = -3;

function ShoppingCartIcon() {
  return (
    <Svg width={31.9} height={31.9} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.25 5.25H6.5L8.35 15.1H17.2L19.45 8.3H7.15"
        stroke="#FFFFFF"
        strokeWidth={2.15}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.15 18.35H17.35"
        stroke="#FFFFFF"
        strokeWidth={2.15}
        strokeLinecap="round"
      />
      <Circle cx={9.85} cy={20.1} r={1.05} fill="#FFFFFF" />
      <Circle cx={16.75} cy={20.1} r={1.05} fill="#FFFFFF" />
    </Svg>
  );
}

function PiccolaQuantityActionIcon({ confirmed, size = 17 }) {
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
        stroke={confirmed ? "#FFFFFF" : "#1f8f3a"}
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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const headerY = useRef(new Animated.Value(0)).current;
  const [isTruckOverlayVisible, setIsTruckOverlayVisible] = useState(false);
  const [isCartOverlayVisible, setIsCartOverlayVisible] = useState(false);
  const [activeOverlayProductName, setActiveOverlayProductName] = useState(
    piccolaProduct.name
  );
  const [
    piccolaOverlayDescriptionHeight,
    setPiccolaOverlayDescriptionHeight,
  ] = useState(0);
  const [shippingPreviewMeasurements, setShippingPreviewMeasurements] =
    useState(shippingPreviewInitialMeasurements);
  const [
    shippingPreviewActionTextWidths,
    setShippingPreviewActionTextWidths,
  ] = useState({});
  const [overlayProductQuantities, setOverlayProductQuantities] = useState(() =>
    createInitialOverlayProductState(0)
  );
  const [
    overlayProductConfirmations,
    setOverlayProductConfirmations,
  ] = useState(() => createInitialOverlayProductState(false));
  const [overlayCartProductNames, setOverlayCartProductNames] = useState([]);
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
  const showOverlayAddedState = activeOverlayQuantity > 0;
  const showOverlayQuantityControls = true;
  const showOverlayQuantityMuted = activeOverlayQuantity === 0;
  const showOverlayQuantityCheckBox = activeOverlayQuantity > 0;
  const showOverlayQuantityCheckConfirmed =
    showOverlayQuantityCheckBox && isActiveOverlayCheckConfirmed;
  const showOverlayQuantitySecondaryMuted =
    showOverlayQuantityMuted || showOverlayQuantityCheckConfirmed;
  const overlayCartProducts = overlayCartProductNames
    .map((productName) =>
      products.find((product) => product.name === productName)
    )
    .filter(
      (product) =>
        product && overlayProductConfirmations[product.name]
    );
  const overlayCartAccruedTotal = overlayCartProducts.reduce(
    (total, product) =>
      total +
      getCartPriceValue(product.overlayPrice || product.price) *
        (overlayProductQuantities[product.name] || 0),
    0
  );
  const overlayConfirmedProductCount = overlayCartProducts.length;
  const discardUnconfirmedOverlayProductDraft = (productName) => {
    if (overlayProductConfirmations[productName]) return;

    setOverlayProductQuantities((current) => {
      if ((current[productName] || 0) === 0) return current;

      return {
        ...current,
        [productName]: 0,
      };
    });
  };
  const updateOverlayProductQuantity = (productKey, updater) => {
    setOverlayProductQuantities((current) => {
      const currentQuantity = current[productKey] || 0;
      const nextQuantity = updater(currentQuantity);

      if (nextQuantity === currentQuantity) return current;

      return {
        ...current,
        [productKey]: nextQuantity,
      };
    });
  };

  const updateActiveOverlayQuantity = (updater) => {
    updateOverlayProductQuantity(activeOverlayProductKey, updater);
  };

  const updateOverlayProductConfirmation = (productKey, updater) => {
    const nextConfirmation =
      typeof updater === "function"
        ? updater(Boolean(overlayProductConfirmations[productKey]))
        : updater;

    setOverlayProductConfirmations((current) => {
      const currentConfirmation = Boolean(current[productKey]);

      if (nextConfirmation === currentConfirmation) return current;

      return {
        ...current,
        [productKey]: nextConfirmation,
      };
    });

    setOverlayCartProductNames((current) => {
      const isInCart = current.includes(productKey);

      if (nextConfirmation) {
        return isInCart ? current : [...current, productKey];
      }

      return isInCart
        ? current.filter((productName) => productName !== productKey)
        : current;
    });
  };

  const updateActiveOverlayConfirmation = (updater) => {
    updateOverlayProductConfirmation(activeOverlayProductKey, updater);
  };

  const pruneZeroQuantityCartEntries = () => {
    setOverlayCartProductNames((current) => {
      const next = current.filter(
        (productName) => (overlayProductQuantities[productName] || 0) > 0
      );

      return next.length === current.length ? current : next;
    });
  };

  const shippingPreviewActionButtonLabel = isTruckOverlayVisible
    ? "Go back"
    : "I'm ready!";
  const shippingPreviewActionButtonTextWidth =
    shippingPreviewActionTextWidths[shippingPreviewActionButtonLabel] || 0;
  const shippingPreviewActionTriangleWidth = isTruckOverlayVisible
    ? shippingPreviewReadyButtonBackTriangleWidth
    : shippingPreviewReadyButtonReadyTriangleWidth;
  const shippingPreviewActionTriangleOffset =
    shippingPreviewActionButtonTextWidth > 0
      ? Math.max(
          6,
          (shippingPreviewReadyButtonWidth -
            shippingPreviewActionButtonTextWidth) /
            4 -
            shippingPreviewActionTriangleWidth / 2
        )
      : 44.8;
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
    overlayImageStageWidth / 2 + 100.85229,
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
    setOverlayProductConfirmations((current) => {
      let next = current;

      products.forEach((product) => {
        if (
          (overlayProductQuantities[product.name] || 0) === 0 &&
          current[product.name] &&
          !overlayCartProductNames.includes(product.name)
        ) {
          if (next === current) {
            next = { ...current };
          }

          next[product.name] = false;
        }
      });

      return next;
    });
  }, [overlayCartProductNames, overlayProductQuantities]);

  useEffect(() => {
    setOverlayCartProductNames((current) => {
      const next = current.filter(
        (productName) => overlayProductConfirmations[productName]
      );

      return next.length === current.length ? current : next;
    });
  }, [overlayProductConfirmations, overlayProductQuantities]);

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
    windowHeight - bottomInset - shopHeaderHeight - shopMainPaddingTop;
  const shippingPreviewReadyButtonAvailableGap =
    shippingPreviewAvailableBottomY -
    shippingPreviewSofloBottomY -
    shippingPreviewMeasurements.readyHeight;
  const shippingPreviewReadyButtonCenteredMarginTop = Math.max(
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
    shopHeaderHeight + shopMainPaddingTop + shippingPreviewReadyButtonTopY;
  const shippingPreviewActionButtonBottomGap = Math.max(
    0,
    windowHeight -
      bottomInset -
      (shippingPreviewActionButtonScreenTop + shippingPreviewReadyButtonHeight)
  );
  const shippingPreviewGoBackButtonLeft =
    (windowWidth - shippingPreviewReadyButtonWidth) / 2;
  const shippingPreviewGoBackSideButtonGap =
    shippingPreviewActionButtonBottomGap * 1.1;
  const shippingPreviewGoBackSideButtonLeft =
    shippingPreviewGoBackButtonLeft +
    shippingPreviewReadyButtonWidth +
    shippingPreviewGoBackSideButtonGap;
  const shippingPreviewGoBackSideButtonWidth = Math.max(
    0,
    windowWidth -
      shippingPreviewGoBackSideButtonLeft -
      shippingPreviewGoBackSideButtonGap
  );
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
  const piccolaOverlaySwappedBuyButtonTop =
    piccolaOverlayDescriptionHeight > 0
      ? Math.max(
          piccolaOverlayPopularTagBottom,
          piccolaOverlayPopularTagBottom +
            (piccolaOverlayDescriptionHeight -
              piccolaOverlayPriceSlotBottomHeight -
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
  const updateShippingPreviewActionTextWidth = (label, width) => {
    setShippingPreviewActionTextWidths((current) => {
      if (
        typeof current[label] === "number" &&
        Math.abs(current[label] - width) < 0.5
      ) {
        return current;
      }

      return { ...current, [label]: width };
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
    setIsTruckOverlayVisible(true);
  };
  const closeTruckOverlay = () => {
    if (isCartOverlayVisible) {
      pruneZeroQuantityCartEntries();
    }

    discardUnconfirmedOverlayProductDraft(activeOverlayProductName);
    setIsCartOverlayVisible(false);
    setIsTruckOverlayVisible(false);
  };
  const toggleCartOverlay = () => {
    if (isCartOverlayVisible) {
      pruneZeroQuantityCartEntries();
      setIsCartOverlayVisible(false);
      return;
    }

    discardUnconfirmedOverlayProductDraft(activeOverlayProductName);
    setIsCartOverlayVisible(true);
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
          shopStyles.shippingPreviewReadyButtonShadowFrameBack,
        hidden && shopStyles.shippingPreviewReadyButtonHidden,
        frameStyle,
      ]}
    >
      <ButtonShadowPlate
        style={shopStyles.shippingPreviewReadyButtonShadowPlate}
      />
      <Pressable
        accessibilityLabel={
          isTruckOverlayVisible
            ? "Close Piccola overlay"
            : "Open Piccola overlay"
        }
        accessibilityRole="button"
        onPress={toggleTruckOverlay}
        style={[
          shopStyles.shippingPill,
          shopStyles.shippingPillOverlay,
          shopStyles.shippingPreviewReadyButton,
          isTruckOverlayVisible && shopStyles.shippingPreviewBackButton,
        ]}
      >
        <Text
          onLayout={({ nativeEvent: { layout } }) =>
            updateShippingPreviewActionTextWidth(
              shippingPreviewActionButtonLabel,
              layout.width
            )
          }
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
          <View
            style={[
              shopStyles.shippingPreviewReadyButtonTriangle,
              { right: shippingPreviewActionTriangleOffset },
            ]}
          />
        ) : (
          <View
            style={[
              shopStyles.shippingPreviewReadyButtonTriangleBack,
              { left: shippingPreviewActionTriangleOffset },
            ]}
          />
        )}
      </Pressable>
    </View>
  );

  return (
    <View style={shopStyles.screen}>
      <View pointerEvents="none" style={shopStyles.shopBackgroundHero}>
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
                  fontFamily: "Dream Avenue",
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
                          adjustsFontSizeToFit
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
        <View pointerEvents="none" style={shopStyles.shopScreenDimLayer} />
      ) : null}

      {isTruckOverlayVisible ? (
        <View style={shopStyles.truckOverlayTouchFrame}>
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
                onStartShouldSetResponder={() => !isCartOverlayVisible}
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
                    isCartOverlayVisible && shopStyles.cartOverlayTopFill,
                  ]}
                />
                <View
                  pointerEvents="none"
                  style={shopStyles.piccolaOverlayBottomFill}
                />
                {isCartOverlayVisible ? (
                  <View
                    style={shopStyles.cartOverlayBottomBanner}
                  >
                    {overlayCartProducts.filter(
                      (product) =>
                        (overlayProductQuantities[product.name] || 0) > 0
                    ).map((product) => {
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
                            style={shopStyles.cartOverlayBottomProductName}
                          >
                            {product.name}
                          </Text>
                          <Text style={shopStyles.cartOverlayBottomQuantity}>
                            x {productQuantity}
                          </Text>
                          <Text style={shopStyles.cartOverlayBottomTotal}>
                            ={" "}
                            {formatCartPriceTotal(
                              productPrice,
                              productQuantity
                            )}
                          </Text>
                        </View>
                      );
                    })}
                    <View style={shopStyles.cartOverlayBottomGrandTotal}>
                      <Text style={shopStyles.cartOverlayBottomGrandTotalLabel}>
                        TOTAL
                      </Text>
                      <Text style={shopStyles.cartOverlayBottomGrandTotalEquals}>
                        =
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={shopStyles.cartOverlayBottomGrandTotalAmount}
                      >
                        {formatCartCurrency(overlayCartAccruedTotal)}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityLabel="Checkout"
                      accessibilityRole="button"
                      style={shopStyles.cartOverlayCheckoutButton}
                    >
                      <Text style={shopStyles.cartOverlayCheckoutButtonText}>
                        Checkout
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
                {isCartOverlayVisible ? (
                  <ScrollView
                    contentContainerStyle={shopStyles.cartOverlayContentList}
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
                    {overlayCartProducts.map((product, index) => {
                      const productQuantity =
                        overlayProductQuantities[product.name] || 0;
                      const productPrice =
                        product.overlayPrice || product.price;

                      return (
                        <View
                          key={product.name}
                          style={shopStyles.cartOverlayProductEntry}
                        >
                          {index > 0 ? (
                            <View
                              style={shopStyles.cartOverlayProductDivider}
                            />
                          ) : null}
                          <View style={shopStyles.cartOverlayProductRow}>
                            <View style={shopStyles.cartOverlayProductBlock}>
                              <Text style={shopStyles.cartOverlayProductName}>
                                {product.name}
                              </Text>
                              <Image
                                source={product.image}
                                style={shopStyles.cartOverlayProductImage}
                                resizeMode="contain"
                              />
                              <View
                                style={shopStyles.cartOverlayProductPriceRow}
                              >
                                <Text
                                  style={shopStyles.cartOverlayProductPrice}
                                >
                                  {productPrice}
                                </Text>
                              </View>
                            </View>
                            <View style={shopStyles.cartOverlayQuantityFrame}>
                              <Pressable
                                accessibilityLabel={`Add one ${product.name}`}
                                accessibilityRole="button"
                                hitSlop={8}
                                onPress={() => {
                                  updateOverlayProductQuantity(
                                    product.name,
                                    (current) => Math.min(9, current + 1)
                                  );
                                }}
                                style={[
                                  shopStyles.piccolaOverlayQuantityChevronOutside,
                                  shopStyles.piccolaOverlayQuantityChevronLeft,
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
                                ]}
                              >
                                <Text
                                  style={[
                                    shopStyles.piccolaOverlayBuyButtonText,
                                    productQuantity === 0
                                      ? shopStyles.piccolaOverlayQuantityZeroText
                                      : shopStyles.piccolaOverlayBuyButtonTextAdded,
                                    shopStyles.piccolaOverlayQuantityNumber,
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
                                    (current) => Math.max(0, current - 1)
                                  );
                                }}
                                style={[
                                  shopStyles.piccolaOverlayQuantityChevronOutside,
                                  shopStyles.piccolaOverlayQuantityChevronRight,
                                ]}
                              >
                                <PiccolaQuantityTriangle
                                  direction="down"
                                  muted={productQuantity === 0}
                                />
                              </Pressable>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
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
                              adjustsFontSizeToFit
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
                                height:
                                  piccolaOverlayDescriptionHeight || undefined,
                                marginLeft: truckOverlayInnerHorizontalPadding,
                              },
                            ]}
                          >
                            <Text
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
                              <Text style={shopStyles.piccolaOverlayPrice}>
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
                                  {showOverlayQuantityCheckBox ? (
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
                                        showOverlayQuantityCheckConfirmed
                                          ? shopStyles.piccolaOverlayQuantityTopBoxFill
                                          : shopStyles.piccolaOverlayQuantityTopBoxPending,
                                        shopStyles.piccolaOverlayQuantityTopBox,
                                        {
                                          top: piccolaOverlayQuantityTopBoxTop,
                                        },
                                      ]}
                                    >
                                      <PiccolaQuantityActionIcon
                                        confirmed={
                                          showOverlayQuantityCheckConfirmed
                                        }
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

      {isTruckOverlayVisible ? (
        <View
          style={[
            shopStyles.shippingPreviewGoBackSideButtonFrame,
            {
              top: shippingPreviewActionButtonScreenTop,
              left: shippingPreviewGoBackSideButtonLeft,
              width: shippingPreviewGoBackSideButtonWidth,
            },
          ]}
        >
          <ButtonShadowPlate
            style={shopStyles.shippingPreviewGoBackSideButtonShadowPlate}
          />
          <Pressable
            accessibilityLabel="Secondary shop action"
            accessibilityRole="button"
            onPress={toggleCartOverlay}
            style={shopStyles.shippingPreviewGoBackSideButton}
          >
            <ShoppingCartIcon />
            {overlayConfirmedProductCount > 0 ? (
              <View
                pointerEvents="none"
                style={[
                  shopStyles.piccolaOverlayBuyButton,
                  shopStyles.piccolaOverlayQuantityTopBoxFill,
                  shopStyles.shippingPreviewCartCheckBadge,
                ]}
              >
                <Text style={shopStyles.shippingPreviewCartCheckBadgeText}>
                  {overlayConfirmedProductCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
