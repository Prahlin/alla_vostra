import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  FlatList,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { useLocalSearchParams } from "expo-router";
import { CardForm, useStripe } from "@stripe/stripe-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import ButtonShadowPlate from "../components/ButtonShadowPlate";
import Pressable, { triggerHapticTick } from "../components/HapticPressable";
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
import {
  createStripePaymentSheet,
  getStripeConfigurationIssue,
} from "../utils/stripePayments";

const initialOverlayNavIndex = overlayNavProducts.findIndex(
  (product) => product.name === piccolaProduct.name,
);
const shippingPreviewActionBandPortionCount = 5;
const shippingPreviewActionBandSlideDuration = 130;
const shippingPreviewChromeStops = [
  { offset: "0%", color: "#111111" },
  { offset: "14%", color: "#26170e" },
  { offset: "31%", color: "#5b3218" },
  { offset: "52%", color: "#99582a" },
  { offset: "73%", color: "#d08a3d" },
  { offset: "100%", color: "#f7b967" },
];

const productServingLeadPattern = /^(Serving\s+(\d+))(.*)$/;

function getProductServingCount(description) {
  const match = description.match(productServingLeadPattern);

  if (!match) {
    return "";
  }

  return match[2];
}

function getRequestedOverlayProductName(value) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const requestedName = String(rawValue || "").trim();

  if (!requestedName) {
    return "";
  }

  const normalizedRequestedName = requestedName.toLowerCase();
  const requestedProduct = products.find(
    (product) => product.name.toLowerCase() === normalizedRequestedName,
  );

  return requestedProduct?.name || "";
}

function OptionOneButtonGradient({ variant }) {
  const colorsByVariant = {
    green: ["#2F9348", "#247C3A", "#1D6630"],
    red: ["#DD3939", "#C62828", "#A92121"],
    removeRed: ["#CF3128", "#B91F18", "#941913"],
  };
  const colors = colorsByVariant[variant] || colorsByVariant.green;

  return (
    <LinearGradient
      colors={colors}
      locations={[0, 0.52, 1]}
      pointerEvents="none"
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={shopStyles.confirmationOverlayButtonGradient}
    />
  );
}

function renderOverlayDescription(description) {
  const match = description.match(productServingLeadPattern);

  if (!match) {
    return description;
  }

  return (
    <>
      <Text style={shopStyles.piccolaOverlayDescriptionLead}>{match[1]}</Text>
      {match[3]}
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

const contactOverlayRows = [
  [{ key: "contactInfoHeading", label: "Contact info", type: "sectionHeading" }],
  [
    {
      key: "contactInfoFields",
      type: "contactInfoBlock",
      fields: [
        {
          key: "giftFirstName",
          label: "First name:",
        },
        {
          key: "giftLastName",
          label: "Last name:",
        },
        {
          key: "email",
          label: "Email:",
          keyboardType: "email-address",
        },
        {
          key: "phone",
          label: "Phone #:",
          keyboardType: "phone-pad",
        },
      ],
    },
  ],
];

const deliveryTimeRequiredFieldKeys = [
  "deliveryHour",
  "deliveryMinute",
  "deliveryPeriod",
];

const deliveryOverlayRows = [
  [
    {
      key: "deliveryTimeHeading",
      label: "Delivery Date & Time",
      type: "sectionHeading",
    },
  ],
  [
    { key: "deliveryMonth", label: "Month:", type: "deliveryMonth", flex: 1 },
    { key: "deliveryDate", label: "Date:", type: "deliveryDate", flex: 1 },
    { key: "deliveryTimeWheels", type: "deliveryTimeWheels", flex: 3 },
  ],
  [
    {
      key: "deliveryAddressHeading",
      label: "Delivery Address",
      type: "sectionHeading",
    },
  ],
  [
    { key: "firstName", label: "First name:" },
    { key: "lastName", label: "Last name:" },
  ],
  [
    { key: "address", label: "Street Address:", flex: 8 },
    { key: "apartment", label: "Unit #:", flex: 2 },
  ],
  [
    { key: "city", label: "City:", flex: 5 },
    { key: "state", label: "State:", type: "state", flex: 2 },
    { key: "zip", label: "Zip:", flex: 3, keyboardType: "number-pad" },
    { key: "cityStateZipGap", type: "rowGapAfter" },
  ],
];
const paymentOverlayCardRows = [
  [
    {
      key: "paymentCardFirstName",
      label: "First name:",
      autoCapitalize: "words",
      autoComplete: "given-name",
    },
    {
      key: "paymentCardLastName",
      label: "Last Name:",
      autoCapitalize: "words",
      autoComplete: "family-name",
    },
  ],
  [
    {
      key: "paymentCardBillingZip",
      label: "Billing ZIP:",
      autoComplete: "postal-code",
      flex: 1,
      keyboardType: "number-pad",
      maxLength: 10,
    },
    { key: "paymentCardBillingZipSpacer", type: "spacer", flex: 1 },
  ],
];
const getOverlayRequiredFieldKeys = (rows) =>
  rows.reduce((fieldKeys, row) => {
    row.forEach((field) => {
      if (
        field.type === "rowGapAfter" ||
        field.type === "sectionHeading" ||
        field.type === "spacer"
      ) {
        return;
      }

      if (field.type === "contactInfoBlock" || field.type === "fieldGroup") {
        field.fields.forEach((groupField) => {
          if (groupField.type === "spacer") {
            return;
          }

          fieldKeys.push(groupField.key);
        });
        return;
      }

      if (field.type === "deliveryTimeWheels") {
        fieldKeys.push(...deliveryTimeRequiredFieldKeys);
        return;
      }

      fieldKeys.push(field.key);
    });

    return fieldKeys;
  }, []);
const contactOverlayRequiredFieldKeys =
  getOverlayRequiredFieldKeys(contactOverlayRows);
const deliveryOverlayRequiredFieldKeys =
  getOverlayRequiredFieldKeys(deliveryOverlayRows);
const paymentOverlayCardRequiredFieldKeys =
  getOverlayRequiredFieldKeys(paymentOverlayCardRows);
const deliveryOverlayFieldVerticalGap = 8;
const deliveryFieldPressRetentionOffset = {
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
};
const deliveryStateOptionHeight = 28;
const deliveryStateOptions = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
  "AS",
  "GU",
  "MP",
  "PR",
  "UM",
  "VI",
];
const deliveryTimeMonthOptions = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const getOrdinalDateLabel = (dateNumber) => {
  const lastTwoDigits = dateNumber % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${dateNumber}th`;
  }

  switch (dateNumber % 10) {
    case 1:
      return `${dateNumber}st`;
    case 2:
      return `${dateNumber}nd`;
    case 3:
      return `${dateNumber}rd`;
    default:
      return `${dateNumber}th`;
  }
};
const deliveryTimeDateOptions = Array.from({ length: 31 }, (_, index) =>
  getOrdinalDateLabel(index + 1),
);
const deliveryTimeDropdownOptionsByType = {
  deliveryDate: deliveryTimeDateOptions,
  deliveryMonth: deliveryTimeMonthOptions,
};
const deliveryTimeWheelFieldHeightScale = 0.81 * 1.25;
const deliveryTimeWheelOptionHeight = Platform.select({
  ios: 38.4 * deliveryTimeWheelFieldHeightScale,
  default: 48 * deliveryTimeWheelFieldHeightScale,
});
const deliveryTimeWheelScrollStepHeight = deliveryTimeWheelOptionHeight * 1.25;
const deliveryTimeWheelLoopCount = 241;
const deliveryTimeWheelLoopMidpoint = Math.floor(
  deliveryTimeWheelLoopCount / 2,
);
const deliveryTimeHourOptions = Array.from({ length: 12 }, (_, index) =>
  String(index + 1),
);
const deliveryTimeMinuteOptions = ["00", "15", "30", "45"];
const deliveryTimePeriodOptions = ["AM", "PM"];
const deliveryTimeWheelFields = [
  {
    accessibilityLabel: "Delivery hour",
    key: "deliveryHour",
    options: deliveryTimeHourOptions,
  },
  {
    accessibilityLabel: "Delivery minute",
    key: "deliveryMinute",
    options: deliveryTimeMinuteOptions,
  },
  {
    accessibilityLabel: "Delivery AM or PM",
    key: "deliveryPeriod",
    options: deliveryTimePeriodOptions,
  },
];
const defaultDeliveryFieldValues = {
  deliveryHour: "7",
  deliveryMinute: "15",
  deliveryPeriod: "PM",
};
const paymentOverlayWalletMethods = ["Google Pay", "Apple Pay", "PayPal"];
const paymentOverlayCardMethod = "Debit/Credit Card";
const paymentIssuerOptions = ["VISA", "MASTERCARD", "AMEX"];
const paymentOverlayWalletMethodIcons = {
  "Google Pay": require("../assets/payments/google-pay-mark.png"),
  "Apple Pay": require("../assets/payments/apple-pay-mark.png"),
  PayPal: require("../assets/payments/paypal-monogram.png"),
};

const getOverlayFieldPromptLabel = (label) =>
  String(label || "")
    .replace(/:\s*$/, "")
    .trim();

function getStripeCardBrandLabel(brand) {
  switch (brand) {
    case "Visa":
      return "VISA";
    case "MasterCard":
      return "MASTERCARD";
    case "AmericanExpress":
      return "AMEX";
    case "Unknown":
    case undefined:
    case null:
      return "";
    default:
      return String(brand)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .toUpperCase();
  }
}
const cartOverlayGrandTotalLetters = ["T", "O", "T", "A", "L"];

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
const cartOverlayAddedProductAssetScale = 1.215;
const scaleCartOverlayAddedProduct = (value) =>
  scaleCartOverlayFilled(value * cartOverlayAddedProductAssetScale);
const cartOverlayFilledControlReductionScale = 0.75;
const cartOverlayControlSizeScale =
  0.9 * cartOverlayFilledControlReductionScale;
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
const cartOverlayProductImageSizeScale = 0.99;
const cartOverlayProductImageBaseSize = scaleCartOverlayAddedProduct(
  90.767061 * cartOverlayProductImageSizeScale,
);
const cartOverlayProductImageVisualTopInsetRatio = 0.11;
const cartOverlayProductImageVisualBottomInsetRatio = 0.15;
const cartOverlayProductImageVisibleHeightRatio = Math.max(
  0,
  1 -
    cartOverlayProductImageVisualTopInsetRatio -
    cartOverlayProductImageVisualBottomInsetRatio,
);
const cartOverlayCounterVisibleHeightScale = 1.1;
const cartOverlayQuantityStackBaseHeight = scaleCartOverlayAddedProduct(
  25.353 * 2 + 37.4625,
);
const cartOverlayCounterImageMatchScale =
  (cartOverlayProductImageBaseSize *
    cartOverlayProductImageVisibleHeightRatio *
    cartOverlayCounterVisibleHeightScale) /
  cartOverlayQuantityStackBaseHeight;
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
const cartOverlayRemoveButtonBaseSize = scaleCartOverlayAddedProduct(39.335625);
const cartOverlayRemoveButtonTextBaseSize = scaleCartOverlayAddedProduct(34);
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
const cartOverlayReceiptHorizontalInset = scaleCartOverlayReceipt(12);
const cartOverlayBottomBannerMinHeight = overlayOrangeBandHeight * 4.5;
const cartOverlayBottomSummaryLineHeight = scaleCartOverlayReceipt(16);
const cartOverlayBottomSummarySpacerHeight = scaleCartOverlayReceipt(8);
const cartOverlayBottomGrandTotalLineHeight = scaleCartOverlayReceipt(25);
const cartOverlayBottomControlsGap = 4;
const paymentOverlayHorizontalInset = 12;
const paymentOverlayWalletMethodGap = 8;
const paymentOverlayWalletButtonBaseSize = 55.5;
const paymentOverlayWalletButtonBaseRadius = 10.5;
const piccolaOverlayHeadingTopPadding = 16;
const shopMainPaddingTop = 26.8125;
const stickyCartEdgeOffset = 18;
const stickyCartButtonSize = 55.5;
const shippingPreviewIOSLayoutScale = Platform.OS === "ios" ? 0.77 : 1;
const scaleShippingPreview = (value) => value * shippingPreviewIOSLayoutScale;
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
const shippingPreviewActionSideBoxGap = 0;
const shippingPreviewActionSideBoxBleed = 10;
const shippingPreviewActionButtonTextLineHeight = Platform.select({
  ios: scaleShippingPreview(26.5625),
  default: 24.5625,
});
const shippingPreviewActionButtonHorizontalInset =
  (shippingPreviewReadyButtonHeight -
    shippingPreviewActionButtonTextLineHeight) /
  2;
const shippingPreviewActionCenterTextWidth = 94;
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

function DeliveryStateDropdownTriangle() {
  return (
    <Svg
      height={5}
      style={shopStyles.deliveryOverlayStateButtonTriangle}
      viewBox="0 0 8 5"
      width={7}
    >
      <Path d="M0 0H8L4 5Z" fill="#111111" />
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
  const { confirmPayment } = useStripe();
  const { openCart, openProduct, product } = useLocalSearchParams();
  const initialOpenCartRequest = Array.isArray(openCart)
    ? openCart[0]
    : openCart;
  const initialOpenProductRequest = Array.isArray(openProduct)
    ? openProduct[0]
    : openProduct;
  const initialRequestedProductName = getRequestedOverlayProductName(product);
  const shouldOpenCartInitially = Boolean(initialOpenCartRequest);
  const shouldOpenProductInitially =
    !shouldOpenCartInitially && Boolean(initialRequestedProductName);
  const initialRequestedOverlayNavIndex = overlayNavProducts.findIndex(
    (overlayProduct) => overlayProduct.name === initialRequestedProductName,
  );
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const { bottom: bottomInset } = safeAreaInsets;
  const topSafeInset = getTopSafeInset(safeAreaInsets);
  const resolvedShopHeaderHeight = getHeaderTopBarHeight(safeAreaInsets);
  const headerY = useRef(new Animated.Value(0)).current;
  const [isTruckOverlayVisible, setIsTruckOverlayVisible] = useState(
    shouldOpenCartInitially || shouldOpenProductInitially,
  );
  const [isCartOverlayVisible, setIsCartOverlayVisible] = useState(
    shouldOpenCartInitially,
  );
  const [isContactOverlayVisible, setIsContactOverlayVisible] =
    useState(false);
  const [isDeliveryOverlayVisible, setIsDeliveryOverlayVisible] =
    useState(false);
  const [isPaymentOverlayVisible, setIsPaymentOverlayVisible] = useState(false);
  const [
    isPaymentOrderConfirmationVisible,
    setIsPaymentOrderConfirmationVisible,
  ] = useState(false);
  const [isPlaceholderOverlayVisible, setIsPlaceholderOverlayVisible] =
    useState(false);
  const [isOrderPlacementConfirmed, setIsOrderPlacementConfirmed] =
    useState(false);
  const [, setHasCartOverlayCheckoutButtonBeenTapped] = useState(false);
  const [, setVisitedShippingPreviewDestinations] = useState(() => ({
    cart: shouldOpenCartInitially,
    contact: false,
    confirmation: false,
    delivery: false,
    payment: false,
    products: shouldOpenProductInitially,
  }));
  const [selectedDeliveryState, setSelectedDeliveryState] = useState("");
  const [selectedPaymentOverlayMethod, setSelectedPaymentOverlayMethod] =
    useState(null);
  const [selectedPaymentCardIssuer, setSelectedPaymentCardIssuer] =
    useState("");
  const [stripeCardDetails, setStripeCardDetails] = useState(null);
  const [deliveryFieldValues, setDeliveryFieldValues] = useState(
    defaultDeliveryFieldValues,
  );
  const [
    isDeliveryPhoneCheckboxChecked,
    setIsDeliveryPhoneCheckboxChecked,
  ] = useState(false);
  const [
    isPaymentBillingAddressMatched,
    setIsPaymentBillingAddressMatched,
  ] = useState(false);
  const [isStripePaymentInFlight, setIsStripePaymentInFlight] =
    useState(false);
  const [activeDeliveryFieldKey, setActiveDeliveryFieldKey] = useState(null);
  const [deliveryStateDropdownScrollY, setDeliveryStateDropdownScrollY] =
    useState(0);
  const [deliveryTimeDropdownScrollY, setDeliveryTimeDropdownScrollY] =
    useState(0);
  const [deliveryTimeWheelVisibleIndexes, setDeliveryTimeWheelVisibleIndexes] =
    useState({});
  const [isDeliveryStateDropdownOpen, setIsDeliveryStateDropdownOpen] =
    useState(false);
  const [openDeliveryTimeDropdownKey, setOpenDeliveryTimeDropdownKey] =
    useState(null);
  const [isPaymentIssuerDropdownOpen, setIsPaymentIssuerDropdownOpen] =
    useState(false);
  const [activeOverlayProductName, setActiveOverlayProductName] = useState(
    initialRequestedProductName || piccolaProduct.name,
  );
  const [
    cartOverlayGrandTotalAmountWidth,
    setCartOverlayGrandTotalAmountWidth,
  ] = useState(null);
  const [cartOverlayReceiptBlockWidth, setCartOverlayReceiptBlockWidth] =
    useState(null);
  const [cartOverlayScrollContentHeight, setCartOverlayScrollContentHeight] =
    useState(0);
  const [cartOverlayScrollY, setCartOverlayScrollY] = useState(0);
  const [piccolaOverlayDescriptionHeight, setPiccolaOverlayDescriptionHeight] =
    useState(0);
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
    setIsOrderConfirmationOverlayVisible,
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
    new Animated.Value(
      initialRequestedOverlayNavIndex >= 0
        ? initialRequestedOverlayNavIndex
        : initialOverlayNavIndex,
    ),
  ).current;
  const overlayNavIndicatorAnimationRef = useRef(null);
  const shippingPreviewActionBandProgress = useRef(
    new Animated.Value(shouldOpenCartInitially ? 1 : 0),
  ).current;
  const shippingPreviewActionBandAnimationRef = useRef(null);
  const overlayHeldArrowOpacity = useRef(new Animated.Value(0)).current;
  const overlayDirectionalLeftArrowOpacity = useRef(
    new Animated.Value(0),
  ).current;
  const overlayDirectionalRightArrowOpacity = useRef(
    new Animated.Value(0),
  ).current;
  const overlayDirectionalArrowBaseSuppression = useRef(
    new Animated.Value(0),
  ).current;
  const overlayDirectionalArrowResetTimeoutRef = useRef(null);
  const handledOpenCartParamRef = useRef(initialOpenCartRequest || null);
  const handledOpenProductParamRef = useRef(
    initialOpenProductRequest || initialRequestedProductName || null,
  );
  const deliveryStateButtonRef = useRef(null);
  const deliveryTimeButtonRefs = useRef({});
  const deliveryTimeWheelHapticIndexesRef = useRef({});
  const deliveryTimeWheelIsDraggingRef = useRef({});
  const deliveryTimeWheelScrollRefs = useRef({});
  const paymentIssuerButtonRef = useRef(null);
  const deliveryFieldInputRefs = useRef({});
  const lastDeliveryTextFieldTickAtRef = useRef(0);
  const overlaySwipeStartXRef = useRef(null);
  const overlaySwipeStartYRef = useRef(null);
  const overlaySwipeCommittedRef = useRef(false);
  const activeOverlayProduct =
    products.find((product) => product.name === activeOverlayProductName) ||
    piccolaProduct;
  const overlayImageOutgoingProduct =
    products.find(
      (product) => product.name === overlayImageOutgoingProductName,
    ) || null;
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
    overlayProductConfirmations[activeOverlayProductKey],
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

  const markShippingPreviewDestinationVisited = (destination) => {
    setVisitedShippingPreviewDestinations((current) => {
      if (!destination || current[destination]) return current;

      return {
        ...current,
        [destination]: true,
      };
    });
  };

  const isCartAddItemsActionVisible =
    isTruckOverlayVisible && isCartOverlayVisible;
  const isContactDeliveryActionVisible =
    isTruckOverlayVisible && isContactOverlayVisible;
  const isDeliveryPaymentActionVisible =
    isTruckOverlayVisible && isDeliveryOverlayVisible;
  const isPaymentViewCartActionVisible =
    isTruckOverlayVisible && isPaymentOverlayVisible;
  const isPlaceholderActionVisible =
    isTruckOverlayVisible && isPlaceholderOverlayVisible;
  const isProductsActionVisible =
    isTruckOverlayVisible &&
    !isCartOverlayVisible &&
    !isContactOverlayVisible &&
    !isDeliveryOverlayVisible &&
    !isPaymentOverlayVisible &&
    !isPlaceholderOverlayVisible;
  const shippingPreviewActionButtonLabel = isCartAddItemsActionVisible
    ? "Cart"
    : isContactDeliveryActionVisible
      ? "Contact"
      : isDeliveryPaymentActionVisible
        ? "Delivery"
        : isPaymentViewCartActionVisible
          ? "Payment"
          : isPlaceholderActionVisible
            ? isOrderPlacementConfirmed
              ? "Confirmed"
              : "Payment"
            : isTruckOverlayVisible
              ? "Products"
              : "Shop";
  const shippingPreviewActionAccessibilityLabel = isCartAddItemsActionVisible
    ? "Cart"
    : isContactDeliveryActionVisible
      ? "Contact"
      : isDeliveryPaymentActionVisible
        ? "Delivery"
        : isPaymentViewCartActionVisible
          ? "Payment"
          : isPlaceholderActionVisible
            ? isOrderPlacementConfirmed
              ? "Confirmed"
              : "Payment"
            : isTruckOverlayVisible
              ? "Products"
              : "Open Piccola overlay";
  const shippingPreviewLeftActionAccessibilityLabel = isCartAddItemsActionVisible
    ? "Products"
    : isContactDeliveryActionVisible
      ? "Cart"
      : isDeliveryPaymentActionVisible
        ? "Contact"
        : isPaymentViewCartActionVisible
          ? "Delivery"
          : isPlaceholderActionVisible
            ? "Payment"
            : shippingPreviewActionAccessibilityLabel;
  const hasZeroQuantityDisplayedCartProduct = overlayCartProducts.some(
    (product) => (overlayProductQuantities[product.name] || 0) < 1,
  );
  const isCartOverlayCheckoutButtonDimmed =
    overlayCartProducts.length === 0 || hasZeroQuantityDisplayedCartProduct;
  const isCartOverlayAddItemsButtonDimmed = products.every((product) =>
    overlayCartProducts.some(
      (cartProduct) => cartProduct.name === product.name,
    ),
  );
  const shouldDimShippingPreviewRightAction =
    isPlaceholderActionVisible && !isOrderPlacementConfirmed;
  const shippingPreviewActionBaseCenterButtonWidth =
    shippingPreviewActionCenterTextWidth +
    shippingPreviewActionButtonHorizontalInset * 2;
  const shouldShowShippingPreviewActionSideBoxes = isTruckOverlayVisible;
  const shippingPreviewActionResolvedSideBoxGap =
    shouldShowShippingPreviewActionSideBoxes
      ? shippingPreviewActionSideBoxGap
      : 0;
  const shippingPreviewActionLeftSideBoxWidth =
    shouldShowShippingPreviewActionSideBoxes
      ? stickyCartButtonSize * 0.721875
      : 0;
  const shippingPreviewActionRightSideBoxWidth =
    shippingPreviewActionLeftSideBoxWidth;
  const shippingPreviewActionBaseSideBoxBleed =
    shouldShowShippingPreviewActionSideBoxes
      ? shippingPreviewActionSideBoxBleed
      : 0;
  const shippingPreviewActionResolvedSideBoxBleed =
    shippingPreviewActionBaseSideBoxBleed;
  const shippingPreviewActionTargetStickyCartGap = stickyCartEdgeOffset;
  const shippingPreviewActionStickyCartLeft =
    windowWidth - stickyCartEdgeOffset - stickyCartButtonSize;
  const shippingPreviewActionMinCenterTextWidth =
    shippingPreviewActionCenterTextWidth * 0.72;
  const shippingPreviewActionMinCenterButtonInset = 4;
  const shippingPreviewActionMinCenterButtonWidth =
    shippingPreviewActionMinCenterTextWidth +
    shippingPreviewActionMinCenterButtonInset * 2;
  const shippingPreviewActionTargetCenterButtonWidthForStickyGap =
    shouldShowShippingPreviewActionSideBoxes
      ? Math.max(
          0,
          (shippingPreviewActionStickyCartLeft -
            shippingPreviewActionTargetStickyCartGap -
            windowWidth / 2 -
            shippingPreviewActionRightSideBoxWidth +
            shippingPreviewActionResolvedSideBoxBleed) *
            2,
        )
      : shippingPreviewActionBaseCenterButtonWidth;
  const shippingPreviewActionMaxCenterButtonWidthForScreen =
    shouldShowShippingPreviewActionSideBoxes
      ? Math.max(
          0,
          windowWidth -
            stickyCartEdgeOffset * 2 -
            shippingPreviewActionLeftSideBoxWidth -
            shippingPreviewActionRightSideBoxWidth -
            shippingPreviewActionResolvedSideBoxGap * 2 +
            shippingPreviewActionResolvedSideBoxBleed * 2,
        )
      : shippingPreviewActionBaseCenterButtonWidth;
  const shippingPreviewActionCenterButtonWidth =
    shouldShowShippingPreviewActionSideBoxes
      ? Math.min(
          shippingPreviewActionMaxCenterButtonWidthForScreen,
          Math.max(
            shippingPreviewActionMinCenterButtonWidth,
            shippingPreviewActionTargetCenterButtonWidthForStickyGap,
          ),
        )
      : shippingPreviewActionBaseCenterButtonWidth;
  const shippingPreviewActionCenterButtonHorizontalInset = Math.max(
    shippingPreviewActionMinCenterButtonInset,
    Math.min(
      shippingPreviewActionButtonHorizontalInset,
      (shippingPreviewActionCenterButtonWidth -
        shippingPreviewActionMinCenterTextWidth) /
        2,
    ),
  );
  const shippingPreviewActionBandIndex =
    isPaymentViewCartActionVisible || isPlaceholderActionVisible
      ? 4
      : isDeliveryPaymentActionVisible
        ? 3
        : isContactDeliveryActionVisible
          ? 2
          : isCartAddItemsActionVisible
            ? 1
            : 0;
  const shippingPreviewActionBandSegmentWidth =
    shippingPreviewActionCenterButtonWidth /
    shippingPreviewActionBandPortionCount;
  const shippingPreviewActionBandTranslateX = Animated.multiply(
    shippingPreviewActionBandProgress,
    shippingPreviewActionBandSegmentWidth,
  );
  const shippingPreviewActionClusterWidth =
    shippingPreviewActionLeftSideBoxWidth +
    shippingPreviewActionRightSideBoxWidth +
    shippingPreviewActionResolvedSideBoxGap * 2 +
    shippingPreviewActionCenterButtonWidth -
    shippingPreviewActionResolvedSideBoxBleed * 2;
  const overlayNavBarResolvedWidth =
    overlayNavBarWidth ||
    Math.max(0, windowWidth - truckOverlayHorizontalMargin * 2);
  const overlayNavItemWidth =
    overlayNavBarResolvedWidth / overlayNavProducts.length;
  const overlayNavIndicatorTranslateX = Animated.multiply(
    overlayNavIndicatorProgress,
    overlayNavItemWidth,
  );
  const [deliveryStateDropdownAnchor, setDeliveryStateDropdownAnchor] =
    useState(null);
  const [deliveryTimeDropdownAnchor, setDeliveryTimeDropdownAnchor] =
    useState(null);
  const [paymentIssuerDropdownAnchor, setPaymentIssuerDropdownAnchor] =
    useState(null);

  const measureDeliveryStateDropdownAnchor = () => {
    requestAnimationFrame(() => {
      deliveryStateButtonRef.current?.measureInWindow?.(
        (x, y, width, height) => {
          setDeliveryStateDropdownAnchor({ height, width, x, y });
        },
      );
    });
  };

  const measureDeliveryTimeDropdownAnchor = (fieldKey) => {
    requestAnimationFrame(() => {
      deliveryTimeButtonRefs.current[fieldKey]?.measureInWindow?.(
        (x, y, width, height) => {
          setDeliveryTimeDropdownAnchor({ height, width, x, y });
        },
      );
    });
  };

  const measurePaymentIssuerDropdownAnchor = () => {
    requestAnimationFrame(() => {
      paymentIssuerButtonRef.current?.measureInWindow?.(
        (x, y, width, height) => {
          setPaymentIssuerDropdownAnchor({ height, width, x, y });
        },
      );
    });
  };

  const dismissDeliveryStateDropdownToDefault = () => {
    setSelectedDeliveryState("");
    setActiveDeliveryFieldKey(null);
    setIsDeliveryStateDropdownOpen(false);
  };

  const dismissDeliveryTimeDropdown = () => {
    setActiveDeliveryFieldKey(null);
    setOpenDeliveryTimeDropdownKey(null);
  };

  const dismissPaymentIssuerDropdown = () => {
    setActiveDeliveryFieldKey(null);
    setIsPaymentIssuerDropdownOpen(false);
  };

  const triggerShopInteractionTick = (duration = 8, delay = 0) => {
    triggerHapticTick(duration, delay);
  };

  const triggerDeliveryTextFieldTick = () => {
    const now = Date.now();

    if (now - lastDeliveryTextFieldTickAtRef.current < 180) {
      return;
    }

    lastDeliveryTextFieldTickAtRef.current = now;
    triggerShopInteractionTick(18, 45);
  };

  const activateDeliveryTextField = (fieldKey) => {
    setActiveDeliveryFieldKey(fieldKey);
    setIsDeliveryStateDropdownOpen(false);
    setOpenDeliveryTimeDropdownKey(null);
    setIsPaymentIssuerDropdownOpen(false);
  };

  const deactivateDeliveryTextField = (fieldKey) => {
    setActiveDeliveryFieldKey((currentFieldKey) =>
      currentFieldKey === fieldKey ? null : currentFieldKey,
    );
  };

  const focusDeliveryTextField = (fieldKey) => {
    activateDeliveryTextField(fieldKey);
    requestAnimationFrame(() => {
      deliveryFieldInputRefs.current[fieldKey]?.focus?.();
    });
  };

  const handleDeliveryTextFieldPressIn = (fieldKey, isDisabled = false) => {
    if (isDisabled) {
      return;
    }

    triggerDeliveryTextFieldTick();
    focusDeliveryTextField(fieldKey);
  };

  const handleDeliveryDropdownFieldPressIn = (fieldKey) => {
    setActiveDeliveryFieldKey(fieldKey);
  };

  const toggleDeliveryGiftCheckbox = () => {
    setIsDeliveryPhoneCheckboxChecked((currentValue) => {
      const nextValue = !currentValue;

      if (!nextValue) {
        setActiveDeliveryFieldKey((currentFieldKey) =>
          currentFieldKey === "recipientName" ? null : currentFieldKey,
        );
        deliveryFieldInputRefs.current.recipientName?.blur?.();
      }

      return nextValue;
    });
  };

  const togglePaymentBillingAddressMatched = () => {
    setIsPaymentBillingAddressMatched((currentValue) => !currentValue);
  };

  const toggleDeliveryStateDropdown = () => {
    setActiveDeliveryFieldKey("state");
    setOpenDeliveryTimeDropdownKey(null);
    setIsPaymentIssuerDropdownOpen(false);

    if (!isDeliveryStateDropdownOpen) {
      measureDeliveryStateDropdownAnchor();
      setIsDeliveryStateDropdownOpen(true);
      return;
    }

    setActiveDeliveryFieldKey(null);
    setIsDeliveryStateDropdownOpen(false);
  };

  const selectDeliveryStateOption = (option) => {
    setSelectedDeliveryState(option);
    setActiveDeliveryFieldKey(null);
    setIsDeliveryStateDropdownOpen(false);
  };

  const toggleDeliveryTimeDropdown = (fieldKey) => {
    setActiveDeliveryFieldKey(fieldKey);
    setIsDeliveryStateDropdownOpen(false);
    setIsPaymentIssuerDropdownOpen(false);

    if (openDeliveryTimeDropdownKey !== fieldKey) {
      measureDeliveryTimeDropdownAnchor(fieldKey);
      setOpenDeliveryTimeDropdownKey(fieldKey);
      return;
    }

    setActiveDeliveryFieldKey(null);
    setOpenDeliveryTimeDropdownKey(null);
  };

  const selectDeliveryTimeDropdownOption = (fieldKey, option) => {
    setDeliveryFieldValues((currentValues) => ({
      ...currentValues,
      [fieldKey]: option,
    }));
    setActiveDeliveryFieldKey(null);
    setOpenDeliveryTimeDropdownKey(null);
  };

  const getDeliveryTimeWheelLoopedIndex = (options, optionIndex) =>
    deliveryTimeWheelLoopMidpoint * options.length + optionIndex;

  const getDeliveryTimeWheelLoopedIndexFromScrollY = (scrollY) =>
    Math.max(0, Math.round(scrollY / deliveryTimeWheelScrollStepHeight));

  const getDeliveryTimeWheelOptionIndexFromScrollY = (options, scrollY) => {
    if (options.length === 0) {
      return 0;
    }

    const loopedIndex = getDeliveryTimeWheelLoopedIndexFromScrollY(scrollY);

    return ((loopedIndex % options.length) + options.length) % options.length;
  };

  const setDeliveryTimeWheelVisibleLoopedIndex = (fieldKey, loopedIndex) => {
    setDeliveryTimeWheelVisibleIndexes((currentIndexes) => {
      if (currentIndexes[fieldKey] === loopedIndex) {
        return currentIndexes;
      }

      return {
        ...currentIndexes,
        [fieldKey]: loopedIndex,
      };
    });
  };

  const triggerDeliveryTimeWheelTick = (fieldKey, loopedIndex) => {
    if (
      Platform.OS !== "android" ||
      !deliveryTimeWheelIsDraggingRef.current[fieldKey] ||
      deliveryTimeWheelHapticIndexesRef.current[fieldKey] === loopedIndex
    ) {
      return;
    }

    deliveryTimeWheelHapticIndexesRef.current[fieldKey] = loopedIndex;
    triggerShopInteractionTick();
  };

  const updateDeliveryTimeWheelVisibleIndex = (fieldKey, scrollY) => {
    const loopedIndex = getDeliveryTimeWheelLoopedIndexFromScrollY(scrollY);

    setDeliveryTimeWheelVisibleLoopedIndex(fieldKey, loopedIndex);
    triggerDeliveryTimeWheelTick(fieldKey, loopedIndex);
  };

  const scrollDeliveryTimeWheelToIndex = (
    fieldKey,
    optionIndex,
    options,
    animated = true,
  ) => {
    const offset =
      getDeliveryTimeWheelLoopedIndex(options, optionIndex) *
      deliveryTimeWheelScrollStepHeight;

    requestAnimationFrame(() => {
      const scrollNode = deliveryTimeWheelScrollRefs.current[fieldKey];

      if (scrollNode?.scrollToOffset) {
        scrollNode.scrollToOffset({ animated, offset });
        return;
      }

      scrollNode?.scrollTo?.({
        animated,
        y: offset,
      });
    });
  };

  const setDeliveryTimeWheelValue = (
    fieldKey,
    option,
    options,
    shouldScroll = true,
  ) => {
    setDeliveryFieldValues((currentValues) => ({
      ...currentValues,
      [fieldKey]: option,
    }));
    setActiveDeliveryFieldKey(fieldKey);
    setIsDeliveryStateDropdownOpen(false);
    setOpenDeliveryTimeDropdownKey(null);
    setIsPaymentIssuerDropdownOpen(false);
    setDeliveryTimeWheelVisibleLoopedIndex(
      fieldKey,
      getDeliveryTimeWheelLoopedIndex(
        options,
        Math.max(0, options.indexOf(option)),
      ),
    );

    if (shouldScroll) {
      scrollDeliveryTimeWheelToIndex(
        fieldKey,
        Math.max(0, options.indexOf(option)),
        options,
        true,
      );
    }
  };

  const settleDeliveryTimeWheel = (fieldKey, options, scrollY) => {
    const optionIndex = getDeliveryTimeWheelOptionIndexFromScrollY(
      options,
      scrollY,
    );

    setDeliveryTimeWheelValue(fieldKey, options[optionIndex], options, false);
    deliveryTimeWheelIsDraggingRef.current[fieldKey] = false;
    scrollDeliveryTimeWheelToIndex(fieldKey, optionIndex, options, false);
  };

  const togglePaymentIssuerDropdown = () => {
    setActiveDeliveryFieldKey("paymentCardIssuer");
    setIsDeliveryStateDropdownOpen(false);
    setOpenDeliveryTimeDropdownKey(null);

    if (!isPaymentIssuerDropdownOpen) {
      measurePaymentIssuerDropdownAnchor();
      setIsPaymentIssuerDropdownOpen(true);
      return;
    }

    setActiveDeliveryFieldKey(null);
    setIsPaymentIssuerDropdownOpen(false);
  };

  const selectPaymentIssuerOption = (option) => {
    setSelectedPaymentCardIssuer(option);
    setActiveDeliveryFieldKey(null);
    setIsPaymentIssuerDropdownOpen(false);
  };

  const getOverlayFieldValue = (fieldKey) =>
    String(deliveryFieldValues[fieldKey] || "").trim();

  const getDeliveryTimeValue = () => {
    const hour = getOverlayFieldValue("deliveryHour");
    const minute = getOverlayFieldValue("deliveryMinute");
    const period = getOverlayFieldValue("deliveryPeriod");

    if (!hour || !minute || !period) {
      return "";
    }

    return `${hour}:${minute} ${period}`;
  };

  const handleStripeCardFormComplete = (cardDetails) => {
    setStripeCardDetails(cardDetails);
    setSelectedPaymentCardIssuer(getStripeCardBrandLabel(cardDetails?.brand));
  };

  const showPaymentAlert = (title, message) => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.alert(`${title}\n${message}`);
      return;
    }

    Alert.alert(title, message);
  };

  const buildStripeOrderPayload = () => ({
    items: overlayCartBillableProducts
      .map((product) => ({
        name: product.name,
        quantity: overlayProductQuantities[product.name] || 0,
      }))
      .filter((item) => item.quantity > 0),
    contact: {
      firstName: getOverlayFieldValue("giftFirstName"),
      lastName: getOverlayFieldValue("giftLastName"),
      email: getOverlayFieldValue("email"),
      phone: getOverlayFieldValue("phone"),
    },
    delivery: {
      firstName: getOverlayFieldValue("firstName"),
      lastName: getOverlayFieldValue("lastName"),
      address: getOverlayFieldValue("address"),
      apartment: getOverlayFieldValue("apartment"),
      city: getOverlayFieldValue("city"),
      date: getOverlayFieldValue("deliveryDate"),
      hour: getOverlayFieldValue("deliveryHour"),
      minute: getOverlayFieldValue("deliveryMinute"),
      month: getOverlayFieldValue("deliveryMonth"),
      period: getOverlayFieldValue("deliveryPeriod"),
      state: selectedDeliveryState,
      time: getDeliveryTimeValue(),
      zip: getOverlayFieldValue("zip"),
    },
    payment: {
      selectedMethod: selectedPaymentOverlayMethod,
      billingAddressMatchesDelivery: isPaymentBillingAddressMatched,
    },
  });

  const buildStripeBillingDetails = () => {
    const deliveryName = [
      getOverlayFieldValue("firstName"),
      getOverlayFieldValue("lastName"),
    ]
      .filter(Boolean)
      .join(" ");
    const contactName = [
      getOverlayFieldValue("giftFirstName"),
      getOverlayFieldValue("giftLastName"),
    ]
      .filter(Boolean)
      .join(" ");
    const cardholderName = [
      getOverlayFieldValue("paymentCardFirstName"),
      getOverlayFieldValue("paymentCardLastName"),
    ]
      .filter(Boolean)
      .join(" ");
    const billingName = isPaymentBillingAddressMatched
      ? deliveryName || contactName
      : cardholderName || contactName || deliveryName;
    const billingZip = isPaymentBillingAddressMatched
      ? getOverlayFieldValue("zip")
      : getOverlayFieldValue("paymentCardBillingZip") ||
        getOverlayFieldValue("zip");
    const address = isPaymentBillingAddressMatched
      ? {
          city: getOverlayFieldValue("city"),
          country: "US",
          line1: getOverlayFieldValue("address"),
          line2: getOverlayFieldValue("apartment"),
          postalCode: getOverlayFieldValue("zip"),
          state: selectedDeliveryState,
        }
      : {
          country: "US",
          postalCode: billingZip,
        };

    return {
      address,
      email: getOverlayFieldValue("email"),
      name: billingName,
      phone: getOverlayFieldValue("phone"),
    };
  };

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
      direction === "left" ? arrowHintPeakOpacity : 0,
    );
    overlayDirectionalRightArrowOpacity.setValue(
      direction === "right" ? arrowHintPeakOpacity : 0,
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
    }),
  );
  const overlayLeftArrowOpacity = Animated.add(
    overlayDirectionalBaseArrowOpacity,
    overlayDirectionalLeftArrowOpacity,
  ).interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const overlayRightArrowOpacity = Animated.add(
    overlayDirectionalBaseArrowOpacity,
    overlayDirectionalRightArrowOpacity,
  ).interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const overlayImageTravelDistance = Math.max(
    overlayImageStageWidth / 2 + piccolaOverlayImageHalfSize,
    150,
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
      (product) => product.name === fromName,
    );
    const toIndex = overlayNavProducts.findIndex(
      (product) => product.name === toName,
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
      (product) => product.name === nextProductName,
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
      nextProductName,
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
      (product) => product.name === activeOverlayProductName,
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
      (product) => product.name === activeOverlayProductName,
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
      shippingPreviewStackBottomY,
  );
  const shippingPreviewReadyButtonStickyCartAlignedLeft = Math.max(
    0,
    windowWidth -
      shopMainHorizontalPadding -
      stickyCartEdgeOffset * 2 -
      stickyCartButtonSize -
      shippingPreviewActionCenterButtonWidth,
  );
  const shippingPreviewActionClusterStickyCartAlignedLeft = Math.max(
    0,
    shippingPreviewReadyButtonStickyCartAlignedLeft -
      shippingPreviewActionLeftSideBoxWidth -
      shippingPreviewActionResolvedSideBoxGap +
      shippingPreviewActionResolvedSideBoxBleed,
  );
  const shippingPreviewReadyButtonCenteredMarginTop =
    Platform.OS === "ios"
      ? shippingPreviewStickyCartAlignedMarginTop
      : Math.max(
          0,
          shippingPreviewReadyButtonAvailableGap -
            (shippingPreviewReadyButtonAvailableGap / 2 -
              shippingPreviewReadyButtonCenterOffsetY) *
              0.75,
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
  const deliveryStateDropdownTop = deliveryStateDropdownAnchor
    ? deliveryStateDropdownAnchor.y +
      deliveryStateDropdownAnchor.height +
      deliveryOverlayFieldVerticalGap
    : 0;
  const deliveryTimeDropdownTop = deliveryTimeDropdownAnchor
    ? deliveryTimeDropdownAnchor.y +
      deliveryTimeDropdownAnchor.height +
      deliveryOverlayFieldVerticalGap
    : 0;
  const paymentIssuerDropdownTop = paymentIssuerDropdownAnchor
    ? paymentIssuerDropdownAnchor.y +
      paymentIssuerDropdownAnchor.height +
      deliveryOverlayFieldVerticalGap
    : 0;
  const deliveryTimeDropdownOptions = openDeliveryTimeDropdownKey
    ? deliveryTimeDropdownOptionsByType[openDeliveryTimeDropdownKey] || []
    : [];
  const selectedDeliveryTimeDropdownValue = openDeliveryTimeDropdownKey
    ? deliveryFieldValues[openDeliveryTimeDropdownKey] || ""
    : "";
  const deliveryStateDropdownHeight = deliveryStateDropdownAnchor
    ? Math.max(
        96,
        Math.min(
          198,
          windowHeight - deliveryStateDropdownTop - bottomInset - 10,
        ),
      )
    : 154;
  const deliveryTimeDropdownHeight = deliveryTimeDropdownAnchor
    ? Math.max(
        96,
        Math.min(
          198,
          deliveryTimeDropdownOptions.length * deliveryStateOptionHeight,
          windowHeight - deliveryTimeDropdownTop - bottomInset - 10,
        ),
      )
    : 154;
  const paymentIssuerDropdownHeight =
    paymentIssuerOptions.length * deliveryStateOptionHeight;
  const deliveryStateDropdownCenterIndex = Math.max(
    0,
    Math.min(
      deliveryStateOptions.length - 1,
      Math.floor(
        (deliveryStateDropdownScrollY + deliveryStateDropdownHeight / 2) /
          deliveryStateOptionHeight,
      ),
    ),
  );
  const deliveryTimeDropdownCenterIndex = Math.max(
    0,
    Math.min(
      Math.max(0, deliveryTimeDropdownOptions.length - 1),
      Math.floor(
        (deliveryTimeDropdownScrollY + deliveryTimeDropdownHeight / 2) /
          deliveryStateOptionHeight,
      ),
    ),
  );
  const shouldShowFloridaOnlyDeliveryMessage =
    selectedDeliveryState && selectedDeliveryState !== "FL";
  const areRequiredOverlayFieldsComplete = (fieldKeys) =>
    fieldKeys.every((fieldKey) => {
      const fieldValue =
        fieldKey === "state"
          ? selectedDeliveryState
          : fieldKey === "paymentCardIssuer"
            ? selectedPaymentCardIssuer
          : deliveryFieldValues[fieldKey] || "";

      return fieldValue.trim().length > 0;
    });
  const areContactRequiredFieldsComplete = areRequiredOverlayFieldsComplete(
    contactOverlayRequiredFieldKeys,
  );
  const areDeliveryRequiredFieldsComplete = areRequiredOverlayFieldsComplete(
    deliveryOverlayRequiredFieldKeys,
  );
  const arePaymentCardRequiredFieldsComplete =
    selectedPaymentOverlayMethod !== paymentOverlayCardMethod ||
    paymentOverlayCardRequiredFieldKeys.every((fieldKey) => {
      if (
        isPaymentBillingAddressMatched &&
        fieldKey === "paymentCardBillingZip"
      ) {
        return true;
      }

      return getOverlayFieldValue(fieldKey).length > 0;
    });
  const isSelectedStripeCardComplete =
    selectedPaymentOverlayMethod !== paymentOverlayCardMethod ||
    Boolean(stripeCardDetails?.complete);
  const shouldDimContactProgressionButton = !areContactRequiredFieldsComplete;
  const shouldDimDeliveryProgressionButton = !areDeliveryRequiredFieldsComplete;
  const shouldDimPaymentOrderButton =
    isStripePaymentInFlight ||
    !areContactRequiredFieldsComplete ||
    !areDeliveryRequiredFieldsComplete ||
    selectedPaymentOverlayMethod !== paymentOverlayCardMethod ||
    !arePaymentCardRequiredFieldsComplete ||
    !isSelectedStripeCardComplete;
  const shopHeaderOffsetStyle = topSafeInset
    ? {
        top: resolvedShopHeaderHeight,
      }
    : null;
  const shippingPreviewActionClusterLeft =
    (windowWidth - shippingPreviewActionClusterWidth) / 2;
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
    truckOverlayBottom - truckOverlayTop,
  );
  const truckOverlayPreviousHeight = Math.max(
    120,
    truckOverlayBottom - truckOverlayPreviousTop,
  );
  const truckOverlayRawContentOffsetTop = Math.max(
    0,
    truckOverlayPreviousTop - truckOverlayTop,
  );
  const truckOverlayNavContentGap = Math.max(
    0,
    truckOverlayVerticalGap +
      truckOverlayRawContentOffsetTop -
      piccolaOverlayNavBarHeight,
  );
  const truckOverlayContentOffsetTop = Math.max(
    0,
    truckOverlayRawContentOffsetTop - truckOverlayNavContentGap / 2,
  );
  const truckOverlayContentHeight = Math.max(
    0,
    truckOverlayPreviousHeight - truckOverlayVerticalGap * 2,
  );
  const piccolaOverlayInnerWidth =
    windowWidth -
    truckOverlayHorizontalMargin * 2 -
    truckOverlayBorderWidth * 2 -
    truckOverlayInnerHorizontalPadding * 2;
  const paymentOverlayResolvedCardRows = paymentOverlayCardRows.map((row) =>
    row.map((field) =>
      field.key === "paymentCardBillingZip"
        ? {
            ...field,
            disabled: isPaymentBillingAddressMatched,
            forceSurface: !isPaymentBillingAddressMatched,
          }
        : field,
    ),
  );
  const paymentCardBrandLabel =
    selectedPaymentCardIssuer || getStripeCardBrandLabel(stripeCardDetails?.brand);
  const paymentOverlayStripeCardInputStyle = {
    backgroundColor: "#FFFFFF",
    borderColor: "#DED6CA",
    borderRadius: 0,
    borderWidth: 1,
    cursorColor: "#111111",
    fontSize: Platform.select({
      ios: 15,
      default: 15,
    }),
    placeholderColor: "#777777",
    textColor: "#111111",
    textErrorColor: "#9B1C1C",
  };
  const paymentOverlayWalletAvailableWidth = Math.max(
    0,
    piccolaOverlayInnerWidth - paymentOverlayHorizontalInset * 2,
  );
  const paymentOverlayWalletButtonSize = Math.max(
    0,
    (paymentOverlayWalletAvailableWidth -
      paymentOverlayWalletMethodGap *
        (paymentOverlayWalletMethods.length - 1)) /
      paymentOverlayWalletMethods.length,
  );
  const paymentOverlayWalletButtonScale =
    paymentOverlayWalletButtonBaseSize > 0
      ? paymentOverlayWalletButtonSize / paymentOverlayWalletButtonBaseSize
      : 1;
  const paymentOverlayWalletButtonStyle = {
    width: paymentOverlayWalletButtonSize,
    height: paymentOverlayWalletButtonSize,
    borderRadius:
      paymentOverlayWalletButtonBaseRadius * paymentOverlayWalletButtonScale,
  };
  const paymentOverlayWalletMethodImageStyles = {
    "Google Pay": {
      width: paymentOverlayWalletButtonSize * 0.86,
      height: paymentOverlayWalletButtonSize * 0.46,
    },
    "Apple Pay": {
      width: paymentOverlayWalletButtonSize * 0.82,
      height: paymentOverlayWalletButtonSize * 0.52,
    },
    PayPal: {
      width: paymentOverlayWalletButtonSize * 0.56,
      height: paymentOverlayWalletButtonSize * 0.68,
    },
  };
  const piccolaOverlayAvailableParagraphWidth = Math.max(
    0,
    piccolaOverlayInnerWidth -
      piccolaOverlayActionWidth -
      truckOverlayInnerHorizontalPadding,
  );
  const piccolaOverlayParagraphWidth = Math.min(
    piccolaOverlayAvailableParagraphWidth,
    windowWidth * 0.5,
  );
  const piccolaOverlayActionColumnHeight = Math.max(
    piccolaOverlayDescriptionHeight || 0,
    piccolaOverlayActionStackMinHeight,
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
              2,
        )
      : piccolaOverlayPriceSlotTop;
  const piccolaOverlayPopularToAddGap = Math.max(
    0,
    piccolaOverlaySwappedBuyButtonTop - piccolaOverlayPopularTagBottom,
  );
  const piccolaOverlayQuantityTopBoxTop =
    -piccolaOverlayQuantityTriangleHeight -
    piccolaOverlayPopularToAddGap -
    piccolaOverlayQuantityTopBoxHeight;
  const cartOverlayProductTop =
    overlayOrangeBandHeight + piccolaOverlayHeadingTopPadding;
  const cartOverlayCreamHorizontalInset = truckOverlayInnerHorizontalPadding;
  const cartOverlayCreamVerticalInset = cartOverlayCreamHorizontalInset;
  const cartOverlayCreamScrollbarWidth = 8;
  const cartOverlayCreamScrollbarRightGap = 2;
  const shouldReserveCartOverlayCreamScrollbarSpace =
    overlayCartProducts.length > 0;
  const cartOverlayCreamScrollbarReservedWidth =
    shouldReserveCartOverlayCreamScrollbarSpace
      ? cartOverlayCreamScrollbarWidth + cartOverlayCreamScrollbarRightGap
      : 0;
  const cartOverlayCreamContentRightInset =
    truckOverlayInnerHorizontalPadding +
    cartOverlayCreamScrollbarReservedWidth;
  const cartOverlayProductGridMarginScale = 1.5;
  const cartOverlayProductGridLeftInset =
    cartOverlayCreamHorizontalInset * cartOverlayProductGridMarginScale;
  const cartOverlayProductGridRightInset =
    cartOverlayCreamHorizontalInset * 2 * cartOverlayProductGridMarginScale;
  const cartOverlayProductDividerLeftInset =
    cartOverlayProductGridLeftInset;
  const cartOverlayProductDividerRightInset =
    cartOverlayProductGridRightInset;
  const cartOverlayProductGridLeft =
    cartOverlayProductGridLeftInset;
  const cartOverlayProductGridRight = Math.max(
    cartOverlayProductGridLeft,
    piccolaOverlayInnerWidth - cartOverlayProductGridRightInset,
  );
  const cartOverlayProductGridWidth = Math.max(
    0,
    cartOverlayProductGridRight - cartOverlayProductGridLeft,
  );
  const cartOverlayProductAssetGridLeft = cartOverlayProductGridLeft;
  const cartOverlayProductAssetGridRight = cartOverlayProductGridRight;
  const cartOverlayRowAvailableWidth = cartOverlayProductGridWidth;
  const cartOverlayLaneWidth = cartOverlayRowAvailableWidth / 2;
  const cartOverlayProductAssetFitScale =
    cartOverlayProductBlockBaseWidth > 0
      ? cartOverlayLaneWidth / cartOverlayProductBlockBaseWidth
      : 1;
  const cartOverlayEqualGapFitBaseWidth =
    cartOverlayProductImageBaseSize +
    cartOverlayQuantityBaseWidth * cartOverlayCounterImageMatchScale +
    cartOverlayRemoveButtonBaseSize * cartOverlayControlSizeScale;
  const cartOverlayEqualGapAssetFitScale =
    cartOverlayEqualGapFitBaseWidth > 0
      ? (cartOverlayLaneWidth * 2) / cartOverlayEqualGapFitBaseWidth
      : 1;
  const cartOverlayAssetScale = Math.min(
    1,
    Math.max(
      0,
      Math.min(
        cartOverlayProductAssetFitScale,
        cartOverlayEqualGapAssetFitScale,
      ),
    ),
  );
  const cartOverlayProductImageSize =
    cartOverlayProductImageBaseSize * cartOverlayAssetScale;
  const cartOverlayProductNameLineHeight = scaleCartOverlayAddedProduct(15);
  const cartOverlayProductPriceLineHeight = scaleCartOverlayAddedProduct(13);
  const cartOverlayProductNameAssetGapBase = scaleCartOverlayAddedProduct(17);
  const cartOverlayProductNameAssetGap =
    cartOverlayProductNameAssetGapBase * 2 + cartOverlayProductNameLineHeight;
  const cartOverlayProductVisualHeight =
    cartOverlayProductNameAssetGap + cartOverlayProductImageSize;
  const cartOverlayProductImageVisualBottomInset =
    cartOverlayProductImageSize *
    cartOverlayProductImageVisualBottomInsetRatio;
  const cartOverlayProductImageVisualTopInset =
    cartOverlayProductImageSize * cartOverlayProductImageVisualTopInsetRatio;
  const cartOverlayProductImageVisibleHeight = Math.max(
    0,
    cartOverlayProductImageSize -
      cartOverlayProductImageVisualTopInset -
      cartOverlayProductImageVisualBottomInset,
  );
  const cartOverlayCounterScale =
    cartOverlayQuantityStackBaseHeight > 0
      ? (cartOverlayProductImageVisibleHeight *
          cartOverlayCounterVisibleHeightScale) /
        cartOverlayQuantityStackBaseHeight
      : 0;
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
  const cartOverlayQuantityStackHeight =
    cartOverlayQuantityTriangleHeight * 2 + cartOverlayQuantityBoxHeight;
  const cartOverlayRemoveButtonWidth =
    cartOverlayRemoveButtonBaseSize *
    cartOverlayAssetScale *
    cartOverlayControlSizeScale;
  const cartOverlayRemoveButtonHeight = cartOverlayRemoveButtonWidth;
  const cartOverlayRemoveButtonTextSize =
    cartOverlayRemoveButtonTextBaseSize *
    cartOverlayAssetScale *
    cartOverlayControlSizeScale;
  const cartOverlayControlPairGap = Math.max(
    0,
    (cartOverlayLaneWidth * 2 -
      cartOverlayProductImageSize -
      cartOverlayQuantityWidth -
      cartOverlayRemoveButtonWidth) /
      3,
  );
  const cartOverlayControlsGroupWidth =
    cartOverlayQuantityWidth +
    cartOverlayControlPairGap +
    cartOverlayRemoveButtonWidth;
  const cartOverlayProductImageLeft =
    cartOverlayProductAssetGridLeft +
    Math.max(0, cartOverlayLaneWidth / 2 - cartOverlayProductImageSize / 2);
  const cartOverlayControlsGroupLeft =
    cartOverlayProductAssetGridLeft +
    cartOverlayLaneWidth +
    cartOverlayLaneWidth / 2 -
    cartOverlayControlsGroupWidth / 2;
  const cartOverlayProductImageRight =
    cartOverlayProductImageLeft + cartOverlayProductImageSize;
  const cartOverlayProductVerticalDividerLeft =
    cartOverlayProductImageRight +
    Math.max(0, cartOverlayControlsGroupLeft - cartOverlayProductImageRight) /
      2;
  const cartOverlayProductTopDividerTopInset = 2;
  const cartOverlayProductTopDividerHeight = 0.375;
  const cartOverlayProductTopDividerGap = 2;
  const cartOverlayProductSecondTopDividerTopInset =
    cartOverlayProductTopDividerTopInset +
    cartOverlayProductTopDividerHeight +
    cartOverlayProductTopDividerGap;
  const cartOverlayProductTopDividerBottomInset =
    cartOverlayProductSecondTopDividerTopInset +
    cartOverlayProductTopDividerHeight;
  const cartOverlayProductAssetLeftCellWidth = Math.max(
    0,
    cartOverlayProductVerticalDividerLeft - cartOverlayProductAssetGridLeft,
  );
  const cartOverlayProductAssetRightCellLeft =
    cartOverlayProductVerticalDividerLeft;
  const cartOverlayProductAssetRightCellWidth = Math.max(
    0,
    cartOverlayProductAssetGridRight - cartOverlayProductAssetRightCellLeft,
  );
  const cartOverlayProductGridCellPadding = scaleCartOverlayFilled(4);
  const cartOverlayBottomSummaryRows =
    overlayCartBillableProducts.length +
    (overlayCartBillableProducts.length > 0 ? 2 : 0);
  const cartOverlayBottomSummarySpacers =
    overlayCartBillableProducts.length > 0 ? 2 : 0;
  const cartOverlayBottomSummaryContentHeight =
    cartOverlayBottomSummaryRows * cartOverlayBottomSummaryLineHeight +
    cartOverlayBottomSummarySpacers * cartOverlayBottomSummarySpacerHeight +
    truckOverlayInnerHorizontalPadding * 2;
  const cartOverlayCheckoutButtonStackHeight =
    cartOverlayCheckoutButtonHeight * 2 + cartOverlayBottomControlsGap;
  const cartOverlayReceiptControlsHeight =
    cartOverlayCheckoutButtonHeight +
    cartOverlayBottomControlsGap +
    cartOverlayBottomGrandTotalLineHeight * 2;
  const cartOverlayBottomControlsHeight =
    truckOverlayInnerHorizontalPadding +
    Math.max(
      cartOverlayCheckoutButtonStackHeight,
      cartOverlayReceiptControlsHeight,
    ) +
    truckOverlayInnerHorizontalPadding;
  const cartOverlayBottomBannerHeight = Math.max(
    cartOverlayBottomBannerMinHeight,
    cartOverlayBottomSummaryContentHeight,
    cartOverlayBottomControlsHeight,
  );
  const cartCheckoutActionButtonBottomAlignedStyle = {
    bottom: overlayOrangeBandHeight + truckOverlayInnerHorizontalPadding,
  };
  const overlayContentActionButtonBottomAlignedStyle = {
    bottom: truckOverlayInnerHorizontalPadding,
  };
  const cartAddItemsActionButtonStyle = {
    bottom:
      overlayOrangeBandHeight +
      truckOverlayInnerHorizontalPadding +
      cartOverlayCheckoutButtonHeight +
      cartOverlayBottomControlsGap,
  };
  const cartOverlayCreamVisibleHeight = Math.max(
    0,
    truckOverlayHeight -
      cartOverlayProductTop -
      overlayOrangeBandHeight -
      cartOverlayBottomBannerHeight,
  );
  const shouldRenderCartOverlayCreamScrollbar =
    overlayCartProducts.length > 0 && cartOverlayCreamVisibleHeight > 0;
  const isCartOverlayCreamScrollbarActive = overlayCartProducts.length > 1;
  const shouldScrollCartOverlayCreamScrollbarThumb =
    isCartOverlayCreamScrollbarActive &&
    cartOverlayScrollContentHeight > cartOverlayCreamVisibleHeight + 1;
  const cartOverlayCreamScrollbarThumbHeight =
    shouldRenderCartOverlayCreamScrollbar
      ? shouldScrollCartOverlayCreamScrollbarThumb
        ? Math.max(
            scaleCartOverlayFilled(22),
            Math.min(
              cartOverlayCreamVisibleHeight,
              (cartOverlayCreamVisibleHeight / cartOverlayScrollContentHeight) *
                cartOverlayCreamVisibleHeight,
            ),
          )
        : cartOverlayCreamVisibleHeight
      : 0;
  const cartOverlayCreamScrollbarScrollRange = Math.max(
    1,
    cartOverlayScrollContentHeight - cartOverlayCreamVisibleHeight,
  );
  const cartOverlayCreamScrollbarTravel = Math.max(
    0,
    cartOverlayCreamVisibleHeight - cartOverlayCreamScrollbarThumbHeight,
  );
  const cartOverlayCreamScrollbarThumbTop =
    shouldScrollCartOverlayCreamScrollbarThumb
      ? Math.min(
          cartOverlayCreamScrollbarTravel,
          Math.max(
            0,
            (cartOverlayScrollY / cartOverlayCreamScrollbarScrollRange) *
              cartOverlayCreamScrollbarTravel,
          ),
        )
      : 0;
  const cartOverlayDeliveryTotal =
    overlayCartBillableProducts.length > 0 ? cartOverlayDeliveryFee : 0;
  const cartOverlayTaxableTotal =
    overlayCartAccruedTotal + cartOverlayDeliveryTotal;
  const cartOverlayTaxes =
    Math.round(cartOverlayTaxableTotal * cartOverlayTaxRate * 100) / 100;
  const cartOverlayGrandTotal = cartOverlayTaxableTotal + cartOverlayTaxes;
  const cartOverlayGrandTotalTargetWidth =
    typeof cartOverlayReceiptBlockWidth === "number"
      ? Math.max(
          0,
          cartOverlayReceiptBlockWidth / 2 -
            cartOverlayReceiptHorizontalInset,
        )
      : null;
  const cartOverlayGrandTotalResolvedWidth =
    typeof cartOverlayGrandTotalTargetWidth === "number"
      ? cartOverlayGrandTotalTargetWidth
      : cartOverlayGrandTotalAmountWidth;
  const cartOverlayGrandTotalWidthStyle =
    typeof cartOverlayGrandTotalResolvedWidth === "number"
      ? {
          width: cartOverlayGrandTotalResolvedWidth,
          minWidth: cartOverlayGrandTotalResolvedWidth,
        }
      : null;
  const isCartOverlayGrandTotalCompact =
    typeof cartOverlayGrandTotalTargetWidth === "number" &&
    typeof cartOverlayGrandTotalAmountWidth === "number" &&
    cartOverlayGrandTotalAmountWidth >
      cartOverlayGrandTotalTargetWidth + 0.5;
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
  const handleCartOverlayGrandTotalAmountLayout = ({
    nativeEvent: {
      layout: { width },
    },
  }) => {
    setCartOverlayGrandTotalAmountWidth((currentWidth) =>
      typeof currentWidth === "number" && Math.abs(currentWidth - width) < 0.5
        ? currentWidth
        : width,
    );
  };
  const handleCartOverlayReceiptBlockLayout = ({
    nativeEvent: {
      layout: { width },
    },
  }) => {
    setCartOverlayReceiptBlockWidth((currentWidth) =>
      typeof currentWidth === "number" && Math.abs(currentWidth - width) < 0.5
        ? currentWidth
        : width,
    );
  };
  const handleCartOverlayContentSizeChange = (_width, height) => {
    setCartOverlayScrollContentHeight((currentHeight) =>
      typeof currentHeight === "number" &&
      Math.abs(currentHeight - height) < 0.5
        ? currentHeight
        : height,
    );
  };
  const handleCartOverlayScroll = ({
    nativeEvent: {
      contentOffset: { y },
    },
  }) => {
    setCartOverlayScrollY((currentY) =>
      typeof currentY === "number" && Math.abs(currentY - y) < 0.5
        ? currentY
        : y,
    );
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
    setIsContactOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
    setIsShopOverlayVisible(true);
    setIsTruckOverlayVisible(true);
  };
  const openProductOverlay = (productName) => {
    const requestedProductName = getRequestedOverlayProductName(productName);

    if (!requestedProductName) {
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

    const requestedOverlayNavIndex = overlayNavProducts.findIndex(
      (overlayProduct) => overlayProduct.name === requestedProductName,
    );

    discardUnconfirmedOverlayProductDraft(activeOverlayProductName);
    markShippingPreviewDestinationVisited("products");
    setOverlayImageOutgoingProductName(null);
    setOverlayImageDirection(-1);
    overlayImageProgress.setValue(1);

    if (requestedOverlayNavIndex >= 0) {
      overlayNavIndicatorProgress.setValue(requestedOverlayNavIndex);
    }

    setActiveOverlayProductName(requestedProductName);
    setIsShopOverlayVisible(true);
    setIsTruckOverlayVisible(true);
    setIsCartOverlayVisible(false);
    setIsContactOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
  };
  const closeTruckOverlay = () => {
    if (isCartOverlayVisible) {
      pruneZeroQuantityCartEntries();
    }

    discardUnconfirmedOverlayProductDraft(activeOverlayProductName);
    setIsCartOverlayVisible(false);
    setIsContactOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
    setIsShopOverlayVisible(false);
    setIsTruckOverlayVisible(false);
  };
  const toggleTruckOverlay = () => {
    if (isTruckOverlayVisible) {
      if (isCartOverlayVisible) {
        pruneZeroQuantityCartEntries();
        setIsCartOverlayVisible(false);
        setIsContactOverlayVisible(false);
        setIsDeliveryStateDropdownOpen(false);
        return;
      }

      closeTruckOverlay();
      return;
    }

    openTruckOverlay();
  };
  const showProductOverlayFromCart = () => {
    pruneZeroQuantityCartEntries();
    markShippingPreviewDestinationVisited("products");
    setIsCartOverlayVisible(false);
    setIsContactOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
  };
  const showCartOverlayFromProducts = () => {
    discardUnconfirmedOverlayProductDraft(activeOverlayProductName);
    markShippingPreviewDestinationVisited("cart");
    setIsCartOverlayVisible(true);
    setIsContactOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
  };
  const showContactOverlayFromCart = () => {
    pruneZeroQuantityCartEntries();
    markShippingPreviewDestinationVisited("contact");
    setIsCartOverlayVisible(false);
    setIsContactOverlayVisible(true);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
  };
  const handleCartOverlayCheckoutPress = () => {
    setHasCartOverlayCheckoutButtonBeenTapped(true);
    showContactOverlayFromCart();
  };
  const showCartOverlayFromContact = () => {
    markShippingPreviewDestinationVisited("cart");
    setIsCartOverlayVisible(true);
    setIsContactOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
  };
  const showDeliveryOverlayFromContact = () => {
    markShippingPreviewDestinationVisited("delivery");
    setIsCartOverlayVisible(false);
    setIsContactOverlayVisible(false);
    setIsDeliveryOverlayVisible(true);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
  };
  const showContactOverlayFromDelivery = () => {
    markShippingPreviewDestinationVisited("contact");
    setIsCartOverlayVisible(false);
    setIsContactOverlayVisible(true);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
  };
  const showPaymentOverlayFromDelivery = () => {
    markShippingPreviewDestinationVisited("payment");
    setIsCartOverlayVisible(false);
    setIsContactOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(true);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
  };
  const showDeliveryOverlayFromPayment = () => {
    markShippingPreviewDestinationVisited("delivery");
    setIsCartOverlayVisible(false);
    setIsContactOverlayVisible(false);
    setIsDeliveryOverlayVisible(true);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
  };
  const showCartOverlayFromPayment = () => {
    markShippingPreviewDestinationVisited("cart");
    setIsContactOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsCartOverlayVisible(true);
    setIsDeliveryStateDropdownOpen(false);
  };
  const showPlaceholderOverlayFromPayment = () => {
    markShippingPreviewDestinationVisited("confirmation");
    setIsCartOverlayVisible(false);
    setIsContactOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(true);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
  };
  const showPaymentOverlayFromPlaceholder = () => {
    markShippingPreviewDestinationVisited("payment");
    setIsCartOverlayVisible(false);
    setIsContactOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(true);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
  };
  const showPaymentOrderConfirmationPrompt = () => {
    setIsPaymentOrderConfirmationVisible(true);
    setIsOrderPlacementConfirmed(false);
  };
  const closePaymentOrderConfirmationPrompt = () => {
    setIsPaymentOrderConfirmationVisible(false);
    setIsOrderPlacementConfirmed(false);
  };
  const showOrderPlacementConfirmation = () => {
    markShippingPreviewDestinationVisited("confirmation");
    setIsCartOverlayVisible(false);
    setIsContactOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(true);
    setIsOrderPlacementConfirmed(true);
    setIsDeliveryStateDropdownOpen(false);
  };
  const handleOrderConfirmationYesPress = async () => {
    if (isStripePaymentInFlight) return;

    if (Platform.OS === "web") {
      showPaymentAlert(
        "Payment unavailable",
        "Stripe payments are available in the mobile app build.",
      );
      return;
    }

    const configurationIssue = getStripeConfigurationIssue();

    if (configurationIssue) {
      showPaymentAlert("Stripe setup needed", configurationIssue);
      return;
    }

    if (selectedPaymentOverlayMethod !== paymentOverlayCardMethod) {
      showPaymentAlert(
        "Payment method unavailable",
        "Use Debit/Credit Card for this Stripe checkout.",
      );
      return;
    }

    if (!stripeCardDetails?.complete) {
      showPaymentAlert(
        "Card details needed",
        "Enter a complete card number, expiration date, and CVV.",
      );
      return;
    }

    if (!arePaymentCardRequiredFieldsComplete) {
      showPaymentAlert(
        "Billing details needed",
        "Finish the name and billing ZIP fields before placing the order.",
      );
      return;
    }

    const orderPayload = buildStripeOrderPayload();

    if (orderPayload.items.length === 0) {
      showPaymentAlert("Cart is empty", "Add an item before placing an order.");
      return;
    }

    setIsStripePaymentInFlight(true);

    try {
      const paymentSheet = await createStripePaymentSheet(orderPayload);
      const confirmResult = await confirmPayment(
        paymentSheet.paymentIntentClientSecret,
        {
          paymentMethodType: "Card",
          paymentMethodData: {
            billingDetails: buildStripeBillingDetails(),
          },
        },
      );

      if (confirmResult.error) {
        throw new Error(
          confirmResult.error.localizedMessage ||
            confirmResult.error.message ||
            "Payment was not completed.",
        );
      }

      if (
        confirmResult.paymentIntent?.status &&
        !["Succeeded", "Processing"].includes(confirmResult.paymentIntent.status)
      ) {
        throw new Error(
          `Payment status is ${confirmResult.paymentIntent.status}. Please try again.`,
        );
      }

      showOrderPlacementConfirmation();
    } catch (error) {
      showPaymentAlert(
        "Payment not completed",
        error?.message || "Please try again.",
      );
    } finally {
      setIsStripePaymentInFlight(false);
    }
  };
  const handleShippingPreviewActionPress = () => {
    if (isCartAddItemsActionVisible) {
      showProductOverlayFromCart();
      return;
    }

    if (isContactDeliveryActionVisible) {
      showDeliveryOverlayFromContact();
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

    if (isPlaceholderActionVisible) {
      showPaymentOverlayFromPlaceholder();
      return;
    }

    toggleTruckOverlay();
  };
  const handleShippingPreviewLeftActionPress = () => {
    if (isCartAddItemsActionVisible) {
      showProductOverlayFromCart();
      return;
    }

    if (isContactDeliveryActionVisible) {
      showCartOverlayFromContact();
      return;
    }

    if (isDeliveryPaymentActionVisible) {
      showContactOverlayFromDelivery();
      return;
    }

    if (isPaymentViewCartActionVisible) {
      showDeliveryOverlayFromPayment();
      return;
    }

    if (isPlaceholderActionVisible) {
      showPaymentOverlayFromPlaceholder();
      return;
    }

    handleShippingPreviewActionPress();
  };
  const handleShippingPreviewRightActionPress = () => {
    if (isProductsActionVisible) {
      showCartOverlayFromProducts();
      return;
    }

    if (isCartAddItemsActionVisible) {
      showContactOverlayFromCart();
      return;
    }

    if (isContactDeliveryActionVisible) {
      showDeliveryOverlayFromContact();
      return;
    }

    if (isDeliveryPaymentActionVisible) {
      showPaymentOverlayFromDelivery();
      return;
    }

    if (isPaymentViewCartActionVisible) {
      showPlaceholderOverlayFromPayment();
      return;
    }

    if (isPlaceholderActionVisible) {
      return;
    }

    handleShippingPreviewActionPress();
  };

  useEffect(() => {
    setIsShopOverlayVisible(isTruckOverlayVisible);

    return () => {
      setIsShopOverlayVisible(false);
    };
  }, [isTruckOverlayVisible, setIsShopOverlayVisible]);

  useEffect(() => {
    if (!isTruckOverlayVisible || isOrderPlacementConfirmed) {
      shippingPreviewActionBandProgress.setValue(
        shippingPreviewActionBandIndex,
      );
      return undefined;
    }

    shippingPreviewActionBandAnimationRef.current?.stop?.();

    const animation = Animated.timing(shippingPreviewActionBandProgress, {
      toValue: shippingPreviewActionBandIndex,
      duration: shippingPreviewActionBandSlideDuration,
      useNativeDriver: true,
    });

    shippingPreviewActionBandAnimationRef.current = animation;
    animation.start(({ finished }) => {
      if (finished) {
        shippingPreviewActionBandAnimationRef.current = null;
      }
    });

    return () => {
      animation.stop();
      if (shippingPreviewActionBandAnimationRef.current === animation) {
        shippingPreviewActionBandAnimationRef.current = null;
      }
    };
  }, [
    isOrderPlacementConfirmed,
    isTruckOverlayVisible,
    shippingPreviewActionBandIndex,
    shippingPreviewActionBandProgress,
  ]);

  useEffect(() => {
    setIsOrderConfirmationOverlayVisible(
      isTruckOverlayVisible &&
        isPlaceholderOverlayVisible &&
        isOrderPlacementConfirmed,
    );

    return () => {
      setIsOrderConfirmationOverlayVisible(false);
    };
  }, [
    isOrderPlacementConfirmed,
    isPlaceholderOverlayVisible,
    isTruckOverlayVisible,
    setIsOrderConfirmationOverlayVisible,
  ]);

  useEffect(() => {
    if (!cartOverlayActionRequest.pending) return;

    discardUnconfirmedOverlayProductDraft(activeOverlayProductName);
    markShippingPreviewDestinationVisited("cart");
    setIsShopOverlayVisible(true);
    setIsTruckOverlayVisible(true);
    setIsContactOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsCartOverlayVisible(true);
    setIsDeliveryStateDropdownOpen(false);
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
    markShippingPreviewDestinationVisited("cart");
    setIsShopOverlayVisible(true);
    setIsTruckOverlayVisible(true);
    setIsContactOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsCartOverlayVisible(true);
    setIsDeliveryStateDropdownOpen(false);
  }, [
    activeOverlayProductName,
    discardUnconfirmedOverlayProductDraft,
    openCart,
    setIsShopOverlayVisible,
  ]);

  useEffect(() => {
    const requestedProductName = getRequestedOverlayProductName(product);
    const openProductRequest = Array.isArray(openProduct)
      ? openProduct[0]
      : openProduct;
    const productRequestKey = openProductRequest || requestedProductName;

    if (
      !requestedProductName ||
      !productRequestKey ||
      handledOpenProductParamRef.current === productRequestKey
    ) {
      return;
    }

    handledOpenProductParamRef.current = productRequestKey;
    openProductOverlay(requestedProductName);
  }, [openProduct, product, openProductOverlay]);

  useEffect(() => {
    if (!isDeliveryOverlayVisible) {
      setIsDeliveryStateDropdownOpen(false);
    }

    if (
      !isPaymentOverlayVisible ||
      selectedPaymentOverlayMethod !== paymentOverlayCardMethod
    ) {
      setIsPaymentIssuerDropdownOpen(false);
    }

    if (
      isContactOverlayVisible ||
      isDeliveryOverlayVisible ||
      isPaymentOverlayVisible
    ) {
      return;
    }

    setActiveDeliveryFieldKey(null);
  }, [
    isContactOverlayVisible,
    isDeliveryOverlayVisible,
    isPaymentOverlayVisible,
    selectedPaymentOverlayMethod,
  ]);

  useEffect(() => {
    if (!isDeliveryStateDropdownOpen) {
      setDeliveryStateDropdownAnchor(null);
      setDeliveryStateDropdownScrollY(0);
      return;
    }

    measureDeliveryStateDropdownAnchor();
  }, [isDeliveryStateDropdownOpen]);

  useEffect(() => {
    if (!openDeliveryTimeDropdownKey) {
      setDeliveryTimeDropdownAnchor(null);
      setDeliveryTimeDropdownScrollY(0);
      return;
    }

    measureDeliveryTimeDropdownAnchor(openDeliveryTimeDropdownKey);
  }, [openDeliveryTimeDropdownKey]);

  useEffect(() => {
    if (!isTruckOverlayVisible || !isDeliveryOverlayVisible) {
      setOpenDeliveryTimeDropdownKey(null);
    }
  }, [isDeliveryOverlayVisible, isTruckOverlayVisible]);

  useEffect(() => {
    if (!isPaymentIssuerDropdownOpen) {
      setPaymentIssuerDropdownAnchor(null);
      return;
    }

    measurePaymentIssuerDropdownAnchor();
  }, [isPaymentIssuerDropdownOpen]);

  useEffect(() => {
    if (Platform.OS !== "android" || !isTruckOverlayVisible) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        closeTruckOverlay();
        return true;
      },
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
        shopStyles.shippingPreviewActionCluster,
        hidden && shopStyles.shippingPreviewReadyButtonHidden,
        frameStyle,
      ]}
    >
      {shouldShowShippingPreviewActionSideBoxes ? (
        <View
          style={[
            shopStyles.shippingPreviewActionSideBoxFrame,
            shopStyles.shippingPreviewActionSideBoxFrameLeft,
            isOrderPlacementConfirmed &&
              shopStyles.shippingPreviewActionSideBoxFrameConfirmed,
            {
              width: shippingPreviewActionLeftSideBoxWidth,
              marginRight: -shippingPreviewActionResolvedSideBoxBleed,
            },
          ]}
        >
          <ButtonShadowPlate
            style={[
              shopStyles.shippingPreviewActionSideBoxShadowPlate,
              shopStyles.shippingPreviewActionSideBoxShadowPlateLeft,
            ]}
          />
          <Pressable
            accessibilityLabel={shippingPreviewLeftActionAccessibilityLabel}
            accessibilityRole="button"
            onPress={handleShippingPreviewLeftActionPress}
            style={[
              shopStyles.shippingPreviewActionSideBox,
              shopStyles.shippingPreviewActionSideBoxLeft,
              isOrderPlacementConfirmed &&
                shopStyles.shippingPreviewActionSideBoxConfirmed,
            ]}
          >
            <View
              style={[
                shopStyles.shippingPreviewSideButtonTriangleBox,
                shopStyles.shippingPreviewSideButtonTriangleBoxBack,
              ]}
            >
              <View
                style={[
                  shopStyles.shippingPreviewSideButtonTriangleLeft,
                  shopStyles.shippingPreviewSideButtonTriangleLeftBack,
                ]}
              />
            </View>
          </Pressable>
        </View>
      ) : null}
      <View
        style={[
          shopStyles.shippingPreviewReadyButtonShadowFrame,
          isTruckOverlayVisible &&
            !isCartAddItemsActionVisible &&
            shopStyles.shippingPreviewReadyButtonShadowFrameBack,
          isCartAddItemsActionVisible &&
            shopStyles.shippingPreviewAddItemsButtonShadowFrame,
          {
            width: shippingPreviewActionCenterButtonWidth,
            height: shippingPreviewReadyButtonHeight,
          },
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
            isCartAddItemsActionVisible &&
              shopStyles.shippingPreviewAddItemsButton,
            {
              paddingHorizontal:
                shippingPreviewActionCenterButtonHorizontalInset,
            },
          ]}
        >
          {isTruckOverlayVisible ? (
            <>
              {[
                shopStyles.shippingPreviewActionButtonBandTop,
                shopStyles.shippingPreviewActionButtonBandBottom,
              ].map((positionStyle, bandIndex) => (
                <View
                  key={bandIndex === 0 ? "top" : "bottom"}
                  pointerEvents="none"
                  style={[
                    shopStyles.shippingPreviewActionButtonBand,
                    positionStyle,
                    isOrderPlacementConfirmed &&
                      shopStyles.shippingPreviewActionButtonBandConfirmed,
                  ]}
                >
                  {!isOrderPlacementConfirmed ? (
                    <>
                      <View
                        style={shopStyles.shippingPreviewActionButtonBandTrack}
                      >
                        {Array.from({
                          length: shippingPreviewActionBandPortionCount,
                        }).map((_, portionIndex) => (
                          <View
                            key={portionIndex}
                            style={
                              shopStyles.shippingPreviewActionButtonBandSegment
                            }
                          />
                        ))}
                      </View>
                      <Animated.View
                        style={[
                          shopStyles.shippingPreviewActionButtonBandActiveSegment,
                          {
                            width: shippingPreviewActionBandSegmentWidth,
                            transform: [
                              {
                                translateX:
                                  shippingPreviewActionBandTranslateX,
                              },
                            ],
                          },
                        ]}
                      />
                    </>
                  ) : null}
                </View>
              ))}
            </>
          ) : null}
          <View style={shopStyles.shippingPreviewActionButtonContent}>
            <Text
              adjustsFontSizeToFit
              allowFontScaling={false}
              minimumFontScale={0.68}
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
          </View>
        </Pressable>
      </View>
      {shouldShowShippingPreviewActionSideBoxes ? (
        <View
          style={[
            shopStyles.shippingPreviewActionSideBoxFrame,
            shopStyles.shippingPreviewActionSideBoxFrameRight,
            shouldDimShippingPreviewRightAction &&
              shopStyles.shippingPreviewActionSideBoxFrameDimmed,
            isOrderPlacementConfirmed &&
              shopStyles.shippingPreviewActionSideBoxFrameConfirmed,
            {
              width: shippingPreviewActionRightSideBoxWidth,
              marginLeft: -shippingPreviewActionResolvedSideBoxBleed,
            },
          ]}
        >
          <ButtonShadowPlate
            style={[
              shopStyles.shippingPreviewActionSideBoxShadowPlate,
              shopStyles.shippingPreviewActionSideBoxShadowPlateRight,
              shouldDimShippingPreviewRightAction &&
                shopStyles.shippingPreviewActionSideBoxShadowPlateDimmed,
            ]}
          />
          <Pressable
            accessibilityLabel={
              isProductsActionVisible
                ? "View cart"
                : isCartAddItemsActionVisible
                  ? "Contact"
                  : isContactDeliveryActionVisible
                    ? "Delivery"
                    : isDeliveryPaymentActionVisible
                      ? "Payment"
                      : isPaymentViewCartActionVisible
                        ? "Next"
                        : shippingPreviewActionAccessibilityLabel
            }
            accessibilityRole="button"
            disabled={shouldDimShippingPreviewRightAction}
            onPress={
              shouldDimShippingPreviewRightAction
                ? undefined
                : handleShippingPreviewRightActionPress
            }
            style={[
              shopStyles.shippingPreviewActionSideBox,
              shopStyles.shippingPreviewActionSideBoxRight,
              shouldDimShippingPreviewRightAction &&
                shopStyles.shippingPreviewActionSideBoxDimmed,
              isOrderPlacementConfirmed &&
                shopStyles.shippingPreviewActionSideBoxConfirmed,
            ]}
          >
            <View
              style={[
                shopStyles.shippingPreviewSideButtonTriangleBox,
                shopStyles.shippingPreviewSideButtonTriangleBoxBack,
              ]}
            >
              <View
                style={[
                  shopStyles.shippingPreviewSideButtonTriangleRight,
                  shouldDimShippingPreviewRightAction &&
                    shopStyles.shippingPreviewSideButtonTriangleRightDimmed,
                ]}
              />
            </View>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  const renderOverlayFormField = (field) => {
    const isStateField = field.type === "state";
    const isPaymentIssuerField = field.type === "paymentIssuer";
    const isDeliveryTimeDropdownField = Boolean(
      deliveryTimeDropdownOptionsByType[field.type],
    );
    const isDropdownField =
      isStateField || isPaymentIssuerField || isDeliveryTimeDropdownField;
    const isDeliveryFieldDisabled = Boolean(field.disabled);
    const shouldForceDeliveryFieldSurface = Boolean(field.forceSurface);
    const deliveryFieldValue = isStateField
      ? selectedDeliveryState
      : isPaymentIssuerField
        ? selectedPaymentCardIssuer
        : deliveryFieldValues[field.key] || "";
    const hasSelectedDropdownOption =
      (isStateField && deliveryStateOptions.includes(selectedDeliveryState)) ||
      (isPaymentIssuerField &&
        paymentIssuerOptions.includes(selectedPaymentCardIssuer)) ||
      (isDeliveryTimeDropdownField &&
        (deliveryTimeDropdownOptionsByType[field.type] || []).includes(
          deliveryFieldValue,
        ));
    const isDeliveryFieldActive = activeDeliveryFieldKey === field.key;
    const fieldPromptLabel = getOverlayFieldPromptLabel(field.label);
    const shouldShowFieldPrompt =
      Boolean(fieldPromptLabel) &&
      !(field.hidePromptWhenForceSurface && shouldForceDeliveryFieldSurface) &&
      !isDeliveryFieldActive &&
      (isDropdownField
        ? !hasSelectedDropdownOption
        : deliveryFieldValue.trim().length === 0);
    const shouldUseStateFieldSurface =
      !isDeliveryFieldDisabled &&
      (shouldForceDeliveryFieldSurface ||
        isDeliveryFieldActive ||
        (isDropdownField
          ? hasSelectedDropdownOption
          : deliveryFieldValue.trim().length > 0));
    const DeliveryFieldContainer = isDropdownField ? View : Pressable;
    const deliveryFieldContainerProps = isDropdownField
      ? {}
      : {
          android_disableSound: true,
          delayPressIn: 0,
          disabled: isDeliveryFieldDisabled,
          haptic: false,
          hitSlop: 0,
          onPress: isDeliveryFieldDisabled
            ? undefined
            : () => focusDeliveryTextField(field.key),
          onPressIn: () =>
            handleDeliveryTextFieldPressIn(
              field.key,
              isDeliveryFieldDisabled,
            ),
          pressRetentionOffset: deliveryFieldPressRetentionOffset,
        };

    if (isPaymentIssuerField) {
      return (
        <View
          key={field.key}
          style={[
            shopStyles.paymentOverlayIssuerFieldFrame,
            field.flex ? { flex: field.flex } : null,
          ]}
        >
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={shopStyles.paymentOverlayIssuerLabel}
          >
            {field.label}
          </Text>
          <Pressable
            accessibilityLabel="Issuer"
            accessibilityRole="button"
            accessibilityState={{
              expanded: isPaymentIssuerDropdownOpen,
            }}
            ref={paymentIssuerButtonRef}
            onLayout={() => {
              if (isPaymentIssuerDropdownOpen) {
                measurePaymentIssuerDropdownAnchor();
              }
            }}
            android_disableSound
            hitSlop={0}
            onPress={togglePaymentIssuerDropdown}
            onPressIn={() => handleDeliveryDropdownFieldPressIn(field.key)}
            pressRetentionOffset={deliveryFieldPressRetentionOffset}
            style={[
              shopStyles.paymentOverlayIssuerDropdownBox,
              shouldUseStateFieldSurface &&
                shopStyles.deliveryOverlayFieldStateSurface,
            ]}
          >
            <Text
              adjustsFontSizeToFit
              allowFontScaling={false}
              minimumFontScale={0.72}
              numberOfLines={1}
              style={shopStyles.deliveryOverlayStateButtonText}
            >
              {deliveryFieldValue}
            </Text>
            <DeliveryStateDropdownTriangle />
          </Pressable>
        </View>
      );
    }

    return (
      <DeliveryFieldContainer
        key={field.key}
        {...deliveryFieldContainerProps}
        style={[
          shopStyles.deliveryOverlayField,
          shouldUseStateFieldSurface &&
            shopStyles.deliveryOverlayFieldStateSurface,
          field.width ? { flex: 0, width: field.width } : null,
          field.flex ? { flex: field.flex } : null,
          shouldUseStateFieldSurface && shopStyles.deliveryOverlayStateField,
          isDeliveryFieldDisabled && shopStyles.deliveryOverlayFieldDisabled,
        ]}
      >
        {shouldShowFieldPrompt ? (
          <View
            pointerEvents="none"
            style={shopStyles.deliveryOverlayFieldPrompt}
          >
            <Text
              adjustsFontSizeToFit
              allowFontScaling={false}
              minimumFontScale={0.72}
              numberOfLines={1}
              style={[
                shopStyles.deliveryOverlayFieldPromptText,
                isDeliveryFieldDisabled &&
                  shopStyles.deliveryOverlayFieldPromptTextDisabled,
              ]}
            >
              {fieldPromptLabel}
            </Text>
          </View>
        ) : null}
        {isDropdownField ? (
          <>
            <Pressable
              accessibilityLabel={
                isStateField
                  ? "State"
                  : isPaymentIssuerField
                    ? "Issuer"
                    : fieldPromptLabel || field.label
              }
              accessibilityRole="button"
              accessibilityState={{
                expanded: isStateField
                  ? isDeliveryStateDropdownOpen
                  : isPaymentIssuerField
                    ? isPaymentIssuerDropdownOpen
                    : openDeliveryTimeDropdownKey === field.key,
              }}
              ref={
                isStateField
                  ? deliveryStateButtonRef
                  : isPaymentIssuerField
                    ? paymentIssuerButtonRef
                    : (buttonNode) => {
                        if (buttonNode) {
                          deliveryTimeButtonRefs.current[field.key] =
                            buttonNode;
                          return;
                        }

                        delete deliveryTimeButtonRefs.current[field.key];
                      }
              }
              onLayout={() => {
                if (isStateField && isDeliveryStateDropdownOpen) {
                  measureDeliveryStateDropdownAnchor();
                }

                if (isPaymentIssuerField && isPaymentIssuerDropdownOpen) {
                  measurePaymentIssuerDropdownAnchor();
                }

                if (
                  isDeliveryTimeDropdownField &&
                  openDeliveryTimeDropdownKey === field.key
                ) {
                  measureDeliveryTimeDropdownAnchor(field.key);
                }
              }}
              android_disableSound
              hitSlop={0}
              onPress={
                isStateField
                  ? toggleDeliveryStateDropdown
                  : isPaymentIssuerField
                    ? togglePaymentIssuerDropdown
                    : () => toggleDeliveryTimeDropdown(field.key)
              }
              onPressIn={() => handleDeliveryDropdownFieldPressIn(field.key)}
              pressRetentionOffset={deliveryFieldPressRetentionOffset}
              style={shopStyles.deliveryOverlayStateButton}
            >
              <Text
                adjustsFontSizeToFit
                allowFontScaling={false}
                minimumFontScale={0.72}
                numberOfLines={1}
                style={shopStyles.deliveryOverlayStateButtonText}
              >
                {deliveryFieldValue}
              </Text>
              <DeliveryStateDropdownTriangle />
            </Pressable>
          </>
        ) : (
          <TextInput
            adjustsFontSizeToFit
            allowFontScaling={false}
            autoCapitalize={field.autoCapitalize || "none"}
            autoComplete={field.autoComplete || "off"}
            autoCorrect={false}
            caretHidden={false}
            editable={!isDeliveryFieldDisabled}
            keyboardType={field.keyboardType || "default"}
            maxLength={field.maxLength}
            minimumFontScale={0.62}
            multiline={false}
            onChangeText={(text) =>
              setDeliveryFieldValues((currentValues) => ({
                ...currentValues,
                [field.key]: text,
              }))
            }
            onFocus={() => {
              if (!isDeliveryFieldDisabled) {
                triggerDeliveryTextFieldTick();
                activateDeliveryTextField(field.key);
              }
            }}
            onBlur={() => deactivateDeliveryTextField(field.key)}
            pointerEvents="none"
            ref={(inputNode) => {
              if (inputNode) {
                deliveryFieldInputRefs.current[field.key] = inputNode;
                return;
              }

              delete deliveryFieldInputRefs.current[field.key];
            }}
            selectionColor="#111111"
            scrollEnabled={false}
            secureTextEntry={Boolean(field.secureTextEntry)}
            style={[
              shopStyles.deliveryOverlayFieldInput,
              shouldUseStateFieldSurface &&
                shopStyles.deliveryOverlayFieldInputStateSurface,
              isDeliveryFieldDisabled &&
                shopStyles.deliveryOverlayFieldInputDisabled,
            ]}
            underlineColorAndroid="transparent"
            value={deliveryFieldValues[field.key] || ""}
          />
        )}
      </DeliveryFieldContainer>
    );
  };

  const renderOverlayFieldSpacer = (field) => (
    <View
      key={field.key}
      pointerEvents="none"
      style={[
        shopStyles.deliveryOverlayFieldSpacer,
        field.flex ? { flex: field.flex } : null,
      ]}
    />
  );

  const renderDeliveryTimeWheels = (field) => (
    <View
      key={field.key}
      style={[
        shopStyles.deliveryTimeWheelGroup,
        field.flex ? { flex: field.flex } : null,
      ]}
    >
      {deliveryTimeWheelFields.map(({ accessibilityLabel, key, options }) => {
        const selectedValue =
          deliveryFieldValues[key] ||
          defaultDeliveryFieldValues[key] ||
          options[0];
        const selectedIndex = Math.max(0, options.indexOf(selectedValue));
        const selectedLoopedIndex = getDeliveryTimeWheelLoopedIndex(
          options,
          selectedIndex,
        );
        const visibleLoopedIndex =
          deliveryTimeWheelVisibleIndexes[key] ?? selectedLoopedIndex;
        const loopedOptions = Array.from(
          { length: deliveryTimeWheelLoopCount * options.length },
          (_, loopedIndex) => ({
            loopedIndex,
            option: options[loopedIndex % options.length],
          }),
        );

        return (
          <View key={key} style={shopStyles.deliveryTimeWheelStack}>
            <View
              pointerEvents="none"
              style={shopStyles.deliveryTimeWheelTriangle}
            >
              <PiccolaQuantityTriangle direction="up" />
            </View>
            <View style={shopStyles.deliveryTimeWheelColumn}>
              <View
                pointerEvents="none"
                style={shopStyles.deliveryTimeWheelCenterBand}
              />
              <FlatList
                contentContainerStyle={shopStyles.deliveryTimeWheelScrollContent}
                data={loopedOptions}
                decelerationRate="fast"
                directionalLockEnabled
                disableIntervalMomentum
                getItemLayout={(_, index) => ({
                  index,
                  length: deliveryTimeWheelScrollStepHeight,
                  offset: deliveryTimeWheelScrollStepHeight * index,
                })}
                initialNumToRender={18}
                initialScrollIndex={selectedLoopedIndex}
                keyboardShouldPersistTaps="handled"
                keyExtractor={({ loopedIndex }) => `${key}-${loopedIndex}`}
                maxToRenderPerBatch={18}
                nestedScrollEnabled
                onMomentumScrollEnd={({ nativeEvent }) =>
                  settleDeliveryTimeWheel(
                    key,
                    options,
                    Math.max(0, nativeEvent.contentOffset?.y || 0),
                  )
                }
                onScrollBeginDrag={() => {
                  deliveryTimeWheelIsDraggingRef.current[key] = true;
                  deliveryTimeWheelHapticIndexesRef.current[key] =
                    visibleLoopedIndex;
                  setActiveDeliveryFieldKey(key);
                  setIsDeliveryStateDropdownOpen(false);
                  setOpenDeliveryTimeDropdownKey(null);
                  setIsPaymentIssuerDropdownOpen(false);
                }}
                onScrollEndDrag={({ nativeEvent }) => {
                  const velocityY = Math.abs(nativeEvent.velocity?.y || 0);

                  if (velocityY > 0.05) {
                    return;
                  }

                  settleDeliveryTimeWheel(
                    key,
                    options,
                    Math.max(0, nativeEvent.contentOffset?.y || 0),
                  );
                }}
                onScrollToIndexFailed={({ index }) => {
                  deliveryTimeWheelScrollRefs.current[key]?.scrollToOffset?.({
                    animated: false,
                    offset: index * deliveryTimeWheelScrollStepHeight,
                  });
                }}
                onScroll={({ nativeEvent }) =>
                  updateDeliveryTimeWheelVisibleIndex(
                    key,
                    Math.max(0, nativeEvent.contentOffset?.y || 0),
                  )
                }
                overScrollMode="never"
                ref={(scrollNode) => {
                  if (scrollNode) {
                    deliveryTimeWheelScrollRefs.current[key] = scrollNode;
                    return;
                  }

                  delete deliveryTimeWheelScrollRefs.current[key];
                }}
                renderItem={({ item }) => {
                  const { loopedIndex, option } = item;
                  const isSelectedOption = loopedIndex === visibleLoopedIndex;

                  return (
                    <Pressable
                      accessibilityLabel={`${accessibilityLabel} ${option}`}
                      accessibilityRole="button"
                      key={option}
                      onPress={() =>
                        setDeliveryTimeWheelValue(key, option, options)
                      }
                      style={shopStyles.deliveryTimeWheelOption}
                    >
                      <View
                        pointerEvents="none"
                        style={shopStyles.deliveryTimeWheelOptionContent}
                      >
                        <Text
                          adjustsFontSizeToFit
                          allowFontScaling={false}
                          minimumFontScale={0.72}
                          numberOfLines={1}
                          style={[
                            shopStyles.deliveryTimeWheelOptionText,
                            isSelectedOption &&
                              shopStyles.deliveryTimeWheelOptionTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                      </View>
                    </Pressable>
                  );
                }}
                showsVerticalScrollIndicator={false}
                snapToInterval={deliveryTimeWheelScrollStepHeight}
                scrollEventThrottle={16}
                style={shopStyles.deliveryTimeWheelScroll}
                windowSize={7}
              />
            </View>
            <View
              pointerEvents="none"
              style={shopStyles.deliveryTimeWheelTriangle}
            >
              <PiccolaQuantityTriangle direction="down" />
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderContactInfoBlock = (contactInfoBlock) => {
    const contactInfoRows = contactInfoBlock.fields.reduce(
      (rows, field, fieldIndex) => {
        if (fieldIndex % 2 === 0) {
          rows.push([]);
        }

        rows[rows.length - 1].push(field);
        return rows;
      },
      [],
    );

    return (
      <View
        key={contactInfoBlock.key}
        style={shopStyles.deliveryOverlayContactBlock}
      >
        <View style={shopStyles.deliveryOverlayContactFieldsColumn}>
          {contactInfoRows.map((contactInfoRow) => (
            <View
              key={contactInfoRow.map((field) => field.key).join("-")}
              style={shopStyles.deliveryOverlayContactFieldsRow}
            >
              {contactInfoRow.map((field) => (
                <View
                  key={field.key}
                  style={shopStyles.deliveryOverlayContactFieldStack}
                >
                  <View style={shopStyles.deliveryOverlayContactFieldRow}>
                    {renderOverlayFormField(field)}
                  </View>
                </View>
              ))}
            </View>
          ))}
          <View style={shopStyles.deliveryOverlayContactFieldsRow}>
            <View
              style={[
                shopStyles.deliveryOverlayContactFieldStack,
                shopStyles.deliveryOverlayGiftControlStack,
              ]}
            >
              <View style={shopStyles.deliveryOverlayPhoneCheckboxRow}>
                <Pressable
                  accessibilityLabel="Gift"
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked: isDeliveryPhoneCheckboxChecked,
                  }}
                  hitSlop={6}
                  onPress={toggleDeliveryGiftCheckbox}
                  style={({ pressed }) => [
                    shopStyles.deliveryOverlayPhoneCheckbox,
                    isDeliveryPhoneCheckboxChecked &&
                      shopStyles.deliveryOverlayPhoneCheckboxChecked,
                    pressed && shopStyles.deliveryOverlayPhoneCheckboxPressed,
                  ]}
                >
                  {isDeliveryPhoneCheckboxChecked ? (
                    <Svg height="76%" viewBox="0 0 24 24" width="76%">
                      <Path
                        d="M20 6 9 17l-5-5"
                        fill="none"
                        stroke="#111111"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                      />
                    </Svg>
                  ) : null}
                </Pressable>
                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  style={shopStyles.deliveryOverlayPhoneCheckboxLabel}
                >
                  Gift
                </Text>
              </View>
            </View>
            <View style={shopStyles.deliveryOverlayContactFieldStack}>
              <View style={shopStyles.deliveryOverlayContactFieldRow}>
                {renderOverlayFormField({
                  disabled: !isDeliveryPhoneCheckboxChecked,
                  forceSurface: isDeliveryPhoneCheckboxChecked,
                  hidePromptWhenForceSurface: true,
                  key: "recipientName",
                  label: "Recipient name:",
                })}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderOverlayFormRows = (rows) =>
    rows.map((row, rowIndex) => {
      const sectionHeading = row.find(
        (field) => field.type === "sectionHeading",
      );

      if (sectionHeading) {
        return (
          <Text
            allowFontScaling={false}
            key={sectionHeading.key}
            numberOfLines={1}
            style={shopStyles.deliveryOverlayHeading}
          >
            {sectionHeading.label}
          </Text>
        );
      }

      const rowFields = row.filter((field) => field.type !== "rowGapAfter");
      const shouldDoubleRowGapAfter = row.some(
        (field) => field.type === "rowGapAfter",
      );
      const rowHasStateField = rowFields.some(
        (field) =>
          field.type === "state" ||
          field.fields?.some((groupField) => groupField.type === "state"),
      );
      const shouldShowRowDeliveryMessage =
        rowHasStateField && shouldShowFloridaOnlyDeliveryMessage;
      const contactInfoBlock = rowFields.find(
        (field) => field.type === "contactInfoBlock",
      );

      if (contactInfoBlock) {
        return renderContactInfoBlock(contactInfoBlock);
      }

      return (
        <View key={`delivery-row-block-${rowIndex}`}>
          <View
            style={[
              shopStyles.deliveryOverlayRow,
              shouldDoubleRowGapAfter &&
                !shouldShowRowDeliveryMessage &&
                shopStyles.deliveryOverlayRowDoubleGapAfter,
              shouldShowRowDeliveryMessage &&
                shopStyles.deliveryOverlayRowWithStateMessage,
            ]}
          >
            {rowFields.map((field) => {
              if (field.type === "spacer") {
                return renderOverlayFieldSpacer(field);
              }

              if (field.type === "deliveryTimeWheels") {
                return renderDeliveryTimeWheels(field);
              }

              if (field.type === "fieldGroup") {
                return (
                  <View
                    key={field.key}
                    style={[
                      shopStyles.deliveryOverlayFieldGroup,
                      field.flex ? { flex: field.flex } : null,
                    ]}
                  >
                    {field.fields.map((groupField) => {
                      if (groupField.type === "spacer") {
                        return renderOverlayFieldSpacer(groupField);
                      }

                      return renderOverlayFormField(groupField);
                    })}
                  </View>
                );
              }

              return renderOverlayFormField(field);
            })}
          </View>
          {shouldShowRowDeliveryMessage ? (
            <View
              pointerEvents="none"
              style={shopStyles.deliveryOverlayStateMessageRow}
            >
              <View style={shopStyles.deliveryOverlayStateMessageSpacer} />
              <Text
                adjustsFontSizeToFit
                allowFontScaling={false}
                minimumFontScale={0.72}
                numberOfLines={2}
                style={shopStyles.deliveryOverlayStateMessageText}
              >
                Only Florida deliveries available at this time
              </Text>
            </View>
          ) : null}
        </View>
      );
    });

  const renderOrderConfirmationContent = ({ onNoPress }) => (
    <>
      <View
        pointerEvents="none"
        style={[
          shopStyles.confirmationOverlayOrderPopupLayer,
          isOrderPlacementConfirmed
            ? shopStyles.confirmationOverlayOrderPopupLayerFull
            : shopStyles.confirmationOverlayOrderPopupLayerPrompt,
        ]}
      >
        <View
          style={[
            shopStyles.confirmationOverlayOrderPopup,
            isOrderPlacementConfirmed
              ? shopStyles.confirmationOverlayOrderPopupFull
              : shopStyles.confirmationOverlayOrderPopupPrompt,
          ]}
        >
          {isOrderPlacementConfirmed ? (
            <>
              <Text
                allowFontScaling={false}
                style={[
                  shopStyles.confirmationOverlayOrderPopupText,
                  shopStyles.confirmationOverlayOrderPopupTextFull,
                ]}
              >
                Your order has been placed!
              </Text>
              <Image
                resizeMode="contain"
                source={require("../bargain_square_whitefill.png")}
                style={shopStyles.confirmationOverlayOrderImage}
              />
              <Text
                allowFontScaling={false}
                style={shopStyles.confirmationOverlayOrderPopupBrand}
              >
                Alla Vostra
              </Text>
            </>
          ) : (
            <Text
              allowFontScaling={false}
              style={shopStyles.confirmationOverlayOrderPopupText}
            >
              {"Are you sure you want to place an order with\nAlla vostra?"}
            </Text>
          )}
        </View>
      </View>
      {!isOrderPlacementConfirmed ? (
        <>
          <Pressable
            accessibilityLabel="Yes"
            accessibilityRole="button"
            accessibilityState={{ disabled: isStripePaymentInFlight }}
            disabled={isStripePaymentInFlight}
            onPress={
              isStripePaymentInFlight ? undefined : handleOrderConfirmationYesPress
            }
            style={[
              shopStyles.confirmationOverlayButton,
              shopStyles.confirmationOverlayYesButton,
              isStripePaymentInFlight &&
                shopStyles.paymentOverlayCheckoutButtonDimmed,
            ]}
          >
            {!isStripePaymentInFlight ? (
              <OptionOneButtonGradient variant="green" />
            ) : null}
            <Text style={shopStyles.cartOverlayCheckoutButtonText}>
              {isStripePaymentInFlight ? "Processing" : "Yes"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel="No"
            accessibilityRole="button"
            onPress={onNoPress}
            style={[
              shopStyles.confirmationOverlayButton,
              shopStyles.confirmationOverlayNoButton,
            ]}
          >
            <OptionOneButtonGradient variant="red" />
            <Text style={shopStyles.cartOverlayCheckoutButtonText}>No</Text>
          </Pressable>
        </>
      ) : null}
    </>
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
                              layout.y,
                            );
                            updateShippingPreviewMeasurement(
                              "sofloHeight",
                              layout.height,
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
                      marginLeft:
                        shippingPreviewActionClusterStickyCartAlignedLeft,
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
        <View
          style={[shopStyles.truckOverlayTouchFrame, shopHeaderOffsetStyle]}
        >
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
                  !isContactOverlayVisible &&
                  !isDeliveryOverlayVisible &&
                  !isPaymentOverlayVisible &&
                  !isPlaceholderOverlayVisible
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
                      isContactOverlayVisible ||
                      isDeliveryOverlayVisible ||
                      isPaymentOverlayVisible ||
                      isPlaceholderOverlayVisible) &&
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
                              {`${product.name} x ${productQuantity}`}
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
                              {formatCartPriceTotal(
                                productPrice,
                                productQuantity,
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
                          <View
                            style={[
                              shopStyles.cartOverlayBottomSummaryRow,
                              shopStyles.cartOverlayBottomFeeTaxRow,
                            ]}
                          >
                            <Text
                              allowFontScaling={false}
                              numberOfLines={1}
                              style={[
                                shopStyles.cartOverlayBottomProductName,
                                shopStyles.cartOverlayBottomFeeTaxLabel,
                              ]}
                            >
                              Delivery
                            </Text>
                            <Text
                              allowFontScaling={false}
                              numberOfLines={1}
                              style={[
                                shopStyles.cartOverlayBottomTotal,
                                shopStyles.cartOverlayBottomFeeTaxTotal,
                              ]}
                            >
                              {formatCartCurrency(cartOverlayDeliveryFee)}
                            </Text>
                          </View>
                          <View
                            pointerEvents="none"
                            style={shopStyles.cartOverlayBottomFeeTaxSpacerRow}
                          />
                          <View
                            style={[
                              shopStyles.cartOverlayBottomSummaryRow,
                              shopStyles.cartOverlayBottomFeeTaxRow,
                            ]}
                          >
                            <Text
                              allowFontScaling={false}
                              numberOfLines={1}
                              style={[
                                shopStyles.cartOverlayBottomProductName,
                                shopStyles.cartOverlayBottomFeeTaxLabel,
                              ]}
                            >
                              Taxes
                            </Text>
                            <Text
                              allowFontScaling={false}
                              numberOfLines={1}
                              style={[
                                shopStyles.cartOverlayBottomTotal,
                                shopStyles.cartOverlayBottomFeeTaxTotal,
                              ]}
                            >
                              {formatCartCurrency(cartOverlayTaxes)}
                            </Text>
                          </View>
                        </>
                      ) : null}
                    </View>
                    <View
                      pointerEvents="none"
                      onLayout={handleCartOverlayReceiptBlockLayout}
                      style={shopStyles.cartOverlayBottomGrandTotalAnchor}
                    >
                      <Text
                        allowFontScaling={false}
                        numberOfLines={1}
                        onLayout={handleCartOverlayGrandTotalAmountLayout}
                        style={[
                          shopStyles.cartOverlayBottomGrandTotalAmount,
                          shopStyles.cartOverlayBottomGrandTotalAmountMeasure,
                        ]}
                      >
                        {formatCartCurrency(cartOverlayGrandTotal)}
                      </Text>
                      <View
                        style={[
                          shopStyles.cartOverlayBottomGrandTotal,
                          cartOverlayGrandTotalWidthStyle,
                        ]}
                      >
                        <View style={shopStyles.cartOverlayBottomGrandTotalStack}>
                          <View
                            style={[
                              shopStyles.cartOverlayBottomGrandTotalLabel,
                              cartOverlayGrandTotalWidthStyle,
                            ]}
                          >
                            {cartOverlayGrandTotalLetters.map((letter, index) => (
                              <Text
                                allowFontScaling={false}
                                key={`${letter}-${index}`}
                                style={[
                                  shopStyles.cartOverlayBottomGrandTotalLabelLetter,
                                  isCartOverlayGrandTotalCompact &&
                                    shopStyles.cartOverlayBottomGrandTotalLabelLetterCompact,
                                ]}
                              >
                                {letter}
                              </Text>
                            ))}
                          </View>
                          <Text
                            adjustsFontSizeToFit
                            numberOfLines={1}
                            style={[
                              shopStyles.cartOverlayBottomGrandTotalAmount,
                              cartOverlayGrandTotalWidthStyle,
                              isCartOverlayGrandTotalCompact &&
                                shopStyles.cartOverlayBottomGrandTotalAmountCompact,
                            ]}
                          >
                            {formatCartCurrency(cartOverlayGrandTotal)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ) : null}
                {isCartOverlayVisible ? (
                  <>
                    <ScrollView
                      automaticallyAdjustContentInsets={false}
                      automaticallyAdjustKeyboardInsets={false}
                      contentContainerStyle={[
                        shopStyles.cartOverlayContentList,
                        overlayCartProducts.length === 0 && {
                          minHeight: cartOverlayCreamVisibleHeight,
                          justifyContent: "center",
                        },
                      ]}
                      contentInsetAdjustmentBehavior="never"
                      keyboardShouldPersistTaps="handled"
                      nestedScrollEnabled
                      onContentSizeChange={
                        handleCartOverlayContentSizeChange
                      }
                      onScroll={handleCartOverlayScroll}
                      scrollEventThrottle={16}
                      showsVerticalScrollIndicator={false}
                      style={[
                        shopStyles.cartOverlayContent,
                        {
                          top: cartOverlayProductTop,
                          right: cartOverlayCreamContentRightInset,
                          bottom:
                            overlayOrangeBandHeight +
                            cartOverlayBottomBannerHeight,
                          left: truckOverlayInnerHorizontalPadding,
                        },
                      ]}
                    >
                      {overlayCartProducts.length === 0 ? (
                        <View
                          style={[
                            shopStyles.cartOverlayEmptyMessageFrame,
                            {
                              minHeight: cartOverlayCreamVisibleHeight,
                            },
                          ]}
                        >
                          <Text
                            allowFontScaling={false}
                            style={[
                              shopStyles.cartOverlayEmptyMessage,
                              shopStyles.cartOverlayEmptyMessageFirstLine,
                            ]}
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
                            const productCartPriceText = `(${productPrice})`;
                            const productCartServingCount =
                              getProductServingCount(product.description);
                            const productEntryTopInset =
                              cartOverlayCreamVerticalInset * 2;
                            const productEntryDividerTextGap = Math.max(
                              0,
                              productEntryTopInset -
                                cartOverlayProductTopDividerBottomInset,
                            );
                            const productEntryVerticalMarginExtension =
                              productEntryDividerTextGap * 0.5;
                            const productEntryOuterAssetGapIncrease =
                              productEntryDividerTextGap * 0.5;
                            const productEntryContentTop =
                              productEntryVerticalMarginExtension +
                              productEntryOuterAssetGapIncrease;
                            const productEntryVerticalSpace =
                              cartOverlayProductVisualHeight;
                            const productEntryCenterY =
                              productEntryVerticalSpace * 0.4;
                            const productEntryMiniHorizontalDividerTop =
                              productEntryContentTop +
                              productEntryTopInset +
                              productEntryCenterY;
                            const productEntryTopVerticalDividerHeight =
                              productEntryCenterY * 0.5;
                            const productEntryTopDividerInnerEdge =
                              cartOverlayProductTopDividerBottomInset;
                            const productEntryTopVerticalDividerSpace =
                              Math.max(
                                0,
                                productEntryMiniHorizontalDividerTop -
                                  productEntryTopDividerInnerEdge,
                              );
                            const productEntryTopVerticalDividerTop =
                              productEntryTopDividerInnerEdge +
                              Math.max(
                                0,
                                (productEntryTopVerticalDividerSpace -
                                  productEntryTopVerticalDividerHeight) /
                                  2,
                              );
                            const productEntryBottomVerticalDividerHeight =
                              productEntryTopVerticalDividerHeight;
                            const productEntryLeftDividerSpace = Math.max(
                              0,
                              cartOverlayProductVerticalDividerLeft -
                                cartOverlayProductAssetGridLeft,
                            );
                            const productEntryLeftHorizontalDividerWidth =
                              productEntryTopVerticalDividerHeight;
                            const productEntryLeftHorizontalDividerLeft =
                              cartOverlayProductAssetGridLeft +
                              (productEntryLeftDividerSpace -
                                productEntryLeftHorizontalDividerWidth) /
                                2;
                            const productEntryRightDividerSpace = Math.max(
                              0,
                              cartOverlayProductAssetGridRight -
                                cartOverlayProductVerticalDividerLeft,
                            );
                            const productEntryRightHorizontalDividerWidth =
                              productEntryTopVerticalDividerHeight;
                            const productEntryRightHorizontalDividerLeft =
                              cartOverlayProductVerticalDividerLeft +
                              (productEntryRightDividerSpace -
                                productEntryRightHorizontalDividerWidth) /
                                2;
                            const productEntryTopCellHeight =
                              productEntryCenterY;
                            const productEntryTopCellInnerGap = Math.max(
                              0,
                              (productEntryTopCellHeight -
                                cartOverlayProductNameLineHeight -
                                cartOverlayProductPriceLineHeight) /
                                2,
                            );
                            const productEntryBottomCellTop =
                              productEntryContentTop +
                              productEntryTopInset +
                              productEntryCenterY +
                              productEntryTopCellInnerGap;
                            const productEntryBottomCellHeight =
                              productEntryVerticalSpace - productEntryCenterY;
                            const productEntryControlsHeight = Math.max(
                              cartOverlayQuantityStackHeight,
                              cartOverlayRemoveButtonHeight,
                            );
                            const productEntryControlsBottomGap = Math.max(
                              0,
                              (productEntryBottomCellHeight -
                                productEntryControlsHeight) /
                                2,
                            );
                            const productEntryBottomInset = Math.max(
                              0,
                              productEntryDividerTextGap -
                                cartOverlayProductTopDividerTopInset -
                                productEntryControlsBottomGap,
                            );
                            const productEntryTotalHeight =
                              (productEntryVerticalMarginExtension +
                                productEntryOuterAssetGapIncrease) *
                                2 +
                              productEntryTopInset +
                              productEntryVerticalSpace +
                              productEntryTopCellInnerGap +
                              productEntryBottomInset;
                            const productEntryBottomDividerInnerEdge =
                              productEntryTotalHeight +
                              cartOverlayProductTopDividerTopInset;
                            const productEntryBottomVerticalDividerSpace =
                              Math.max(
                                0,
                                productEntryBottomDividerInnerEdge -
                                  productEntryMiniHorizontalDividerTop,
                              );
                            const productEntryBottomVerticalDividerTop =
                              productEntryMiniHorizontalDividerTop +
                              Math.max(
                                0,
                                (productEntryBottomVerticalDividerSpace -
                                  productEntryBottomVerticalDividerHeight) /
                                  2,
                              );
                            return (
                              <View
                                key={product.name}
                                style={shopStyles.cartOverlayProductColumnGroup}
                              >
                                <View
                                  style={[
                                    shopStyles.cartOverlayProductEntry,
                                    {
                                      height: productEntryTotalHeight,
                                      paddingHorizontal: 0,
                                      paddingTop: 0,
                                      paddingBottom: 0,
                                    },
                                  ]}
                                >
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductDivider,
                                      shopStyles.cartOverlayProductTopDivider,
                                      {
                                        left:
                                          cartOverlayProductDividerLeftInset,
                                        right:
                                          cartOverlayProductDividerRightInset,
                                        top:
                                          cartOverlayProductTopDividerTopInset,
                                      },
                                    ]}
                                  />
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductDivider,
                                      shopStyles.cartOverlayProductTopDivider,
                                      {
                                        left:
                                          cartOverlayProductDividerLeftInset,
                                        right:
                                          cartOverlayProductDividerRightInset,
                                        top:
                                          cartOverlayProductSecondTopDividerTopInset,
                                      },
                                    ]}
                                  />
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductVerticalDivider,
                                      {
                                        left:
                                          cartOverlayProductVerticalDividerLeft,
                                        top:
                                          productEntryTopVerticalDividerTop,
                                        height:
                                          productEntryTopVerticalDividerHeight,
                                      },
                                    ]}
                                  />
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductVerticalDivider,
                                      {
                                        left:
                                          cartOverlayProductVerticalDividerLeft,
                                        top:
                                          productEntryBottomVerticalDividerTop,
                                        height:
                                          productEntryBottomVerticalDividerHeight,
                                      },
                                    ]}
                                  />
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductHorizontalDividerSegment,
                                      {
                                        left:
                                          productEntryLeftHorizontalDividerLeft,
                                        top:
                                          productEntryMiniHorizontalDividerTop,
                                        width:
                                          productEntryLeftHorizontalDividerWidth,
                                      },
                                    ]}
                                  />
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductHorizontalDividerSegment,
                                      {
                                        left:
                                          productEntryRightHorizontalDividerLeft,
                                        top:
                                          productEntryMiniHorizontalDividerTop,
                                        width:
                                          productEntryRightHorizontalDividerWidth,
                                      },
                                    ]}
                                  />
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductGridCell,
                                      shopStyles.cartOverlayProductNamePriceCell,
                                      {
                                        left:
                                          cartOverlayProductAssetGridLeft,
                                        top:
                                          productEntryContentTop +
                                          productEntryTopInset,
                                        width:
                                          cartOverlayProductAssetLeftCellWidth,
                                        height: productEntryTopCellHeight,
                                        paddingHorizontal:
                                          cartOverlayProductGridCellPadding,
                                        paddingTop: 0,
                                        paddingBottom:
                                          productEntryTopCellInnerGap,
                                      },
                                    ]}
                                  >
                                    <Text
                                      allowFontScaling={false}
                                      numberOfLines={1}
                                      style={[
                                        shopStyles.cartOverlayProductName,
                                      ]}
                                    >
                                      {product.name}
                                    </Text>
                                    <Text
                                      allowFontScaling={false}
                                      numberOfLines={1}
                                      style={[
                                        shopStyles.cartOverlayProductName,
                                        shopStyles.cartOverlayProductPrice,
                                      ]}
                                    >
                                      {productCartPriceText}
                                    </Text>
                                  </View>
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductGridCell,
                                      shopStyles.cartOverlayProductNamePriceCell,
                                      {
                                        left:
                                          cartOverlayProductAssetRightCellLeft,
                                        top:
                                          productEntryContentTop +
                                          productEntryTopInset,
                                        width:
                                          cartOverlayProductAssetRightCellWidth,
                                        height: productEntryTopCellHeight,
                                        paddingHorizontal:
                                          cartOverlayProductGridCellPadding,
                                        paddingTop: 0,
                                        paddingBottom:
                                          productEntryTopCellInnerGap,
                                      },
                                    ]}
                                  >
                                    {productCartServingCount ? (
                                      <>
                                        <Text
                                          allowFontScaling={false}
                                          numberOfLines={1}
                                          style={[
                                            shopStyles.cartOverlayProductName,
                                          ]}
                                        >
                                          Serves
                                        </Text>
                                        <Text
                                          allowFontScaling={false}
                                          numberOfLines={1}
                                          style={[
                                            shopStyles.cartOverlayProductName,
                                            shopStyles.cartOverlayProductServingCount,
                                          ]}
                                        >
                                          {productCartServingCount}
                                        </Text>
                                      </>
                                    ) : null}
                                  </View>
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductGridCell,
                                      {
                                        left:
                                          cartOverlayProductAssetGridLeft,
                                        top: productEntryBottomCellTop,
                                        width:
                                          cartOverlayProductAssetLeftCellWidth,
                                        height: productEntryBottomCellHeight,
                                        paddingHorizontal:
                                          cartOverlayProductGridCellPadding,
                                      },
                                    ]}
                                  >
                                      <Image
                                        source={product.image}
                                        style={[
                                          shopStyles.cartOverlayProductImage,
                                          productQuantity === 0 &&
                                            shopStyles.cartOverlayProductImageDimmed,
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
                                  <View
                                    style={[
                                      shopStyles.cartOverlayProductGridCell,
                                      {
                                        left:
                                          cartOverlayProductAssetRightCellLeft,
                                        top: productEntryBottomCellTop,
                                        width:
                                          cartOverlayProductAssetRightCellWidth,
                                        height: productEntryBottomCellHeight,
                                        paddingHorizontal: 0,
                                      },
                                    ]}
                                  >
                                    <View
                                      style={[
                                        shopStyles.cartOverlayControlsGroup,
                                        shopStyles.cartOverlayControlsEvenGroup,
                                      ]}
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
                                                Math.min(9, current + 1),
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
                                              height:
                                                cartOverlayQuantityBoxHeight,
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
                                                Math.max(0, current - 1),
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
                                            () => 0,
                                          );
                                          updateOverlayProductConfirmation(
                                            product.name,
                                            false,
                                          );
                                        }}
                                        style={[
                                          shopStyles.piccolaOverlayBuyButton,
                                          shopStyles.cartOverlayRemoveButton,
                                          {
                                            width: cartOverlayRemoveButtonWidth,
                                            height:
                                              cartOverlayRemoveButtonHeight,
                                          },
                                        ]}
                                      >
                                        <OptionOneButtonGradient variant="removeRed" />
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
                    {shouldRenderCartOverlayCreamScrollbar ? (
                      <View
                        pointerEvents="none"
                        style={[
                          shopStyles.cartOverlayCreamScrollbar,
                          !isCartOverlayCreamScrollbarActive &&
                            shopStyles.cartOverlayCreamScrollbarDimmed,
                          {
                            top: cartOverlayProductTop,
                            right:
                              truckOverlayInnerHorizontalPadding +
                              cartOverlayCreamScrollbarRightGap,
                            bottom:
                              overlayOrangeBandHeight +
                              cartOverlayBottomBannerHeight,
                            width: cartOverlayCreamScrollbarWidth,
                          },
                        ]}
                      >
                        <View
                          style={[
                            shopStyles.cartOverlayCreamScrollbarThumb,
                            !isCartOverlayCreamScrollbarActive &&
                              shopStyles.cartOverlayCreamScrollbarThumbDimmed,
                            {
                              height: cartOverlayCreamScrollbarThumbHeight,
                              transform: [
                                {
                                  translateY:
                                    cartOverlayCreamScrollbarThumbTop,
                                },
                              ],
                            },
                          ]}
                        />
                      </View>
                    ) : null}
                    <Pressable
                      accessibilityLabel="Add items"
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: isCartOverlayAddItemsButtonDimmed,
                      }}
                      disabled={isCartOverlayAddItemsButtonDimmed}
                      onPress={
                        isCartOverlayAddItemsButtonDimmed
                          ? undefined
                          : handleShippingPreviewLeftActionPress
                      }
                      style={[
                        shopStyles.cartOverlayCheckoutButton,
                        shopStyles.cartOverlayAddItemsButton,
                        cartAddItemsActionButtonStyle,
                        isCartOverlayAddItemsButtonDimmed &&
                          shopStyles.cartOverlayAddItemsButtonDimmed,
                      ]}
                    >
                      {!isCartOverlayAddItemsButtonDimmed ? (
                        <OptionOneButtonGradient variant="green" />
                      ) : null}
                      <Text style={shopStyles.cartOverlayCheckoutButtonText}>
                        Add items
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityLabel="Checkout"
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: isCartOverlayCheckoutButtonDimmed,
                      }}
                      disabled={isCartOverlayCheckoutButtonDimmed}
                      onPress={
                        isCartOverlayCheckoutButtonDimmed
                          ? undefined
                          : handleCartOverlayCheckoutPress
                      }
                      style={[
                        shopStyles.cartOverlayCheckoutButton,
                        cartCheckoutActionButtonBottomAlignedStyle,
                        isCartOverlayCheckoutButtonDimmed &&
                          shopStyles.paymentOverlayCheckoutButtonDimmed,
                      ]}
                    >
                      <Text
                        style={[
                          shopStyles.cartOverlayCheckoutButtonText,
                          isCartOverlayCheckoutButtonDimmed &&
                            shopStyles.cartOverlayCheckoutButtonTextDimmed,
                        ]}
                      >
                        Checkout
                      </Text>
                    </Pressable>
                  </>
                ) : isContactOverlayVisible ? (
                  <View style={shopStyles.deliveryOverlayContent}>
                    {renderOverlayFormRows(contactOverlayRows)}
                    <Pressable
                      accessibilityLabel="Continue"
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: shouldDimContactProgressionButton,
                      }}
                      disabled={shouldDimContactProgressionButton}
                      onPress={
                        shouldDimContactProgressionButton
                          ? undefined
                          : showDeliveryOverlayFromContact
                      }
                      style={[
                        shopStyles.paymentOverlayCheckoutButton,
                        overlayContentActionButtonBottomAlignedStyle,
                        shouldDimContactProgressionButton &&
                          shopStyles.paymentOverlayCheckoutButtonDimmed,
                      ]}
                    >
                      <Text
                        style={[
                          shopStyles.cartOverlayCheckoutButtonText,
                          shouldDimContactProgressionButton &&
                            shopStyles.cartOverlayCheckoutButtonTextDimmed,
                        ]}
                      >
                        Continue
                      </Text>
                    </Pressable>
                  </View>
                ) : isDeliveryOverlayVisible ? (
                  <View style={shopStyles.deliveryOverlayContent}>
                    {deliveryOverlayRows.map((row, rowIndex) => {
                      const sectionHeading = row.find(
                        (field) => field.type === "sectionHeading",
                      );

                      if (sectionHeading) {
                        return (
                          <Text
                            allowFontScaling={false}
                            key={sectionHeading.key}
                            numberOfLines={1}
                            style={shopStyles.deliveryOverlayHeading}
                          >
                            {sectionHeading.label}
                          </Text>
                        );
                      }

                      const rowFields = row.filter(
                        (field) => field.type !== "rowGapAfter",
                      );
                      const shouldDoubleRowGapAfter = row.some(
                        (field) => field.type === "rowGapAfter",
                      );
                      const rowHasStateField = rowFields.some(
                        (field) =>
                          field.type === "state" ||
                          field.fields?.some(
                            (groupField) => groupField.type === "state",
                          ),
                      );
                      const shouldShowRowDeliveryMessage =
                        rowHasStateField && shouldShowFloridaOnlyDeliveryMessage;
                      const renderDeliveryField = (field) => {
                        const isStateField = field.type === "state";
                        const isDeliveryTimeDropdownField = Boolean(
                          deliveryTimeDropdownOptionsByType[field.type],
                        );
                        const isDropdownField =
                          isStateField || isDeliveryTimeDropdownField;
                        const isDeliveryFieldDisabled = Boolean(
                          field.disabled,
                        );
                        const shouldForceDeliveryFieldSurface = Boolean(
                          field.forceSurface,
                        );
                        const deliveryFieldValue = isStateField
                          ? selectedDeliveryState
                          : deliveryFieldValues[field.key] || "";
                        const hasSelectedDeliveryStateOption =
                          isStateField &&
                          deliveryStateOptions.includes(selectedDeliveryState);
                        const hasSelectedDeliveryTimeOption =
                          isDeliveryTimeDropdownField &&
                          (
                            deliveryTimeDropdownOptionsByType[field.type] || []
                          ).includes(deliveryFieldValue);
                        const isDeliveryFieldActive =
                          activeDeliveryFieldKey === field.key;
                        const fieldPromptLabel = getOverlayFieldPromptLabel(
                          field.label,
                        );
                        const shouldShowFieldPrompt =
                          Boolean(fieldPromptLabel) &&
                          !(
                            field.hidePromptWhenForceSurface &&
                            shouldForceDeliveryFieldSurface
                          ) &&
                          !isDeliveryFieldActive &&
                          (isDropdownField
                            ? !(
                                hasSelectedDeliveryStateOption ||
                                hasSelectedDeliveryTimeOption
                              )
                            : deliveryFieldValue.trim().length === 0);
                        const shouldUseStateFieldSurface =
                          !isDeliveryFieldDisabled &&
                          (shouldForceDeliveryFieldSurface ||
                            isDeliveryFieldActive ||
                            (isDropdownField
                              ? hasSelectedDeliveryStateOption ||
                                hasSelectedDeliveryTimeOption
                              : deliveryFieldValue.trim().length > 0));
                        const DeliveryFieldContainer = isDropdownField
                          ? View
                          : Pressable;
                        const deliveryFieldContainerProps = isDropdownField
                          ? {}
                          : {
                              android_disableSound: true,
                              delayPressIn: 0,
                              disabled: isDeliveryFieldDisabled,
                              haptic: false,
                              hitSlop: 0,
                              onPress: isDeliveryFieldDisabled
                                ? undefined
                                : () => focusDeliveryTextField(field.key),
                              onPressIn: () =>
                                handleDeliveryTextFieldPressIn(
                                  field.key,
                                  isDeliveryFieldDisabled,
                                ),
                              pressRetentionOffset:
                                deliveryFieldPressRetentionOffset,
                            };

                        return (
                          <DeliveryFieldContainer
                            key={field.key}
                            {...deliveryFieldContainerProps}
                            style={[
                              shopStyles.deliveryOverlayField,
                              shouldUseStateFieldSurface &&
                                shopStyles.deliveryOverlayFieldStateSurface,
                              field.width ? { flex: 0, width: field.width } : null,
                              field.flex ? { flex: field.flex } : null,
                              shouldUseStateFieldSurface &&
                                shopStyles.deliveryOverlayStateField,
                              isDeliveryFieldDisabled &&
                                shopStyles.deliveryOverlayFieldDisabled,
                            ]}
                          >
                            {shouldShowFieldPrompt ? (
                              <View
                                pointerEvents="none"
                                style={shopStyles.deliveryOverlayFieldPrompt}
                              >
                                <Text
                                  adjustsFontSizeToFit
                                  allowFontScaling={false}
                                  minimumFontScale={0.72}
                                  numberOfLines={1}
                                  style={[
                                    shopStyles.deliveryOverlayFieldPromptText,
                                    isDeliveryFieldDisabled &&
                                      shopStyles.deliveryOverlayFieldPromptTextDisabled,
                                  ]}
                                >
                                  {fieldPromptLabel}
                                </Text>
                              </View>
                            ) : null}
                            {isDropdownField ? (
                              <>
                                <Pressable
                                  accessibilityLabel={
                                    isStateField
                                      ? "State"
                                      : fieldPromptLabel || field.label
                                  }
                                  accessibilityRole="button"
                                  accessibilityState={{
                                    expanded: isStateField
                                      ? isDeliveryStateDropdownOpen
                                      : openDeliveryTimeDropdownKey ===
                                        field.key,
                                  }}
                                  ref={
                                    isStateField
                                      ? deliveryStateButtonRef
                                      : (buttonNode) => {
                                          if (buttonNode) {
                                            deliveryTimeButtonRefs.current[
                                              field.key
                                            ] = buttonNode;
                                            return;
                                          }

                                          delete deliveryTimeButtonRefs.current[
                                            field.key
                                          ];
                                        }
                                  }
                                  onLayout={() => {
                                    if (
                                      isStateField &&
                                      isDeliveryStateDropdownOpen
                                    ) {
                                      measureDeliveryStateDropdownAnchor();
                                    }

                                    if (
                                      isDeliveryTimeDropdownField &&
                                      openDeliveryTimeDropdownKey === field.key
                                    ) {
                                      measureDeliveryTimeDropdownAnchor(
                                        field.key,
                                      );
                                    }
                                  }}
                                  android_disableSound
                                  hitSlop={0}
                                  onPress={
                                    isStateField
                                      ? toggleDeliveryStateDropdown
                                      : () =>
                                          toggleDeliveryTimeDropdown(field.key)
                                  }
                                  onPressIn={() =>
                                    handleDeliveryDropdownFieldPressIn(
                                      field.key,
                                    )
                                  }
                                  pressRetentionOffset={
                                    deliveryFieldPressRetentionOffset
                                  }
                                  style={shopStyles.deliveryOverlayStateButton}
                                >
                                  <Text
                                    adjustsFontSizeToFit
                                    allowFontScaling={false}
                                    minimumFontScale={0.72}
                                    numberOfLines={1}
                                    style={
                                      shopStyles.deliveryOverlayStateButtonText
                                    }
                                  >
                                    {deliveryFieldValue}
                                  </Text>
                                  <DeliveryStateDropdownTriangle />
                                </Pressable>
                              </>
                            ) : (
                              <TextInput
                                adjustsFontSizeToFit
                                allowFontScaling={false}
                                autoCorrect={false}
                                caretHidden={false}
                                editable={!isDeliveryFieldDisabled}
                                keyboardType={field.keyboardType || "default"}
                                minimumFontScale={0.62}
                                multiline={false}
                                onChangeText={(text) =>
                                  setDeliveryFieldValues((currentValues) => ({
                                    ...currentValues,
                                    [field.key]: text,
                                  }))
                                }
                                onFocus={() => {
                                  if (!isDeliveryFieldDisabled) {
                                    triggerDeliveryTextFieldTick();
                                    activateDeliveryTextField(field.key);
                                  }
                                }}
                                onBlur={() =>
                                  deactivateDeliveryTextField(field.key)
                                }
                                pointerEvents="none"
                                ref={(inputNode) => {
                                  if (inputNode) {
                                    deliveryFieldInputRefs.current[field.key] =
                                      inputNode;
                                    return;
                                  }

                                  delete deliveryFieldInputRefs.current[
                                    field.key
                                  ];
                                }}
                                selectionColor="#111111"
                                scrollEnabled={false}
                                style={[
                                  shopStyles.deliveryOverlayFieldInput,
                                  shouldUseStateFieldSurface &&
                                    shopStyles.deliveryOverlayFieldInputStateSurface,
                                  isDeliveryFieldDisabled &&
                                    shopStyles.deliveryOverlayFieldInputDisabled,
                                ]}
                                underlineColorAndroid="transparent"
                                value={deliveryFieldValues[field.key] || ""}
                              />
                            )}
                          </DeliveryFieldContainer>
                        );
                      };

                      const contactInfoBlock = rowFields.find(
                        (field) => field.type === "contactInfoBlock",
                      );

                      if (contactInfoBlock) {
                        const contactInfoRows = contactInfoBlock.fields.reduce(
                          (rows, field, fieldIndex) => {
                            if (fieldIndex % 2 === 0) {
                              rows.push([]);
                            }

                            rows[rows.length - 1].push(field);
                            return rows;
                          },
                          [],
                        );

                        return (
                          <View
                            key={contactInfoBlock.key}
                            style={shopStyles.deliveryOverlayContactBlock}
                          >
                            <View
                              style={
                                shopStyles.deliveryOverlayContactFieldsColumn
                              }
                            >
                              {contactInfoRows.map((contactInfoRow) => (
                                <View
                                  key={contactInfoRow
                                    .map((field) => field.key)
                                    .join("-")}
                                  style={
                                    shopStyles.deliveryOverlayContactFieldsRow
                                  }
                                >
                                  {contactInfoRow.map((field) => {
                                    return (
                                      <View
                                        key={field.key}
                                        style={
                                          shopStyles.deliveryOverlayContactFieldStack
                                        }
                                      >
                                        <View
                                          style={
                                            shopStyles.deliveryOverlayContactFieldRow
                                          }
                                        >
                                          {renderDeliveryField(field)}
                                        </View>
                                      </View>
                                    );
                                  })}
                                </View>
                              ))}
                              <View
                                style={
                                  shopStyles.deliveryOverlayContactFieldsRow
                                }
                              >
                                <View
                                  style={[
                                    shopStyles.deliveryOverlayContactFieldStack,
                                    shopStyles.deliveryOverlayGiftControlStack,
                                  ]}
                                >
                                  <View
                                    style={
                                      shopStyles.deliveryOverlayPhoneCheckboxRow
                                    }
                                  >
                                    <Pressable
                                      accessibilityLabel="Gift"
                                      accessibilityRole="checkbox"
                                      accessibilityState={{
                                        checked: isDeliveryPhoneCheckboxChecked,
                                      }}
                                      hitSlop={6}
                                      onPress={toggleDeliveryGiftCheckbox}
                                      style={({ pressed }) => [
                                        shopStyles.deliveryOverlayPhoneCheckbox,
                                        isDeliveryPhoneCheckboxChecked &&
                                          shopStyles.deliveryOverlayPhoneCheckboxChecked,
                                        pressed &&
                                          shopStyles.deliveryOverlayPhoneCheckboxPressed,
                                      ]}
                                    >
                                      {isDeliveryPhoneCheckboxChecked ? (
                                        <Svg
                                          height="76%"
                                          viewBox="0 0 24 24"
                                          width="76%"
                                        >
                                          <Path
                                            d="M20 6 9 17l-5-5"
                                            fill="none"
                                            stroke="#111111"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="3"
                                          />
                                        </Svg>
                                      ) : null}
                                    </Pressable>
                                    <Text
                                      allowFontScaling={false}
                                      numberOfLines={1}
                                      style={
                                        shopStyles.deliveryOverlayPhoneCheckboxLabel
                                      }
                                    >
                                      Gift
                                    </Text>
                                  </View>
                                </View>
                                <View
                                  style={
                                    shopStyles.deliveryOverlayContactFieldStack
                                  }
                                >
                                  <View
                                    style={
                                      shopStyles.deliveryOverlayContactFieldRow
                                    }
                                  >
                                    {renderDeliveryField({
                                      disabled:
                                        !isDeliveryPhoneCheckboxChecked,
                                      forceSurface:
                                        isDeliveryPhoneCheckboxChecked,
                                      hidePromptWhenForceSurface: true,
                                      key: "recipientName",
                                      label: "Recipient name:",
                                    })}
                                  </View>
                                </View>
                              </View>
                            </View>
                          </View>
                        );
                      }

                      return (
                        <View key={`delivery-row-block-${rowIndex}`}>
                          <View
                            style={[
                              shopStyles.deliveryOverlayRow,
                              shouldDoubleRowGapAfter &&
                                !shouldShowRowDeliveryMessage &&
                                shopStyles.deliveryOverlayRowDoubleGapAfter,
                              shouldShowRowDeliveryMessage &&
                                shopStyles.deliveryOverlayRowWithStateMessage,
                            ]}
                          >
                            {rowFields.map((field) => {
                              if (field.type === "spacer") {
                                return (
                                  <View
                                    key={field.key}
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.deliveryOverlayFieldSpacer,
                                      field.flex ? { flex: field.flex } : null,
                                    ]}
                                  />
                                );
                              }

                              if (field.type === "deliveryTimeWheels") {
                                return renderDeliveryTimeWheels(field);
                              }

                              if (field.type === "fieldGroup") {
                                return (
                                  <View
                                    key={field.key}
                                    style={[
                                      shopStyles.deliveryOverlayFieldGroup,
                                      field.flex ? { flex: field.flex } : null,
                                    ]}
                                  >
                                    {field.fields.map((groupField) => {
                                      if (groupField.type === "spacer") {
                                        return (
                                          <View
                                            key={groupField.key}
                                            pointerEvents="none"
                                            style={[
                                              shopStyles.deliveryOverlayFieldSpacer,
                                              groupField.flex
                                                ? { flex: groupField.flex }
                                                : null,
                                            ]}
                                          />
                                        );
                                      }

                                      return renderDeliveryField(groupField);
                                    })}
                                  </View>
                                );
                              }

                              return renderDeliveryField(field);
                            })}
                        </View>
                        {shouldShowRowDeliveryMessage ? (
                          <View
                            pointerEvents="none"
                            style={shopStyles.deliveryOverlayStateMessageRow}
                          >
                            <View
                              style={
                                shopStyles.deliveryOverlayStateMessageSpacer
                              }
                            />
                            <Text
                              adjustsFontSizeToFit
                              allowFontScaling={false}
                              minimumFontScale={0.72}
                              numberOfLines={2}
                              style={shopStyles.deliveryOverlayStateMessageText}
                            >
                              Only Florida deliveries available at this time
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                    <Pressable
                      accessibilityLabel="Continue"
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: shouldDimDeliveryProgressionButton,
                      }}
                      disabled={shouldDimDeliveryProgressionButton}
                      onPress={
                        shouldDimDeliveryProgressionButton
                          ? undefined
                          : showPaymentOverlayFromDelivery
                      }
                      style={[
                        shopStyles.paymentOverlayCheckoutButton,
                        overlayContentActionButtonBottomAlignedStyle,
                        shouldDimDeliveryProgressionButton &&
                          shopStyles.paymentOverlayCheckoutButtonDimmed,
                      ]}
                    >
                      <Text
                        style={[
                          shopStyles.cartOverlayCheckoutButtonText,
                          shouldDimDeliveryProgressionButton &&
                            shopStyles.cartOverlayCheckoutButtonTextDimmed,
                        ]}
                      >
                        Continue
                      </Text>
                    </Pressable>
                  </View>
                ) : isPaymentOverlayVisible ? (
                  <View style={shopStyles.paymentOverlayContent}>
                    <ScrollView
                      automaticallyAdjustContentInsets={false}
                      automaticallyAdjustKeyboardInsets={false}
                      contentContainerStyle={[
                        shopStyles.paymentOverlayScrollContent,
                        {
                          paddingBottom:
                            cartOverlayCheckoutButtonHeight +
                            truckOverlayInnerHorizontalPadding * 3,
                        },
                      ]}
                      contentInsetAdjustmentBehavior="never"
                      keyboardShouldPersistTaps="handled"
                      nestedScrollEnabled
                      showsVerticalScrollIndicator
                      style={shopStyles.paymentOverlayScroll}
                    >
                      <Text
                        allowFontScaling={false}
                        numberOfLines={1}
                        style={shopStyles.paymentOverlaySectionHeading}
                      >
                        Payment Method:
                      </Text>
                      <View style={shopStyles.paymentOverlayMethodList}>
                        <View style={shopStyles.paymentOverlayWalletMethodRow}>
                          {paymentOverlayWalletMethods.map((method) => (
                            <Pressable
                              accessibilityLabel={method}
                              accessibilityRole="button"
                              accessibilityState={{
                                selected:
                                  selectedPaymentOverlayMethod === method,
                              }}
                              key={method}
                              onPress={() => {
                                setSelectedPaymentOverlayMethod(method);
                                setActiveDeliveryFieldKey(null);
                              }}
                              style={[
                                shopStyles.paymentOverlayWalletMethodButton,
                                paymentOverlayWalletButtonStyle,
                              ]}
                            >
                              <Image
                                resizeMode="contain"
                                source={paymentOverlayWalletMethodIcons[method]}
                                style={[
                                  shopStyles.paymentOverlayWalletMethodImage,
                                  paymentOverlayWalletMethodImageStyles[method],
                                ]}
                              />
                            </Pressable>
                          ))}
                        </View>
                        <Pressable
                          accessibilityLabel={paymentOverlayCardMethod}
                          accessibilityRole="button"
                          accessibilityState={{
                            selected:
                              selectedPaymentOverlayMethod ===
                              paymentOverlayCardMethod,
                          }}
                          onPress={() =>
                            setSelectedPaymentOverlayMethod(
                              paymentOverlayCardMethod,
                            )
                          }
                          style={shopStyles.paymentOverlayMethodButton}
                        >
                          <Text
                            allowFontScaling={false}
                            numberOfLines={1}
                            style={shopStyles.paymentOverlayMethodButtonText}
                          >
                            {paymentOverlayCardMethod}
                          </Text>
                        </Pressable>
                      </View>
                      {selectedPaymentOverlayMethod ===
                      paymentOverlayCardMethod ? (
                        <View style={shopStyles.paymentOverlayCardForm}>
                          {renderOverlayFormRows(
                            paymentOverlayResolvedCardRows,
                          )}
                          <View style={shopStyles.paymentOverlayStripeCardBlock}>
                            <View
                              onTouchStart={() => triggerShopInteractionTick()}
                              style={shopStyles.paymentOverlayStripeCardFormFrame}
                            >
                              <CardForm
                                accessibilityLabel="Card details"
                                cardStyle={paymentOverlayStripeCardInputStyle}
                                defaultValues={{
                                  countryCode: "US",
                                }}
                                onFormComplete={handleStripeCardFormComplete}
                                placeholders={{
                                  cvc: "CVV",
                                  expiration: "Expiration",
                                  number: "Card number",
                                }}
                                postalCodeEnabled={false}
                                style={shopStyles.paymentOverlayStripeCardForm}
                              />
                            </View>
                            <View
                              style={shopStyles.paymentOverlayCardIssuerReadoutRow}
                            >
                              <Text
                                allowFontScaling={false}
                                numberOfLines={1}
                                style={
                                  shopStyles.paymentOverlayCardIssuerReadoutLabel
                                }
                              >
                                Issuer
                              </Text>
                              <View
                                style={
                                  shopStyles.paymentOverlayCardIssuerReadoutBox
                                }
                              >
                                <Text
                                  adjustsFontSizeToFit
                                  allowFontScaling={false}
                                  minimumFontScale={0.72}
                                  numberOfLines={1}
                                  style={
                                    shopStyles.paymentOverlayCardIssuerReadoutText
                                  }
                                >
                                  {paymentCardBrandLabel}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <View
                            style={shopStyles.paymentOverlayBillingCheckboxRow}
                          >
                            <Pressable
                              accessibilityLabel="Billing address matches delivery address"
                              accessibilityRole="checkbox"
                              accessibilityState={{
                                checked: isPaymentBillingAddressMatched,
                              }}
                              hitSlop={6}
                              onPress={togglePaymentBillingAddressMatched}
                              style={({ pressed }) => [
                                shopStyles.deliveryOverlayPhoneCheckbox,
                                isPaymentBillingAddressMatched &&
                                  shopStyles.deliveryOverlayPhoneCheckboxChecked,
                                pressed &&
                                  shopStyles.deliveryOverlayPhoneCheckboxPressed,
                              ]}
                            >
                              {isPaymentBillingAddressMatched ? (
                                <Svg
                                  height="76%"
                                  viewBox="0 0 24 24"
                                  width="76%"
                                >
                                  <Path
                                    d="M20 6 9 17l-5-5"
                                    fill="none"
                                    stroke="#111111"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                  />
                                </Svg>
                              ) : null}
                            </Pressable>
                            <Text
                              allowFontScaling={false}
                              numberOfLines={2}
                              style={shopStyles.paymentOverlayBillingCheckboxLabel}
                            >
                              Billing address matches delivery address
                            </Text>
                          </View>
                        </View>
                      ) : null}
                    </ScrollView>
                    {isPaymentOrderConfirmationVisible ? (
                      renderOrderConfirmationContent({
                        onNoPress: closePaymentOrderConfirmationPrompt,
                      })
                    ) : (
                      <Pressable
                        accessibilityLabel="Place order"
                        accessibilityRole="button"
                        accessibilityState={{
                          disabled: shouldDimPaymentOrderButton,
                        }}
                        disabled={shouldDimPaymentOrderButton}
                        onPress={
                          shouldDimPaymentOrderButton
                            ? undefined
                            : showPaymentOrderConfirmationPrompt
                        }
                        style={[
                          shopStyles.paymentOverlayCheckoutButton,
                          overlayContentActionButtonBottomAlignedStyle,
                          shouldDimPaymentOrderButton &&
                            shopStyles.paymentOverlayCheckoutButtonDimmed,
                        ]}
                      >
                        <Text
                          style={[
                            shopStyles.cartOverlayCheckoutButtonText,
                            shouldDimPaymentOrderButton &&
                              shopStyles.cartOverlayCheckoutButtonTextDimmed,
                          ]}
                        >
                          Place order
                        </Text>
                      </Pressable>
                    )}
                  </View>
                ) : isPlaceholderOverlayVisible ? (
                  <View style={shopStyles.placeholderOverlayContent}>
                    {renderOrderConfirmationContent({
                      onNoPress: showPaymentOverlayFromPlaceholder,
                    })}
                  </View>
                ) : (
                  <>
                    <View
                      onLayout={({ nativeEvent: { layout } }) => {
                        if (Math.abs(overlayNavBarWidth - layout.width) < 0.5) {
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
                                    overlayImageStageWidth - layout.width,
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
                                          translateX:
                                            overlayImageOutgoingProduct
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
                                  layout.height,
                                )
                              }
                              style={shopStyles.piccolaOverlayDescription}
                            >
                              {renderOverlayDescription(
                                activeOverlayProduct.description,
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
                                    current > 0 ? current : 1,
                                  );
                                  updateActiveOverlayConfirmation(true);
                                }}
                                style={[
                                  shopStyles.piccolaOverlayBuyButton,
                                  showOverlayAddedState &&
                                    shopStyles.piccolaOverlayBuyButtonTapped,
                                ]}
                              >
                                {!showOverlayAddedState ? (
                                  <OptionOneButtonGradient variant="green" />
                                ) : null}
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
                                  style={shopStyles.piccolaOverlayQuantityFrame}
                                >
                                  {showOverlayQuantityCheckConfirmed ? (
                                    <Pressable
                                      accessibilityLabel={`Confirm ${activeOverlayProduct.name}`}
                                      accessibilityRole="button"
                                      hitSlop={8}
                                      onPress={() =>
                                        updateActiveOverlayConfirmation(
                                          (current) => !current,
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
                                      <PiccolaQuantityActionIcon confirmed />
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
                                        Math.min(9, current + 1),
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
                                        Math.max(0, current - 1),
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

      {isTruckOverlayVisible &&
      isDeliveryOverlayVisible &&
      isDeliveryStateDropdownOpen &&
      deliveryStateDropdownAnchor ? (
        <View
          pointerEvents="box-none"
          style={shopStyles.deliveryOverlayStateDropdownLayer}
        >
          <Pressable
            accessibilityLabel="Close state options"
            accessibilityRole="button"
            onPress={dismissDeliveryStateDropdownToDefault}
            style={shopStyles.deliveryOverlayStateDropdownDismissArea}
          />
          <View
            style={[
              shopStyles.deliveryOverlayStateDropdown,
              {
                height: deliveryStateDropdownHeight,
                left: deliveryStateDropdownAnchor.x,
                top: deliveryStateDropdownTop,
                width: deliveryStateDropdownAnchor.width,
              },
            ]}
          >
            <ScrollView
              directionalLockEnabled
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              onScroll={({ nativeEvent }) =>
                setDeliveryStateDropdownScrollY(
                  Math.max(0, nativeEvent.contentOffset?.y || 0),
                )
              }
              overScrollMode="always"
              persistentScrollbar
              scrollEventThrottle={16}
              scrollEnabled
              showsVerticalScrollIndicator
              style={shopStyles.deliveryOverlayStateDropdownScroll}
            >
              {deliveryStateOptions.map((option, optionIndex) => {
                const isCenteredOption =
                  optionIndex === deliveryStateDropdownCenterIndex;

                return (
                  <Pressable
                    accessibilityLabel={`Select ${option}`}
                    accessibilityRole="button"
                    key={option}
                    onPress={() => selectDeliveryStateOption(option)}
                    style={({ pressed }) => [
                      shopStyles.deliveryOverlayStateOption,
                      (pressed || selectedDeliveryState === option) &&
                        shopStyles.deliveryOverlayStateOptionSelected,
                      isCenteredOption &&
                        shopStyles.deliveryOverlayStateOptionCentered,
                    ]}
                  >
                    <Text
                      allowFontScaling={false}
                      ellipsizeMode="clip"
                      numberOfLines={1}
                      style={[
                        shopStyles.deliveryOverlayStateOptionText,
                        selectedDeliveryState === option &&
                          shopStyles.deliveryOverlayStateOptionTextSelected,
                        isCenteredOption &&
                          shopStyles.deliveryOverlayStateOptionTextCentered,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      ) : null}

      {isTruckOverlayVisible &&
      isDeliveryOverlayVisible &&
      openDeliveryTimeDropdownKey &&
      deliveryTimeDropdownAnchor ? (
        <View
          pointerEvents="box-none"
          style={shopStyles.deliveryOverlayStateDropdownLayer}
        >
          <Pressable
            accessibilityLabel="Close delivery time options"
            accessibilityRole="button"
            onPress={dismissDeliveryTimeDropdown}
            style={shopStyles.deliveryOverlayStateDropdownDismissArea}
          />
          <View
            style={[
              shopStyles.deliveryOverlayStateDropdown,
              {
                height: deliveryTimeDropdownHeight,
                left: deliveryTimeDropdownAnchor.x,
                top: deliveryTimeDropdownTop,
                width: deliveryTimeDropdownAnchor.width,
              },
            ]}
          >
            <ScrollView
              directionalLockEnabled
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              onScroll={({ nativeEvent }) =>
                setDeliveryTimeDropdownScrollY(
                  Math.max(0, nativeEvent.contentOffset?.y || 0),
                )
              }
              overScrollMode="always"
              persistentScrollbar
              scrollEventThrottle={16}
              scrollEnabled
              showsVerticalScrollIndicator
              style={shopStyles.deliveryOverlayStateDropdownScroll}
            >
              {deliveryTimeDropdownOptions.map((option, optionIndex) => {
                const isCenteredOption =
                  optionIndex === deliveryTimeDropdownCenterIndex;

                return (
                  <Pressable
                    accessibilityLabel={`Select ${option}`}
                    accessibilityRole="button"
                    key={`${openDeliveryTimeDropdownKey}-${option}`}
                    onPress={() =>
                      selectDeliveryTimeDropdownOption(
                        openDeliveryTimeDropdownKey,
                        option,
                      )
                    }
                    style={({ pressed }) => [
                      shopStyles.deliveryOverlayStateOption,
                      (pressed ||
                        selectedDeliveryTimeDropdownValue === option) &&
                        shopStyles.deliveryOverlayStateOptionSelected,
                      isCenteredOption &&
                        shopStyles.deliveryOverlayStateOptionCentered,
                    ]}
                  >
                    <Text
                      allowFontScaling={false}
                      ellipsizeMode="clip"
                      numberOfLines={1}
                      style={[
                        shopStyles.deliveryOverlayStateOptionText,
                        selectedDeliveryTimeDropdownValue === option &&
                          shopStyles.deliveryOverlayStateOptionTextSelected,
                        isCenteredOption &&
                          shopStyles.deliveryOverlayStateOptionTextCentered,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      ) : null}

      {isTruckOverlayVisible &&
      isPaymentOverlayVisible &&
      selectedPaymentOverlayMethod === paymentOverlayCardMethod &&
      isPaymentIssuerDropdownOpen &&
      paymentIssuerDropdownAnchor ? (
        <View
          pointerEvents="box-none"
          style={shopStyles.deliveryOverlayStateDropdownLayer}
        >
          <Pressable
            accessibilityLabel="Close issuer options"
            accessibilityRole="button"
            onPress={dismissPaymentIssuerDropdown}
            style={shopStyles.deliveryOverlayStateDropdownDismissArea}
          />
          <View
            style={[
              shopStyles.deliveryOverlayStateDropdown,
              {
                height: paymentIssuerDropdownHeight,
                left: paymentIssuerDropdownAnchor.x,
                top: paymentIssuerDropdownTop,
                width: paymentIssuerDropdownAnchor.width,
              },
            ]}
          >
            {paymentIssuerOptions.map((option) => (
              <Pressable
                accessibilityLabel={`Select ${option}`}
                accessibilityRole="button"
                key={option}
                onPress={() => selectPaymentIssuerOption(option)}
                style={({ pressed }) => [
                  shopStyles.deliveryOverlayStateOption,
                  (pressed || selectedPaymentCardIssuer === option) &&
                    shopStyles.deliveryOverlayStateOptionSelected,
                ]}
              >
                <Text
                  allowFontScaling={false}
                  ellipsizeMode="clip"
                  numberOfLines={1}
                  style={[
                    shopStyles.deliveryOverlayStateOptionText,
                    selectedPaymentCardIssuer === option &&
                      shopStyles.deliveryOverlayStateOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {isTruckOverlayVisible
        ? renderShippingPreviewActionButton({
            frameStyle: [
              shopStyles.shippingPreviewReadyButtonLiftFrame,
              {
                top: shippingPreviewActionButtonScreenTop,
                left: shippingPreviewActionClusterLeft,
              },
            ],
          })
        : null}
    </View>
  );
}
