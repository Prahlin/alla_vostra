import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  FlatList,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { useLocalSearchParams } from "expo-router";
import {
  CardForm,
  PlatformPay,
  usePlatformPay,
  useStripe,
} from "@stripe/stripe-react-native";
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
  getSmallAndroidHeaderTopOverlap,
  getTopSafeInset,
} from "../utils/platformLayout";
import { openPaymentLink } from "../utils/openPaymentLink";
import {
  mainHorizontalPadding,
  mainMaxWidth,
  scaleLayout,
  scaleLineHeight,
  scaleVerticalGap,
  smallAndroidCreamAreaScale,
} from "../utils/responsiveLayout";
import { useShopCart } from "../utils/shopCartContext";
import {
  stickyButtonEdgeOffset,
  stickyButtonSize,
} from "../utils/stickyButtonLayout";
import {
  createStripePaymentSheet,
  getStripeConfigurationIssue,
  isExpoGo,
  isStripeLiveMode,
  stripeMerchantIdentifier,
} from "../utils/stripePayments";

const initialOverlayNavIndex = overlayNavProducts.findIndex(
  (product) => product.name === piccolaProduct.name,
);
const shippingPreviewActionBandPortionCount = 6;
const shippingPreviewActionBandSlideDuration = 130;
const shippingPreviewChromeStops = [
  { offset: "0%", color: "#D9953F" },
  { offset: "48%", color: "#f7b967" },
  { offset: "100%", color: "#FFC878" },
];
const orangeButtonGradientColors = ["#FFC878", "#f7b967", "#D9953F"];
const topOverlayGradientColors = ["#F6C078", "#f7b967", "#E6A04D"];

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
    orange: orangeButtonGradientColors,
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

const deliveryTimeOverlayRows = [
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
];

const deliveryOverlayRows = [
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
    { key: "city", label: "City:", type: "city", flex: 5.5 },
    { key: "state", label: "State:", type: "state", flex: 2 },
    {
      key: "zip",
      label: "Zip:",
      flex: 2.5,
      keyboardType: "number-pad",
      maxLength: 5,
    },
    { key: "cityStateZipGap", type: "rowGapAfter" },
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
const deliveryTimeOverlayRequiredFieldKeys = getOverlayRequiredFieldKeys(
  deliveryTimeOverlayRows,
);
const deliveryOverlayRequiredFieldKeys =
  getOverlayRequiredFieldKeys(deliveryOverlayRows);
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
const deliveryServiceAreaZipRanges = [
  [33002, 33002],
  [33004, 33004],
  [33008, 33035],
  [33039, 33039],
  [33054, 33084],
  [33090, 33090],
  [33092, 33093],
  [33097, 33097],
  [33101, 33102],
  [33106, 33106],
  [33109, 33109],
  [33111, 33112],
  [33114, 33114],
  [33116, 33116],
  [33119, 33119],
  [33122, 33122],
  [33124, 33147],
  [33149, 33158],
  [33160, 33170],
  [33172, 33199],
  [33301, 33359],
  [33388, 33388],
  [33394, 33394],
  [33441, 33443],
];
const deliveryServiceAreaZipCodes = new Set([
  "33206",
  "33222",
  "33231",
  "33233",
  "33234",
  "33238",
  "33239",
  "33242",
  "33243",
  "33245",
  "33247",
  "33255",
  "33256",
  "33257",
  "33261",
  "33265",
  "33266",
  "33269",
  "33280",
  "33283",
  "33296",
  "33299",
]);
const normalizeDeliveryPlaceName = (placeName) =>
  String(placeName || "")
    .trim()
    .toLowerCase();
const deliveryServiceAreaCityOptions = [
  "Aventura",
  "Bal Harbour",
  "Bay Harbor Islands",
  "Biscayne Gardens",
  "Biscayne Park",
  "Boulevard Gardens",
  "Broadview Park",
  "Brownsville",
  "Coconut Creek",
  "Cooper City",
  "Coral Gables",
  "Coral Springs",
  "Coral Terrace",
  "Country Club",
  "Country Walk",
  "Cutler Bay",
  "Dania Beach",
  "Davie",
  "Deerfield Beach",
  "Doral",
  "El Portal",
  "Fisher Island",
  "Florida City",
  "Fort Lauderdale",
  "Fountainebleau",
  "Franklin Park",
  "Gladeview",
  "Glenvar Heights",
  "Golden Beach",
  "Goulds",
  "Hallandale Beach",
  "Hialeah",
  "Hialeah Gardens",
  "Hillsboro Beach",
  "Hillsboro Pines",
  "Hollywood",
  "Homestead",
  "Homestead Base",
  "Indian Creek",
  "Ives Estates",
  "Kendale Lakes",
  "Kendall",
  "Kendall West",
  "Key Biscayne",
  "Lauderdale Lakes",
  "Lauderdale-by-the-Sea",
  "Lauderhill",
  "Lazy Lake",
  "Leisure City",
  "Lighthouse Point",
  "Margate",
  "Medley",
  "Miami",
  "Miami Beach",
  "Miami Gardens",
  "Miami Lakes",
  "Miami Shores",
  "Miami Springs",
  "Miramar",
  "Naranja",
  "North Bay Village",
  "North Lauderdale",
  "North Miami",
  "North Miami Beach",
  "Oakland Park",
  "Ojus",
  "Olympia Heights",
  "Opa-locka",
  "Palmetto Bay",
  "Palmetto Estates",
  "Palm Springs North",
  "Parkland",
  "Pembroke Park",
  "Pembroke Pines",
  "Pinecrest",
  "Plantation",
  "Pompano Beach",
  "Princeton",
  "Richmond Heights",
  "Richmond West",
  "Roosevelt Gardens",
  "Sea Ranch Lakes",
  "South Miami",
  "South Miami Heights",
  "Southwest Ranches",
  "Sunny Isles Beach",
  "Sunrise",
  "Sunset",
  "Surfside",
  "Sweetwater",
  "Tamarac",
  "Tamiami",
  "The Crossings",
  "The Hammocks",
  "Three Lakes",
  "Virginia Gardens",
  "Washington Park",
  "West Little River",
  "West Miami",
  "West Park",
  "West Perrine",
  "Westchester",
  "Weston",
  "Westview",
  "Westwood Lakes",
  "Wilton Manors",
];
const deliveryServiceAreaCityNames = new Set(
  deliveryServiceAreaCityOptions.map(normalizeDeliveryPlaceName),
);
const normalizeDeliveryZip = (zipValue) =>
  String(zipValue || "")
    .replace(/\D/g, "")
    .slice(0, 5);
const isDeliveryServiceAreaCity = (cityValue) =>
  deliveryServiceAreaCityNames.has(normalizeDeliveryPlaceName(cityValue));
const isDeliveryServiceAreaZip = (zipValue) => {
  const normalizedZip = normalizeDeliveryZip(zipValue);

  if (normalizedZip.length !== 5) {
    return false;
  }

  if (deliveryServiceAreaZipCodes.has(normalizedZip)) {
    return true;
  }

  const numericZip = Number(normalizedZip);

  return deliveryServiceAreaZipRanges.some(
    ([startZip, endZip]) => numericZip >= startZip && numericZip <= endZip,
  );
};
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
const paymentOverlayGooglePayMethod = "Google Pay";
const paymentOverlayApplePayMethod = "Apple Pay";
const paymentOverlayPayPalMethod = "PayPal";
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

const shopMainHorizontalPadding = mainHorizontalPadding;
const truckOverlayHorizontalMargin = shopMainHorizontalPadding * 0.5;
const truckOverlayBorderWidth = 2;
const truckOverlayInnerHorizontalPadding = truckOverlayHorizontalMargin;
const productOverlayScale =
  Platform.OS === "ios" ? 0.82 : smallAndroidCreamAreaScale;
const scaleProductOverlay = (value) => value * productOverlayScale;
const piccolaOverlayImageHalfSize = scaleProductOverlay(100.85229);
const piccolaOverlayActionWidth = scaleProductOverlay(77.22);
const piccolaOverlayQuantityTriangleWidth = scaleProductOverlay(43.70625);
const piccolaOverlayQuantityTriangleHeight = scaleProductOverlay(28.17);
const piccolaOverlayQuantityTriangleStrokeWidth = scaleProductOverlay(2);
const piccolaOverlayQuantityTopBoxHeight = scaleProductOverlay(29.1375);
const piccolaOverlayQuantityBoxWidth = scaleProductOverlay(29.1375);
const piccolaOverlayQuantityFrameTop = scaleProductOverlay(6.9375);
const piccolaOverlayQuantityFrameHeight = scaleProductOverlay(41.625);
const piccolaOverlayDescriptionRowSideInset = Math.max(
  0,
  truckOverlayHorizontalMargin * 2 - truckOverlayInnerHorizontalPadding,
);
const cartOverlayFilledScale =
  Platform.OS === "ios" ? 0.72 : smallAndroidCreamAreaScale;
const scaleCartOverlayFilled = (value) => value * cartOverlayFilledScale;
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
const cartOverlayCheckoutBoxScale =
  Platform.OS === "ios" ? 0.78 : smallAndroidCreamAreaScale;
const scaleCartOverlayCheckoutBox = (value) =>
  value * cartOverlayCheckoutBoxScale;
const cartOverlayCheckoutButtonHeight = scaleCartOverlayCheckoutBox(55.5);
const cartOverlayReceiptScale =
  Platform.OS === "ios" ? 0.78 : smallAndroidCreamAreaScale;
const scaleCartOverlayReceipt = (value) => value * cartOverlayReceiptScale;
const cartOverlayGrandTotalScale =
  Platform.OS === "ios" ? 0.68 : smallAndroidCreamAreaScale;
const scaleCartOverlayGrandTotal = (value) =>
  value * cartOverlayGrandTotalScale;
const cartOverlayReceiptHorizontalInset = scaleCartOverlayReceipt(12);
const cartOverlayBottomSummaryLineHeight = scaleCartOverlayReceipt(16);
const cartOverlayBottomSummarySpacerHeight = scaleCartOverlayReceipt(8);
const cartOverlayBottomGrandTotalLineHeight = scaleCartOverlayReceipt(25);
const cartOverlayBottomFeeTaxSpacerHeight = Math.max(
  0,
  scaleCartOverlayGrandTotal(46) - scaleCartOverlayReceipt(32),
);
const cartOverlayBottomControlsGap = 4;
const paymentOverlayHorizontalInset = 12;
const paymentOverlayWalletMethodGap = 8;
const paymentOverlayWalletButtonBaseSize = 55.5;
const paymentOverlayWalletButtonBaseRadius = 10.5;
const piccolaOverlayHeadingTopPadding = 16;
const shopMainPaddingTop = scaleVerticalGap(26.8125);
const stickyCartEdgeOffset = stickyButtonEdgeOffset;
const stickyCartButtonSize = stickyButtonSize;
const shippingPreviewIOSLayoutScale = Platform.OS === "ios" ? 0.77 : 1;
const scaleShippingPreview = (value) =>
  Platform.OS === "ios"
    ? value * shippingPreviewIOSLayoutScale
    : scaleVerticalGap(value) * smallAndroidCreamAreaScale;
const shippingTitleOfferingsLineHeight = Platform.select({
  web: 40.00798828125,
  ios: 23.5,
  default: scaleLineHeight(36.673989598125),
});
const shippingPreviewTruckHeight = scaleShippingPreview(121.01386125);
const shippingPreviewBargainHeight = scaleShippingPreview(141.4423825);
const shippingPreviewSofloHeight = scaleShippingPreview(139.60546875);
const shippingPreviewReadyButtonWidth = 154.0026;
const shippingPreviewReadyButtonHeight = scaleLayout(55.5);
const shippingPreviewActionSideBoxGap = 0;
const shippingPreviewActionSideBoxBleed = scaleLayout(10);
const shippingPreviewActionButtonTextLineHeight = Platform.select({
  ios: scaleShippingPreview(26.5625),
  default: 24.5625,
});
const shippingPreviewActionButtonHorizontalInset =
  (shippingPreviewReadyButtonHeight -
    shippingPreviewActionButtonTextLineHeight) /
  2;
const shippingPreviewActionCenterTextWidth = scaleLayout(94);
const shippingPreviewInitialMeasurements = {
  titleHeight: shippingTitleOfferingsLineHeight,
  truckHeight: shippingPreviewTruckHeight,
  bargainHeight: shippingPreviewBargainHeight,
  sofloHeight: shippingPreviewSofloHeight,
  readyHeight: shippingPreviewReadyButtonHeight,
};

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
  const strokeColor = muted ? "#888888" : "#111111";
  const isUpTriangle = direction === "up";
  const fillGradientId = isUpTriangle
    ? "piccolaQuantityTriangleTopGradient"
    : "piccolaQuantityTriangleBottomGradient";
  const fillGradientColors = isUpTriangle
    ? topOverlayGradientColors
    : orangeButtonGradientColors;
  const path =
    isUpTriangle
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
      <Defs>
        <SvgLinearGradient
          gradientUnits="userSpaceOnUse"
          id={fillGradientId}
          x1={piccolaOverlayQuantityTriangleWidth / 2}
          x2={piccolaOverlayQuantityTriangleWidth / 2}
          y1={isUpTriangle ? piccolaOverlayQuantityTriangleHeight : 0}
          y2={isUpTriangle ? 0 : piccolaOverlayQuantityTriangleHeight}
        >
          {fillGradientColors.map((color, index) => (
            <Stop
              key={`${fillGradientId}-${color}`}
              offset={`${index * 50}%`}
              stopColor={color}
            />
          ))}
        </SvgLinearGradient>
      </Defs>
      <Path
        d={path}
        fill={`url(#${fillGradientId})`}
        opacity={muted ? 0.5 : 1}
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

function PaymentCardMethodIcon({ width, height }) {
  return (
    <Svg height={height} viewBox="0 0 64 42" width={width}>
      <Rect
        fill="none"
        height={34}
        rx={5}
        stroke="#111111"
        strokeWidth={2.4}
        width={56}
        x={4}
        y={4}
      />
      <Rect fill="#111111" height={6} width={56} x={4} y={12} />
      <Rect
        fill="none"
        height={8}
        rx={1.8}
        stroke="#111111"
        strokeWidth={2}
        width={11}
        x={11}
        y={23}
      />
      <Path
        d="M29 25h21M29 31h13"
        fill="none"
        stroke="#111111"
        strokeLinecap="round"
        strokeWidth={2.2}
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
  const { confirmPayment, createPaymentMethod } = useStripe();
  const { confirmPlatformPayPayment, isPlatformPaySupported } =
    usePlatformPay();
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
  const shopContentWidth =
    typeof mainMaxWidth === "number"
      ? Math.min(windowWidth, mainMaxWidth)
      : windowWidth;
  const shopContentLeft = Math.max(0, (windowWidth - shopContentWidth) / 2);
  const shopContentCenterX = shopContentLeft + shopContentWidth / 2;
  const shopContentRight = shopContentLeft + shopContentWidth;
  const safeAreaInsets = useSafeAreaInsets();
  const { bottom: bottomInset } = safeAreaInsets;
  const topSafeInset = getTopSafeInset(safeAreaInsets);
  const resolvedShopHeaderHeight = getHeaderTopBarHeight(safeAreaInsets);
  const smallAndroidHeaderTopOverlap =
    getSmallAndroidHeaderTopOverlap(safeAreaInsets);
  const headerY = useRef(new Animated.Value(0)).current;
  const [isTruckOverlayVisible, setIsTruckOverlayVisible] = useState(
    shouldOpenCartInitially || shouldOpenProductInitially,
  );
  const [isCartOverlayVisible, setIsCartOverlayVisible] = useState(
    shouldOpenCartInitially,
  );
  const [isContactOverlayVisible, setIsContactOverlayVisible] =
    useState(false);
  const [isTimeOverlayVisible, setIsTimeOverlayVisible] = useState(false);
  const [isDeliveryOverlayVisible, setIsDeliveryOverlayVisible] =
    useState(false);
  const [isPaymentOverlayVisible, setIsPaymentOverlayVisible] = useState(false);
  const [
    isPaymentOrderConfirmationVisible,
    setIsPaymentOrderConfirmationVisible,
  ] = useState(false);
  const [
    isPaymentCardDetailsOverlayVisible,
    setIsPaymentCardDetailsOverlayVisible,
  ] = useState(false);
  const [
    isPaymentPayPalOverlayVisible,
    setIsPaymentPayPalOverlayVisible,
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
    time: false,
  }));
  const [selectedDeliveryState, setSelectedDeliveryState] = useState("");
  const [selectedPaymentOverlayMethod, setSelectedPaymentOverlayMethod] =
    useState(null);
  const [selectedPaymentCardIssuer, setSelectedPaymentCardIssuer] =
    useState("");
  const [stripeCardDetails, setStripeCardDetails] = useState(null);
  const [acceptedStripePaymentMethodId, setAcceptedStripePaymentMethodId] =
    useState(null);
  const [isPaymentCardAccepted, setIsPaymentCardAccepted] = useState(false);
  const stripeCardDetailsRef = useRef(null);
  const [deliveryFieldValues, setDeliveryFieldValues] = useState(
    defaultDeliveryFieldValues,
  );
  const [
    isDeliveryPhoneCheckboxChecked,
    setIsDeliveryPhoneCheckboxChecked,
  ] = useState(false);
  const [isStripePaymentInFlight, setIsStripePaymentInFlight] =
    useState(false);
  const [isAndroidKeyboardVisible, setIsAndroidKeyboardVisible] =
    useState(false);
  const [isGooglePaySupported, setIsGooglePaySupported] = useState(false);
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const [activeDeliveryFieldKey, setActiveDeliveryFieldKey] = useState(null);
  const [emptyTouchedDeliveryFieldKeys, setEmptyTouchedDeliveryFieldKeys] =
    useState({});
  const [deliveryCityDropdownScrollY, setDeliveryCityDropdownScrollY] =
    useState(0);
  const [deliveryStateDropdownScrollY, setDeliveryStateDropdownScrollY] =
    useState(0);
  const [deliveryTimeDropdownScrollY, setDeliveryTimeDropdownScrollY] =
    useState(0);
  const [deliveryTimeWheelVisibleIndexes, setDeliveryTimeWheelVisibleIndexes] =
    useState({});
  const [isDeliveryCityDropdownOpen, setIsDeliveryCityDropdownOpen] =
    useState(false);
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
  const deliveryCityButtonRef = useRef(null);
  const deliveryOverlayShakeX = useRef(new Animated.Value(0)).current;
  const deliveryOverlayShakeAnimationRef = useRef(null);
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
        ? "NEW"
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
  const shouldHideShopOverlayBottomControls =
    Platform.OS === "android" && isAndroidKeyboardVisible;

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
  const isContactTimeActionVisible =
    isTruckOverlayVisible && isContactOverlayVisible;
  const isTimeDeliveryActionVisible =
    isTruckOverlayVisible && isTimeOverlayVisible;
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
    !isTimeOverlayVisible &&
    !isDeliveryOverlayVisible &&
    !isPaymentOverlayVisible &&
    !isPlaceholderOverlayVisible;
  const shippingPreviewActionButtonLabel = isCartAddItemsActionVisible
    ? "Cart"
    : isContactTimeActionVisible
      ? "Contact"
      : isTimeDeliveryActionVisible
        ? "Date & Time"
        : isDeliveryPaymentActionVisible
          ? "Address"
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
    : isContactTimeActionVisible
      ? "Contact"
      : isTimeDeliveryActionVisible
        ? "Date & Time"
        : isDeliveryPaymentActionVisible
          ? "Address"
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
    : isContactTimeActionVisible
      ? "Cart"
      : isTimeDeliveryActionVisible
        ? "Contact"
        : isDeliveryPaymentActionVisible
          ? "Date & Time"
          : isPaymentViewCartActionVisible
            ? "Address"
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
    shopContentRight - stickyCartEdgeOffset - stickyCartButtonSize;
  const shippingPreviewActionMinCenterTextWidth =
    shippingPreviewActionCenterTextWidth * 0.72;
  const shippingPreviewActionMinCenterButtonInset = scaleLayout(4);
  const shippingPreviewActionMinCenterButtonWidth =
    shippingPreviewActionMinCenterTextWidth +
    shippingPreviewActionMinCenterButtonInset * 2;
  const shippingPreviewActionTargetCenterButtonWidthForStickyGap =
    shouldShowShippingPreviewActionSideBoxes
      ? Math.max(
          0,
          (shippingPreviewActionStickyCartLeft -
            shippingPreviewActionTargetStickyCartGap -
            shopContentCenterX -
            shippingPreviewActionRightSideBoxWidth +
            shippingPreviewActionResolvedSideBoxBleed) *
            2,
        )
      : shippingPreviewActionBaseCenterButtonWidth;
  const shippingPreviewActionMaxCenterButtonWidthForScreen =
    shouldShowShippingPreviewActionSideBoxes
      ? Math.max(
          0,
          shopContentWidth -
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
      ? 5
      : isDeliveryPaymentActionVisible
        ? 4
        : isTimeDeliveryActionVisible
          ? 3
          : isContactTimeActionVisible
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
  const [deliveryCityDropdownAnchor, setDeliveryCityDropdownAnchor] =
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

  const measureDeliveryCityDropdownAnchor = () => {
    requestAnimationFrame(() => {
      deliveryCityButtonRef.current?.measureInWindow?.(
        (x, y, width, height) => {
          setDeliveryCityDropdownAnchor({ height, width, x, y });
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

  const dismissDeliveryCityDropdownToDefault = () => {
    setDeliveryFieldValues((currentValues) => ({
      ...currentValues,
      city: "",
    }));
    setActiveDeliveryFieldKey(null);
    setIsDeliveryCityDropdownOpen(false);
  };

  const dismissDeliveryTimeDropdown = () => {
    setActiveDeliveryFieldKey(null);
    setIsDeliveryCityDropdownOpen(false);
    setOpenDeliveryTimeDropdownKey(null);
  };

  const dismissPaymentIssuerDropdown = () => {
    setActiveDeliveryFieldKey(null);
    setIsDeliveryCityDropdownOpen(false);
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
    setEmptyTouchedDeliveryFieldKeys((currentFieldKeys) => {
      if (!currentFieldKeys[fieldKey]) {
        return currentFieldKeys;
      }

      const nextFieldKeys = { ...currentFieldKeys };
      delete nextFieldKeys[fieldKey];
      return nextFieldKeys;
    });
    setIsDeliveryCityDropdownOpen(false);
    setIsDeliveryStateDropdownOpen(false);
    setOpenDeliveryTimeDropdownKey(null);
    setIsPaymentIssuerDropdownOpen(false);
  };

  const deactivateDeliveryTextField = (fieldKey) => {
    setActiveDeliveryFieldKey((currentFieldKey) =>
      currentFieldKey === fieldKey ? null : currentFieldKey,
    );
    setEmptyTouchedDeliveryFieldKeys((currentFieldKeys) => {
      const fieldValue = deliveryFieldValues[fieldKey] || "";
      const isFieldEmpty = fieldValue.trim().length === 0;

      if (isFieldEmpty) {
        return {
          ...currentFieldKeys,
          [fieldKey]: true,
        };
      }

      if (!currentFieldKeys[fieldKey]) {
        return currentFieldKeys;
      }

      const nextFieldKeys = { ...currentFieldKeys };
      delete nextFieldKeys[fieldKey];
      return nextFieldKeys;
    });

    if (
      isContactOverlayVisible &&
      fieldKey === "email" &&
      (deliveryFieldValues.email || "").trim().length > 0 &&
      !(deliveryFieldValues.email || "").includes("@")
    ) {
      shakeDeliveryOverlay();
    }
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

  const toggleDeliveryStateDropdown = () => {
    setActiveDeliveryFieldKey("state");
    setIsDeliveryCityDropdownOpen(false);
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

  const toggleDeliveryCityDropdown = () => {
    setActiveDeliveryFieldKey("city");
    setIsDeliveryStateDropdownOpen(false);
    setOpenDeliveryTimeDropdownKey(null);
    setIsPaymentIssuerDropdownOpen(false);

    if (!isDeliveryCityDropdownOpen) {
      measureDeliveryCityDropdownAnchor();
      setIsDeliveryCityDropdownOpen(true);
      return;
    }

    setActiveDeliveryFieldKey(null);
    setIsDeliveryCityDropdownOpen(false);
  };

  const shakeDeliveryOverlay = () => {
    if (deliveryOverlayShakeAnimationRef.current) {
      deliveryOverlayShakeAnimationRef.current.stop();
    }

    deliveryOverlayShakeX.setValue(0);
    deliveryOverlayShakeAnimationRef.current = Animated.sequence([
      Animated.timing(deliveryOverlayShakeX, {
        duration: 45,
        easing: Easing.linear,
        toValue: -8,
        useNativeDriver: true,
      }),
      Animated.timing(deliveryOverlayShakeX, {
        duration: 45,
        easing: Easing.linear,
        toValue: 8,
        useNativeDriver: true,
      }),
      Animated.timing(deliveryOverlayShakeX, {
        duration: 45,
        easing: Easing.linear,
        toValue: -6,
        useNativeDriver: true,
      }),
      Animated.timing(deliveryOverlayShakeX, {
        duration: 45,
        easing: Easing.linear,
        toValue: 6,
        useNativeDriver: true,
      }),
      Animated.timing(deliveryOverlayShakeX, {
        duration: 45,
        easing: Easing.out(Easing.quad),
        toValue: 0,
        useNativeDriver: true,
      }),
    ]);
    deliveryOverlayShakeAnimationRef.current.start(({ finished }) => {
      if (finished) {
        deliveryOverlayShakeAnimationRef.current = null;
      }
    });
  };

  const selectDeliveryStateOption = (option) => {
    setSelectedDeliveryState(option);
    setActiveDeliveryFieldKey(null);
    setIsDeliveryStateDropdownOpen(false);

    if (option !== "FL") {
      shakeDeliveryOverlay();
    }
  };

  const selectDeliveryCityOption = (option) => {
    setDeliveryFieldValues((currentValues) => ({
      ...currentValues,
      city: option,
    }));
    setActiveDeliveryFieldKey(null);
    setIsDeliveryCityDropdownOpen(false);

    if (!isDeliveryServiceAreaCity(option)) {
      shakeDeliveryOverlay();
    }
  };

  const updateDeliveryFieldValue = (fieldKey, text) => {
    const nextValue = fieldKey === "zip" ? normalizeDeliveryZip(text) : text;

    setDeliveryFieldValues((currentValues) => ({
      ...currentValues,
      [fieldKey]: nextValue,
    }));
    setEmptyTouchedDeliveryFieldKeys((currentFieldKeys) => {
      if (nextValue.trim().length === 0 || !currentFieldKeys[fieldKey]) {
        return currentFieldKeys;
      }

      const nextFieldKeys = { ...currentFieldKeys };
      delete nextFieldKeys[fieldKey];
      return nextFieldKeys;
    });

    if (
      fieldKey === "zip" &&
      nextValue.length === 5 &&
      !isDeliveryServiceAreaZip(nextValue)
    ) {
      shakeDeliveryOverlay();
    }
  };

  const toggleDeliveryTimeDropdown = (fieldKey) => {
    setActiveDeliveryFieldKey(fieldKey);
    setIsDeliveryCityDropdownOpen(false);
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
    setIsDeliveryCityDropdownOpen(false);
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
    setIsDeliveryCityDropdownOpen(false);
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
    setIsDeliveryCityDropdownOpen(false);
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
    stripeCardDetailsRef.current = cardDetails;
    setStripeCardDetails(cardDetails);
    setSelectedPaymentCardIssuer(getStripeCardBrandLabel(cardDetails?.brand));
    if (!cardDetails?.complete) {
      setAcceptedStripePaymentMethodId(null);
      setIsPaymentCardAccepted(false);
    }
  };

  const openPaymentCardDetailsOverlay = () => {
    setSelectedPaymentOverlayMethod(paymentOverlayCardMethod);
    setActiveDeliveryFieldKey(null);
    setIsPaymentOrderConfirmationVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsPaymentPayPalOverlayVisible(false);
    setAcceptedStripePaymentMethodId(null);
    setIsPaymentCardAccepted(false);
    setIsPaymentCardDetailsOverlayVisible(true);
  };

  const getPayPalPaymentUrl = () =>
    products.find((productItem) => productItem.paymentUrl)?.paymentUrl;

  const openPayPalPaymentLink = async () => {
    await openPaymentLink(getPayPalPaymentUrl());
  };

  const selectPaymentWalletMethod = async (method) => {
    setSelectedPaymentOverlayMethod(method);
    setActiveDeliveryFieldKey(null);
    setIsPaymentCardDetailsOverlayVisible(false);
    setStripeCardDetails(null);
    stripeCardDetailsRef.current = null;
    setAcceptedStripePaymentMethodId(null);
    setIsPaymentCardAccepted(false);

    if (method === paymentOverlayPayPalMethod) {
      setIsPaymentOrderConfirmationVisible(false);
      setIsOrderPlacementConfirmed(false);
      setIsPaymentPayPalOverlayVisible(true);
      return;
    }

    setIsPaymentPayPalOverlayVisible(false);

    if (
      method !== paymentOverlayGooglePayMethod &&
      method !== paymentOverlayApplePayMethod
    ) {
      return;
    }

    if (method === paymentOverlayApplePayMethod) {
      if (Platform.OS !== "ios") {
        showPaymentAlert(
          "Apple Pay unavailable",
          "Apple Pay is only available on iPhone. Use Debit/Credit Card or Google Pay on this device.",
        );
        return;
      }

      if (isExpoGo) {
        showPaymentAlert(
          "Apple Pay needs a development build",
          "Expo Go cannot open the native Apple Pay sheet. Use an iOS development build or App Store build to test Apple Pay.",
        );
        return;
      }

      if (!stripeMerchantIdentifier) {
        showPaymentAlert(
          "Apple Pay setup needed",
          "Add EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER to mob/.env so StripeProvider can use your Apple merchant ID.",
        );
        return;
      }

      if (!isApplePaySupported) {
        showPaymentAlert(
          "Apple Pay unavailable",
          "This iPhone is not ready for Apple Pay. Make sure Wallet has an active card, then try again.",
        );
      }

      return;
    }

    if (Platform.OS !== "android") {
      showPaymentAlert(
        "Google Pay unavailable",
        "Google Pay is only available on Android. Use Debit/Credit Card on this device.",
      );
      return;
    }

    if (isExpoGo) {
      showPaymentAlert(
        "Google Pay needs a development build",
        "Expo Go cannot open the native Google Pay sheet. Use an Android development build or Play Store build to test Google Pay.",
      );
      return;
    }

    if (!isGooglePaySupported) {
      showPaymentAlert(
        "Google Pay unavailable",
        "This device is not ready for Google Pay. Make sure Google Wallet is set up, then try again.",
      );
    }
  };

  const acceptPaymentCardDetailsOverlay = async () => {
    const latestCardDetails = stripeCardDetailsRef.current || stripeCardDetails;

    if (!latestCardDetails?.complete) {
      setAcceptedStripePaymentMethodId(null);
      setIsPaymentCardAccepted(false);
      showPaymentAlert(
        "Card details needed",
        "Enter a complete card number, expiration date, and CVV.",
      );
      return;
    }

    const paymentMethodResult = await createPaymentMethod({
      paymentMethodType: "Card",
      paymentMethodData: {
        billingDetails: buildStripeBillingDetails(),
      },
    });

    if (paymentMethodResult.error || !paymentMethodResult.paymentMethod?.id) {
      setAcceptedStripePaymentMethodId(null);
      setIsPaymentCardAccepted(false);
      showPaymentAlert(
        "Card details needed",
        paymentMethodResult.error?.localizedMessage ||
          paymentMethodResult.error?.message ||
          "Stripe could not save those card details. Please check the card number, expiration date, and CVV.",
      );
      return;
    }

    setStripeCardDetails(latestCardDetails);
    setAcceptedStripePaymentMethodId(paymentMethodResult.paymentMethod.id);
    setSelectedPaymentOverlayMethod(paymentOverlayCardMethod);
    setIsPaymentCardAccepted(true);
    setIsPaymentCardDetailsOverlayVisible(false);
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
      billingAddressMatchesDelivery: true,
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
    const billingName = deliveryName || contactName;
    const billingZip = getOverlayFieldValue("zip");
    const address = {
      city: getOverlayFieldValue("city"),
      country: "US",
      line1: getOverlayFieldValue("address"),
      line2: getOverlayFieldValue("apartment"),
      postalCode: billingZip,
      state: selectedDeliveryState,
    };

    return {
      address,
      email: getOverlayFieldValue("email"),
      name: billingName,
      phone: getOverlayFieldValue("phone"),
    };
  };

  const buildGooglePayParams = () => ({
    testEnv: !isStripeLiveMode,
    merchantName: "Alla Vostra",
    merchantCountryCode: "US",
    currencyCode: "USD",
    billingAddressConfig: {
      format: PlatformPay.BillingAddressFormat.Min,
      isRequired: false,
    },
  });

  const formatPlatformPayAmount = (amountCents) =>
    (Math.max(0, Number(amountCents || 0)) / 100).toFixed(2);

  const buildApplePayCartItems = (paymentSheet) => {
    const totals = paymentSheet?.totals || {};
    const subtotal = Number(totals.subtotal || 0);
    const deliveryFee = Number(totals.deliveryFee || 0);
    const tax = Number(totals.tax || 0);
    const grandTotal = Number(totals.grandTotal || paymentSheet?.amount || 0);

    return [
      {
        label: "Subtotal",
        amount: formatPlatformPayAmount(subtotal),
        paymentType: PlatformPay.PaymentType.Immediate,
      },
      {
        label: "Delivery",
        amount: formatPlatformPayAmount(deliveryFee),
        paymentType: PlatformPay.PaymentType.Immediate,
      },
      {
        label: "Taxes",
        amount: formatPlatformPayAmount(tax),
        paymentType: PlatformPay.PaymentType.Immediate,
      },
      {
        label: "Alla Vostra",
        amount: formatPlatformPayAmount(grandTotal),
        paymentType: PlatformPay.PaymentType.Immediate,
      },
    ];
  };

  const buildApplePayParams = (paymentSheet) => ({
    merchantCountryCode: "US",
    currencyCode: "USD",
    cartItems: buildApplePayCartItems(paymentSheet),
  });

  const confirmGooglePayPayment = async (clientSecret) => {
    const confirmResult = await confirmPlatformPayPayment(clientSecret, {
      googlePay: buildGooglePayParams(),
    });

    if (confirmResult.error) {
      throw new Error(
        confirmResult.error.localizedMessage ||
          confirmResult.error.message ||
          "Google Pay was not completed.",
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
  };

  const confirmApplePayPayment = async (clientSecret, paymentSheet) => {
    const confirmResult = await confirmPlatformPayPayment(clientSecret, {
      applePay: buildApplePayParams(paymentSheet),
    });

    if (confirmResult.error) {
      throw new Error(
        confirmResult.error.localizedMessage ||
          confirmResult.error.message ||
          "Apple Pay was not completed.",
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
  const stickyCartButtonTopY =
    windowHeight - bottomInset - stickyCartEdgeOffset - stickyCartButtonSize;
  const shippingPreviewAvailableHeight = Math.max(
    0,
    stickyCartButtonTopY - resolvedShopHeaderHeight,
  );
  const shippingPreviewTitleStackHeight = Math.max(
    0,
    shippingPreviewMeasurements.titleHeight || shippingTitleOfferingsLineHeight,
  );
  const shippingPreviewTruckStackHeight = Math.max(
    0,
    shippingPreviewMeasurements.truckHeight || shippingPreviewTruckHeight,
  );
  const shippingPreviewBargainStackHeight = Math.max(
    0,
    shippingPreviewMeasurements.bargainHeight || shippingPreviewBargainHeight,
  );
  const shippingPreviewSofloStackHeight = Math.max(
    0,
    shippingPreviewMeasurements.sofloHeight || shippingPreviewSofloHeight,
  );
  const shippingPreviewStackHeightTotal =
    shippingPreviewTitleStackHeight +
    shippingPreviewTruckStackHeight +
    shippingPreviewBargainStackHeight +
    shippingPreviewSofloStackHeight;
  const shippingPreviewEvenStackGap = Math.max(
    0,
    (shippingPreviewAvailableHeight - shippingPreviewStackHeightTotal) / 5,
  );
  const shippingPreviewMainPaddingTop = shippingPreviewEvenStackGap;
  const shippingPreviewInterStackGap = shippingPreviewEvenStackGap;
  const shippingPreviewStackBottomY =
    shippingPreviewTitleStackHeight +
    shippingPreviewInterStackGap +
    shippingPreviewTruckStackHeight +
    shippingPreviewInterStackGap +
    shippingPreviewBargainStackHeight +
    shippingPreviewInterStackGap +
    shippingPreviewSofloStackHeight;
  const shippingPreviewReadyButtonTargetY =
    stickyCartButtonTopY -
    resolvedShopHeaderHeight -
    shippingPreviewMainPaddingTop;
  const shippingPreviewStickyCartAlignedMarginTop =
    Math.max(0, shippingPreviewReadyButtonTargetY - shippingPreviewStackBottomY);
  const shippingPreviewReadyButtonStickyCartAlignedLeft = Math.max(
    0,
    shopContentWidth -
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
    shippingPreviewStickyCartAlignedMarginTop;
  const shippingPreviewReadyButtonTopY = shippingPreviewReadyButtonTargetY;
  const deliveryStateDropdownTop = deliveryStateDropdownAnchor
    ? deliveryStateDropdownAnchor.y +
      deliveryStateDropdownAnchor.height +
      deliveryOverlayFieldVerticalGap
    : 0;
  const deliveryCityDropdownTop = deliveryCityDropdownAnchor
    ? deliveryCityDropdownAnchor.y +
      deliveryCityDropdownAnchor.height +
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
  const deliveryCityDropdownHeight = deliveryCityDropdownAnchor
    ? Math.max(
        96,
        Math.min(
          198,
          windowHeight - deliveryCityDropdownTop - bottomInset - 10,
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
  const deliveryCityDropdownCenterIndex = Math.max(
    0,
    Math.min(
      deliveryServiceAreaCityOptions.length - 1,
      Math.floor(
        (deliveryCityDropdownScrollY + deliveryCityDropdownHeight / 2) /
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
  const selectedDeliveryCity = deliveryFieldValues.city || "";
  const isDeliveryCityInServiceArea =
    Boolean(selectedDeliveryCity) &&
    isDeliveryServiceAreaCity(selectedDeliveryCity);
  const shouldShowDeliveryCityServiceMessage =
    Boolean(selectedDeliveryCity) && !isDeliveryCityInServiceArea;
  const normalizedDeliveryZip = normalizeDeliveryZip(deliveryFieldValues.zip);
  const isDeliveryZipComplete = normalizedDeliveryZip.length === 5;
  const isDeliveryZipInServiceArea =
    isDeliveryZipComplete && isDeliveryServiceAreaZip(normalizedDeliveryZip);
  const shouldShowDeliveryZipServiceMessage =
    isDeliveryZipComplete && !isDeliveryZipInServiceArea;
  const contactOverlayEmailValue = deliveryFieldValues.email || "";
  const isContactOverlayEmailMissingAt =
    contactOverlayEmailValue.trim().length > 0 &&
    !contactOverlayEmailValue.includes("@");
  const shouldShowContactOverlayEmailAtMessage =
    isContactOverlayVisible &&
    isContactOverlayEmailMissingAt &&
    activeDeliveryFieldKey !== "email";
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
  const areDeliveryTimeRequiredFieldsComplete =
    areRequiredOverlayFieldsComplete(deliveryTimeOverlayRequiredFieldKeys);
  const areDeliveryRequiredFieldsComplete = areRequiredOverlayFieldsComplete(
    deliveryOverlayRequiredFieldKeys,
  );
  const isSelectedStripeCardComplete =
    selectedPaymentOverlayMethod !== paymentOverlayCardMethod ||
    isPaymentCardAccepted;
  const isSelectedGooglePayMethod =
    selectedPaymentOverlayMethod === paymentOverlayGooglePayMethod;
  const isSelectedApplePayMethod =
    selectedPaymentOverlayMethod === paymentOverlayApplePayMethod;
  const isSelectedPaymentMethodReady =
    selectedPaymentOverlayMethod === paymentOverlayCardMethod
      ? isSelectedStripeCardComplete
      : isSelectedGooglePayMethod || isSelectedApplePayMethod;
  const shouldDimContactProgressionButton =
    !areContactRequiredFieldsComplete || isContactOverlayEmailMissingAt;
  const shouldDimTimeProgressionButton =
    !areDeliveryTimeRequiredFieldsComplete;
  const shouldDimDeliveryProgressionButton =
    !areDeliveryRequiredFieldsComplete ||
    selectedDeliveryState !== "FL" ||
    !isDeliveryCityInServiceArea ||
    !isDeliveryZipInServiceArea;
  const shouldDimPaymentOrderButton =
    isStripePaymentInFlight ||
    !areContactRequiredFieldsComplete ||
    !areDeliveryTimeRequiredFieldsComplete ||
    !areDeliveryRequiredFieldsComplete ||
    !isSelectedPaymentMethodReady;
  const shouldDimVisiblePaymentOrderButton =
    shouldDimPaymentOrderButton || isPaymentOrderConfirmationVisible;
  const deliveryOverlayShakeStyle =
    (isContactOverlayVisible || isDeliveryOverlayVisible) && !isTimeOverlayVisible
      ? {
          transform: [{ translateX: deliveryOverlayShakeX }],
        }
      : null;
  const shopHeaderOffsetTop =
    resolvedShopHeaderHeight - smallAndroidHeaderTopOverlap;
  const shopHeaderOffsetStyle = topSafeInset || smallAndroidHeaderTopOverlap
    ? {
        top: shopHeaderOffsetTop,
      }
    : null;
  const shippingPreviewActionClusterLeft =
    shopContentLeft +
    Math.max(0, (shopContentWidth - shippingPreviewActionClusterWidth) / 2);
  const truckOverlayVerticalGap = scaleVerticalGap(24);
  const truckOverlayPreviousTop =
    shippingPreviewMainPaddingTop +
    shippingPreviewMeasurements.titleHeight +
    truckOverlayVerticalGap;
  const truckOverlayReadyButtonTopY =
    shippingPreviewMainPaddingTop + shippingPreviewReadyButtonTopY;
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
  const paymentOverlayMethodButtonCount =
    paymentOverlayWalletMethods.length + 1;
  const paymentOverlayWalletButtonSize = Math.max(
    0,
    (paymentOverlayWalletAvailableWidth -
      paymentOverlayWalletMethodGap *
        (paymentOverlayMethodButtonCount - 1)) /
      paymentOverlayMethodButtonCount,
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
  const piccolaOverlayDescriptionRowContentWidth = Math.max(
    0,
    piccolaOverlayInnerWidth - piccolaOverlayDescriptionRowSideInset * 2,
  );
  const piccolaOverlayParagraphWidth =
    piccolaOverlayDescriptionRowContentWidth * 0.6;
  const piccolaOverlayParagraphToActionGap =
    piccolaOverlayDescriptionRowContentWidth * 0.03;
  const piccolaOverlayActionColumnWidth =
    piccolaOverlayDescriptionRowContentWidth * 0.25;
  const piccolaOverlayActionToCounterGap =
    piccolaOverlayDescriptionRowContentWidth * 0.03;
  const piccolaOverlayCounterColumnWidth =
    piccolaOverlayDescriptionRowContentWidth * 0.09;
  const piccolaOverlayBuyButtonLeft = Math.max(
    0,
    (piccolaOverlayActionColumnWidth - piccolaOverlayBuyButtonWidth) / 2,
  );
  const piccolaOverlayCounterScale =
    piccolaOverlayQuantityBoxWidth > 0
      ? Math.min(
          1,
          piccolaOverlayCounterColumnWidth / piccolaOverlayQuantityBoxWidth,
        )
      : 1;
  const piccolaOverlayQuantityFrameLeft =
    (piccolaOverlayCounterColumnWidth - piccolaOverlayQuantityBoxWidth) / 2;
  const piccolaOverlayQuantityFrameTopOffset =
    (piccolaOverlayQuantityFrameHeight * (1 - piccolaOverlayCounterScale)) / 2;
  const piccolaOverlayActionColumnHeight = Math.max(
    piccolaOverlayDescriptionHeight || 0,
    piccolaOverlayActionStackMinHeight,
  );
  const piccolaOverlayControlStackTranslateY =
    piccolaOverlayDescriptionHeight > 0
      ? (piccolaOverlayDescriptionHeight - piccolaOverlayActionColumnHeight) /
        2
      : 0;
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
  const cartOverlayProductTopDividerTopInset = 2;
  const cartOverlayProductTopDividerHeight = 0.375;
  const cartOverlayProductTopDividerCellGap = 2;
  const cartOverlayProductTopDividerGap = 30;
  const cartOverlayCreamScrollbarTop =
    overlayOrangeBandHeight + piccolaOverlayHeadingTopPadding;
  const cartOverlayProductTop =
    overlayCartProducts.length > 0
      ? Math.max(
          overlayOrangeBandHeight,
          cartOverlayCreamScrollbarTop -
            cartOverlayProductTopDividerTopInset -
            cartOverlayProductTopDividerHeight -
            cartOverlayProductTopDividerGap,
        )
      : cartOverlayCreamScrollbarTop;
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
  const cartOverlayProductOuterVerticalDividerLeftInset =
    cartOverlayProductDividerLeftInset * 0.6;
  const cartOverlayProductOuterVerticalDividerRightInset =
    cartOverlayProductDividerRightInset * 0.6;
  const cartOverlayProductDividerWidth = Math.max(
    0,
    piccolaOverlayInnerWidth -
      cartOverlayProductDividerLeftInset -
      cartOverlayProductDividerRightInset,
  );
  const cartOverlayProductOuterFrameCenter =
    (cartOverlayProductOuterVerticalDividerLeftInset +
      piccolaOverlayInnerWidth -
      cartOverlayProductOuterVerticalDividerRightInset) /
    2;
  const cartOverlayProductCenteredDividerLeftInset = Math.max(
    0,
    cartOverlayProductOuterFrameCenter - cartOverlayProductDividerWidth / 2,
  );
  const cartOverlayProductCenteredDividerRightInset = Math.max(
    0,
    piccolaOverlayInnerWidth -
      (cartOverlayProductOuterFrameCenter + cartOverlayProductDividerWidth / 2),
  );
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
  const cartOverlayProductTopDividerBaselineBottomInset =
    cartOverlayProductTopDividerTopInset +
    cartOverlayProductTopDividerHeight +
    cartOverlayProductTopDividerCellGap +
    cartOverlayProductTopDividerHeight;
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
  const cartOverlayControlsCellGap = Math.max(
    0,
    (cartOverlayProductAssetRightCellWidth -
      cartOverlayQuantityWidth -
      cartOverlayRemoveButtonWidth) /
      3,
  );
  const cartOverlayControlsCellGroupWidth =
    cartOverlayQuantityWidth +
    cartOverlayControlsCellGap +
    cartOverlayRemoveButtonWidth;
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
  const cartOverlayBottomActionPadding = truckOverlayInnerHorizontalPadding;
  const cartOverlayCheckoutButtonStackHeight =
    cartOverlayCheckoutButtonHeight * 2 + cartOverlayBottomControlsGap;
  const cartOverlayBottomControlsHeight =
    cartOverlayBottomActionPadding * 2 + cartOverlayCheckoutButtonStackHeight;
  const cartOverlayBottomBannerHeight = Math.max(
    cartOverlayBottomSummaryContentHeight,
    cartOverlayBottomControlsHeight,
  );
  const cartOverlayBottomGrandTotalDeliveryAlignedStyle = {
    top: Math.max(
      0,
      cartOverlayBottomBannerHeight -
        cartOverlayBottomActionPadding -
        cartOverlayBottomSummaryLineHeight * 2 -
        cartOverlayBottomFeeTaxSpacerHeight,
    ),
    bottom: cartOverlayBottomActionPadding,
    height: undefined,
  };
  const cartOverlayBottomGrandTotalTopAlignedStyle = {
    top: 0,
    bottom: 0,
  };
  const cartCheckoutActionButtonBottomAlignedStyle = {
    bottom: overlayOrangeBandHeight + cartOverlayBottomActionPadding,
  };
  const overlayContentActionButtonBottomAlignedStyle = {
    bottom: truckOverlayInnerHorizontalPadding,
  };
  const cartAddItemsActionButtonStyle = {
    bottom:
      overlayOrangeBandHeight +
      cartOverlayBottomActionPadding +
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
  const cartOverlayCreamScrollbarVisibleHeight = Math.max(
    0,
    truckOverlayHeight -
      cartOverlayCreamScrollbarTop -
      overlayOrangeBandHeight -
      cartOverlayBottomBannerHeight,
  );
  const shouldRenderCartOverlayCreamScrollbar =
    overlayCartProducts.length > 0 &&
    cartOverlayCreamScrollbarVisibleHeight > 0;
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
              cartOverlayCreamScrollbarVisibleHeight,
              (cartOverlayCreamVisibleHeight / cartOverlayScrollContentHeight) *
                cartOverlayCreamScrollbarVisibleHeight,
            ),
          )
        : cartOverlayCreamScrollbarVisibleHeight
      : 0;
  const cartOverlayCreamScrollbarScrollRange = Math.max(
    1,
    cartOverlayScrollContentHeight - cartOverlayCreamVisibleHeight,
  );
  const cartOverlayCreamScrollbarTravel = Math.max(
    0,
    cartOverlayCreamScrollbarVisibleHeight -
      cartOverlayCreamScrollbarThumbHeight,
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
  const cartOverlayGrandTotalAmountBoxWidthStyle =
    typeof cartOverlayGrandTotalResolvedWidth === "number"
      ? {
          width: cartOverlayGrandTotalResolvedWidth,
          minWidth: cartOverlayGrandTotalResolvedWidth,
        }
      : null;
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
    setIsTimeOverlayVisible(false);
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
    setIsTimeOverlayVisible(false);
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
    setIsTimeOverlayVisible(false);
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
        setIsTimeOverlayVisible(false);
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
    setIsTimeOverlayVisible(false);
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
    setIsTimeOverlayVisible(false);
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
    setIsTimeOverlayVisible(false);
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
    setIsTimeOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
  };
  const showTimeOverlayFromContact = () => {
    markShippingPreviewDestinationVisited("time");
    setIsCartOverlayVisible(false);
    setIsContactOverlayVisible(false);
    setIsTimeOverlayVisible(true);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
  };
  const showContactOverlayFromTime = () => {
    markShippingPreviewDestinationVisited("contact");
    setIsCartOverlayVisible(false);
    setIsContactOverlayVisible(true);
    setIsTimeOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
  };
  const showDeliveryOverlayFromTime = () => {
    markShippingPreviewDestinationVisited("delivery");
    setIsCartOverlayVisible(false);
    setIsContactOverlayVisible(false);
    setIsTimeOverlayVisible(false);
    setIsDeliveryOverlayVisible(true);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
  };
  const showTimeOverlayFromDelivery = () => {
    markShippingPreviewDestinationVisited("time");
    setIsCartOverlayVisible(false);
    setIsContactOverlayVisible(false);
    setIsTimeOverlayVisible(true);
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
    setIsTimeOverlayVisible(false);
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
    setIsTimeOverlayVisible(false);
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
    setIsTimeOverlayVisible(false);
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
    setIsTimeOverlayVisible(false);
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
    setIsTimeOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(true);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsDeliveryStateDropdownOpen(false);
  };
  const resetShopCheckoutFlow = () => {
    if (overlayImageAnimationRef.current) {
      overlayImageAnimationRef.current.stop();
      overlayImageAnimationRef.current = null;
    }

    if (overlayNavIndicatorAnimationRef.current) {
      overlayNavIndicatorAnimationRef.current.stop();
      overlayNavIndicatorAnimationRef.current = null;
    }

    if (shippingPreviewActionBandAnimationRef.current) {
      shippingPreviewActionBandAnimationRef.current.stop();
      shippingPreviewActionBandAnimationRef.current = null;
    }

    if (deliveryOverlayShakeAnimationRef.current) {
      deliveryOverlayShakeAnimationRef.current.stop();
      deliveryOverlayShakeAnimationRef.current = null;
    }

    products.forEach((product) => {
      updateOverlayProductQuantity(product.name, () => 0);
      updateOverlayProductConfirmation(product.name, false);
      discardUnconfirmedOverlayProductDraft(product.name);
    });

    overlayImageProgress.setValue(1);
    overlayNavIndicatorProgress.setValue(initialOverlayNavIndex);
    shippingPreviewActionBandProgress.setValue(0);
    deliveryOverlayShakeX.setValue(0);
    setOverlayImageOutgoingProductName(null);
    setOverlayImageDirection(-1);
    setActiveOverlayProductName(piccolaProduct.name);
    setIsCartOverlayVisible(false);
    setIsContactOverlayVisible(false);
    setIsTimeOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentOrderConfirmationVisible(false);
    setIsPlaceholderOverlayVisible(false);
    setIsOrderPlacementConfirmed(false);
    setIsOrderConfirmationOverlayVisible(false);
    setHasCartOverlayCheckoutButtonBeenTapped(false);
    setVisitedShippingPreviewDestinations({
      cart: false,
      contact: false,
      confirmation: false,
      delivery: false,
      payment: false,
      products: true,
      time: false,
    });
    setSelectedDeliveryState("");
    setSelectedPaymentOverlayMethod(null);
    setSelectedPaymentCardIssuer("");
    setStripeCardDetails(null);
    stripeCardDetailsRef.current = null;
    setAcceptedStripePaymentMethodId(null);
    setIsPaymentCardAccepted(false);
    setDeliveryFieldValues(defaultDeliveryFieldValues);
    setEmptyTouchedDeliveryFieldKeys({});
    setIsDeliveryPhoneCheckboxChecked(false);
    setIsStripePaymentInFlight(false);
    setIsPaymentCardDetailsOverlayVisible(false);
    setIsPaymentPayPalOverlayVisible(false);
    setActiveDeliveryFieldKey(null);
    setDeliveryCityDropdownScrollY(0);
    setDeliveryStateDropdownScrollY(0);
    setDeliveryTimeDropdownScrollY(0);
    setDeliveryTimeWheelVisibleIndexes({});
    setIsDeliveryCityDropdownOpen(false);
    setIsDeliveryStateDropdownOpen(false);
    setOpenDeliveryTimeDropdownKey(null);
    setIsPaymentIssuerDropdownOpen(false);
    setCartOverlayGrandTotalAmountWidth(null);
    setCartOverlayReceiptBlockWidth(null);
    setCartOverlayScrollContentHeight(0);
    setCartOverlayScrollY(0);
    setIsShopOverlayVisible(false);
    setIsTruckOverlayVisible(false);
  };
  const handleShopOverlayStickyLeftPress = () => {
    if (isPaymentOverlayVisible && isPaymentCardDetailsOverlayVisible) {
      setIsPaymentCardDetailsOverlayVisible(false);
      setActiveDeliveryFieldKey(null);
      setIsPaymentIssuerDropdownOpen(false);
      return;
    }

    if (isPaymentOverlayVisible && isPaymentPayPalOverlayVisible) {
      setIsPaymentPayPalOverlayVisible(false);
      setActiveDeliveryFieldKey(null);
      return;
    }

    resetShopCheckoutFlow();
  };
  const showPaymentOrderConfirmationPrompt = () => {
    setIsPaymentOrderConfirmationVisible(true);
    setIsPaymentCardDetailsOverlayVisible(false);
    setIsPaymentPayPalOverlayVisible(false);
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
    setIsTimeOverlayVisible(false);
    setIsDeliveryOverlayVisible(false);
    setIsPaymentOverlayVisible(false);
    setIsPaymentCardDetailsOverlayVisible(false);
    setIsPaymentPayPalOverlayVisible(false);
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

    if (
      selectedPaymentOverlayMethod !== paymentOverlayCardMethod &&
      selectedPaymentOverlayMethod !== paymentOverlayGooglePayMethod &&
      selectedPaymentOverlayMethod !== paymentOverlayApplePayMethod
    ) {
      showPaymentAlert(
        "Payment method unavailable",
        "Use Debit/Credit Card, Google Pay, or Apple Pay for this Stripe checkout.",
      );
      return;
    }

    if (selectedPaymentOverlayMethod === paymentOverlayApplePayMethod) {
      if (Platform.OS !== "ios") {
        showPaymentAlert(
          "Apple Pay unavailable",
          "Apple Pay is only available on iPhone. Use Debit/Credit Card or Google Pay on this device.",
        );
        return;
      }

      if (isExpoGo) {
        showPaymentAlert(
          "Apple Pay needs a development build",
          "Expo Go cannot open the native Apple Pay sheet. Use an iOS development build or App Store build to test Apple Pay.",
        );
        return;
      }

      if (!stripeMerchantIdentifier) {
        showPaymentAlert(
          "Apple Pay setup needed",
          "Add EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER to mob/.env so StripeProvider can use your Apple merchant ID.",
        );
        return;
      }

      if (!isApplePaySupported) {
        showPaymentAlert(
          "Apple Pay unavailable",
          "This iPhone is not ready for Apple Pay. Make sure Wallet has an active card, then try again.",
        );
        return;
      }
    } else if (selectedPaymentOverlayMethod === paymentOverlayGooglePayMethod) {
      if (Platform.OS !== "android") {
        showPaymentAlert(
          "Google Pay unavailable",
          "Google Pay is only available on Android. Use Debit/Credit Card on this device.",
        );
        return;
      }

      if (isExpoGo) {
        showPaymentAlert(
          "Google Pay needs a development build",
          "Expo Go cannot open the native Google Pay sheet. Use an Android development build or Play Store build to test Google Pay.",
        );
        return;
      }

      if (!isGooglePaySupported) {
        showPaymentAlert(
          "Google Pay unavailable",
          "This device is not ready for Google Pay. Make sure Google Wallet is set up, then try again.",
        );
        return;
      }
    } else if (
      !isPaymentCardAccepted ||
      !stripeCardDetails?.complete ||
      !acceptedStripePaymentMethodId
    ) {
      showPaymentAlert(
        "Card details needed",
        "Enter a complete card number, expiration date, and CVV.",
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
      if (selectedPaymentOverlayMethod === paymentOverlayApplePayMethod) {
        await confirmApplePayPayment(
          paymentSheet.paymentIntentClientSecret,
          paymentSheet,
        );
      } else if (selectedPaymentOverlayMethod === paymentOverlayGooglePayMethod) {
        await confirmGooglePayPayment(paymentSheet.paymentIntentClientSecret);
      } else {
        const confirmResult = await confirmPayment(
          paymentSheet.paymentIntentClientSecret,
          {
            paymentMethodType: "Card",
            paymentMethodData: {
              billingDetails: buildStripeBillingDetails(),
              paymentMethodId: acceptedStripePaymentMethodId,
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
          !["Succeeded", "Processing"].includes(
            confirmResult.paymentIntent.status,
          )
        ) {
          throw new Error(
            `Payment status is ${confirmResult.paymentIntent.status}. Please try again.`,
          );
        }
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

    if (isContactTimeActionVisible) {
      showTimeOverlayFromContact();
      return;
    }

    if (isTimeDeliveryActionVisible) {
      showDeliveryOverlayFromTime();
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

    if (isContactTimeActionVisible) {
      showCartOverlayFromContact();
      return;
    }

    if (isTimeDeliveryActionVisible) {
      showContactOverlayFromTime();
      return;
    }

    if (isDeliveryPaymentActionVisible) {
      showTimeOverlayFromDelivery();
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

    if (isContactTimeActionVisible) {
      showTimeOverlayFromContact();
      return;
    }

    if (isTimeDeliveryActionVisible) {
      showDeliveryOverlayFromTime();
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
    if (Platform.OS !== "android") return undefined;

    const keyboardShowSubscription = Keyboard.addListener(
      "keyboardDidShow",
      () => setIsAndroidKeyboardVisible(true),
    );
    const keyboardHideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      () => setIsAndroidKeyboardVisible(false),
    );

    return () => {
      keyboardShowSubscription.remove();
      keyboardHideSubscription.remove();
    };
  }, []);

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
    setIsTimeOverlayVisible(false);
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
    setIsTimeOverlayVisible(false);
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
    let isMounted = true;

    const checkPlatformPaySupport = async () => {
      if (isExpoGo) {
        if (isMounted) {
          setIsGooglePaySupported(false);
          setIsApplePaySupported(false);
        }
        return;
      }

      if (Platform.OS === "android") {
        try {
          const isSupported = await isPlatformPaySupported({
            googlePay: {
              testEnv: !isStripeLiveMode,
            },
          });

          if (isMounted) {
            setIsGooglePaySupported(Boolean(isSupported));
            setIsApplePaySupported(false);
          }
        } catch {
          if (isMounted) {
            setIsGooglePaySupported(false);
            setIsApplePaySupported(false);
          }
        }

        return;
      }

      if (Platform.OS === "ios") {
        try {
          const isSupported = await isPlatformPaySupported();

          if (isMounted) {
            setIsApplePaySupported(Boolean(isSupported));
            setIsGooglePaySupported(false);
          }
        } catch {
          if (isMounted) {
            setIsApplePaySupported(false);
            setIsGooglePaySupported(false);
          }
        }

        return;
      }

      if (isMounted) {
        setIsApplePaySupported(false);
        setIsGooglePaySupported(false);
      }
    };

    checkPlatformPaySupport();

    return () => {
      isMounted = false;
    };
  }, [isPlatformPaySupported]);

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
      isTimeOverlayVisible ||
      isDeliveryOverlayVisible ||
      isPaymentOverlayVisible
    ) {
      return;
    }

    setActiveDeliveryFieldKey(null);
  }, [
    isContactOverlayVisible,
    isTimeOverlayVisible,
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
    if (!isDeliveryCityDropdownOpen) {
      setDeliveryCityDropdownAnchor(null);
      setDeliveryCityDropdownScrollY(0);
      return;
    }

    measureDeliveryCityDropdownAnchor();
  }, [isDeliveryCityDropdownOpen]);

  useEffect(() => {
    if (!openDeliveryTimeDropdownKey) {
      setDeliveryTimeDropdownAnchor(null);
      setDeliveryTimeDropdownScrollY(0);
      return;
    }

    measureDeliveryTimeDropdownAnchor(openDeliveryTimeDropdownKey);
  }, [openDeliveryTimeDropdownKey]);

  useEffect(() => {
    if (!isTruckOverlayVisible || !isTimeOverlayVisible) {
      setOpenDeliveryTimeDropdownKey(null);
    }
  }, [isTimeOverlayVisible, isTruckOverlayVisible]);

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
            {!isOrderPlacementConfirmed ? (
              <OptionOneButtonGradient variant="orange" />
            ) : null}
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
          {!isTruckOverlayVisible ? (
            <OptionOneButtonGradient variant="orange" />
          ) : null}
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
                  : isContactTimeActionVisible
                    ? "Date & Time"
                    : isTimeDeliveryActionVisible
                      ? "Address"
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
            {!shouldDimShippingPreviewRightAction &&
            !isOrderPlacementConfirmed ? (
              <OptionOneButtonGradient variant="orange" />
            ) : null}
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
    const isCityField = field.type === "city";
    const isStateField = field.type === "state";
    const isPaymentIssuerField = field.type === "paymentIssuer";
    const isDeliveryTimeDropdownField = Boolean(
      deliveryTimeDropdownOptionsByType[field.type],
    );
    const isDropdownField =
      isCityField ||
      isStateField ||
      isPaymentIssuerField ||
      isDeliveryTimeDropdownField;
    const isDeliveryFieldDisabled = Boolean(field.disabled);
    const shouldForceDeliveryFieldSurface = Boolean(field.forceSurface);
    const deliveryFieldValue = isCityField
      ? selectedDeliveryCity
      : isStateField
        ? selectedDeliveryState
        : isPaymentIssuerField
          ? selectedPaymentCardIssuer
          : deliveryFieldValues[field.key] || "";
    const hasSelectedDropdownOption =
      (isCityField && deliveryServiceAreaCityOptions.includes(selectedDeliveryCity)) ||
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
    const shouldShowDeliveryFieldFault =
      (isCityField && shouldShowDeliveryCityServiceMessage) ||
      (isStateField && shouldShowFloridaOnlyDeliveryMessage) ||
      (field.key === "email" && shouldShowContactOverlayEmailAtMessage) ||
      (field.key === "zip" && shouldShowDeliveryZipServiceMessage) ||
      (!isDropdownField && Boolean(emptyTouchedDeliveryFieldKeys[field.key]));
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
          field.compact && shopStyles.deliveryOverlayFieldCompact,
          shouldUseStateFieldSurface &&
            shopStyles.deliveryOverlayFieldStateSurface,
          field.width ? { flex: 0, width: field.width } : null,
          field.flex ? { flex: field.flex } : null,
          shouldUseStateFieldSurface && shopStyles.deliveryOverlayStateField,
          shouldShowDeliveryFieldFault && shopStyles.deliveryOverlayFieldFaulty,
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
                field.compact &&
                  shopStyles.deliveryOverlayFieldPromptTextCompact,
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
                isCityField
                  ? "City"
                  : isStateField
                    ? "State"
                    : isPaymentIssuerField
                      ? "Issuer"
                      : fieldPromptLabel || field.label
              }
              accessibilityRole="button"
              accessibilityState={{
                expanded: isCityField
                  ? isDeliveryCityDropdownOpen
                  : isStateField
                    ? isDeliveryStateDropdownOpen
                    : isPaymentIssuerField
                      ? isPaymentIssuerDropdownOpen
                      : openDeliveryTimeDropdownKey === field.key,
              }}
              ref={
                isCityField
                  ? deliveryCityButtonRef
                  : isStateField
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
                if (isCityField && isDeliveryCityDropdownOpen) {
                  measureDeliveryCityDropdownAnchor();
                }

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
                isCityField
                  ? toggleDeliveryCityDropdown
                  : isStateField
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
            onChangeText={(text) => updateDeliveryFieldValue(field.key, text)}
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
              field.compact && shopStyles.deliveryOverlayFieldInputCompact,
              shouldUseStateFieldSurface &&
                shopStyles.deliveryOverlayFieldInputStateSurface,
              shouldShowDeliveryFieldFault &&
                shopStyles.deliveryOverlayFieldInputFaulty,
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
                  setIsDeliveryCityDropdownOpen(false);
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
          <View>
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
            {shouldShowContactOverlayEmailAtMessage ? (
              <Text
                allowFontScaling={false}
                numberOfLines={2}
                style={shopStyles.deliveryOverlayContactEmailErrorText}
              >
                Email must include a '@' character
              </Text>
            ) : null}
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
      const rowHasCityField = rowFields.some(
        (field) =>
          field.type === "city" ||
          field.fields?.some((groupField) => groupField.type === "city"),
      );
      const rowHasZipField = rowFields.some(
        (field) =>
          field.key === "zip" ||
          field.fields?.some((groupField) => groupField.key === "zip"),
      );
      const shouldShowRowDeliveryMessage =
        (rowHasStateField && shouldShowFloridaOnlyDeliveryMessage) ||
        (rowHasCityField && shouldShowDeliveryCityServiceMessage) ||
        (rowHasZipField && shouldShowDeliveryZipServiceMessage);
      const deliveryRowMessageText =
        rowHasStateField && shouldShowFloridaOnlyDeliveryMessage
          ? "Only Florida deliveries available at this time"
          : "Only Miami-Dade or Broward deliveries available at this time";
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
              rowFields.some((field) => field.compact) &&
                shopStyles.deliveryOverlayRowCompact,
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
                {deliveryRowMessageText}
              </Text>
            </View>
          ) : null}
        </View>
      );
    });

  const renderPaymentCardDetailsOverlay = () => (
    <View
      style={[
        shopStyles.confirmationOverlayOrderPopupLayer,
        shopStyles.confirmationOverlayOrderPopupLayerFull,
      ]}
    >
      <View
        style={[
          shopStyles.confirmationOverlayOrderPopup,
          shopStyles.confirmationOverlayOrderPopupFull,
          shopStyles.paymentOverlayCardDetailsPopup,
        ]}
      >
        <View
          style={shopStyles.paymentOverlayCardDetailsScroll}
        >
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
                  postalCode: "ZIP",
                }}
                postalCodeEnabled
                style={shopStyles.paymentOverlayStripeCardForm}
              />
            </View>
          </View>
        </View>
        <Pressable
          accessibilityLabel="Done"
          accessibilityRole="button"
          onPress={acceptPaymentCardDetailsOverlay}
          style={shopStyles.paymentOverlayCardDetailsDoneButton}
        >
          <OptionOneButtonGradient variant="orange" />
          <Text style={shopStyles.cartOverlayCheckoutButtonText}>Done</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderPayPalPaymentOverlay = () => (
    <View
      style={[
        shopStyles.confirmationOverlayOrderPopupLayer,
        shopStyles.confirmationOverlayOrderPopupLayerFull,
      ]}
    >
      <View
        style={[
          shopStyles.confirmationOverlayOrderPopup,
          shopStyles.confirmationOverlayOrderPopupFull,
          shopStyles.paymentOverlayCardDetailsPopup,
          shopStyles.paymentOverlayPayPalPopup,
        ]}
      >
        <View style={shopStyles.paymentOverlayPayPalContent}>
          <Image
            resizeMode="contain"
            source={paymentOverlayWalletMethodIcons.PayPal}
            style={shopStyles.paymentOverlayPayPalLogo}
          />
          <Text
            allowFontScaling={false}
            style={shopStyles.paymentOverlayPayPalTitle}
          >
            PayPal
          </Text>
          <Text
            allowFontScaling={false}
            style={shopStyles.paymentOverlayPayPalBody}
          >
            Paying with PayPal requires redirection to PayPal's official
            website.{"\n\n"}Continue to PayPal.com for secure log-in and payment
            completion?
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Continue to PayPal"
          accessibilityRole="button"
          onPress={openPayPalPaymentLink}
          style={shopStyles.paymentOverlayCardDetailsDoneButton}
        >
          <OptionOneButtonGradient variant="orange" />
          <Text style={shopStyles.cartOverlayCheckoutButtonText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderConfirmationCartTextAssets = () => (
    <View
      pointerEvents="none"
      style={shopStyles.confirmationOverlayCartTextAssets}
    >
      <View
        style={[
          shopStyles.cartOverlayBottomProductRows,
          shopStyles.confirmationOverlayCartTextProductRows,
        ]}
      >
        {overlayCartBillableProducts.map((product) => {
          const productQuantity = overlayProductQuantities[product.name] || 0;
          const productPrice = product.overlayPrice || product.price;

          return (
            <View
              key={product.name}
              style={shopStyles.cartOverlayBottomSummaryRow}
            >
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={[
                  shopStyles.cartOverlayBottomProductName,
                  shopStyles.confirmationOverlayCartTextScaledName,
                ]}
              >
                {`${product.name} x ${productQuantity}`}
              </Text>
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={[
                  shopStyles.cartOverlayBottomQuantity,
                  shopStyles.confirmationOverlayCartTextScaledValue,
                ]}
              />
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={[
                  shopStyles.cartOverlayBottomTotal,
                  shopStyles.confirmationOverlayCartTextScaledValue,
                ]}
              >
                {formatCartPriceTotal(productPrice, productQuantity)}
              </Text>
            </View>
          );
        })}
      </View>
      <View
        style={[
          shopStyles.cartOverlayBottomSummaryColumn,
          shopStyles.confirmationOverlayCartTextSummaryColumn,
        ]}
      >
        {overlayCartBillableProducts.length > 0 ? (
          <>
            <View
              pointerEvents="none"
              style={shopStyles.confirmationOverlayCartTextInnerDivider}
            />
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
                  shopStyles.confirmationOverlayCartTextScaledName,
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
                  shopStyles.confirmationOverlayCartTextScaledValue,
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
                  shopStyles.confirmationOverlayCartTextScaledName,
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
                  shopStyles.confirmationOverlayCartTextScaledValue,
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
        style={shopStyles.confirmationOverlayCartTextGrandTotalAnchor}
      >
        <View
          style={shopStyles.confirmationOverlayCartTextGrandTotalBox}
        >
          <View style={shopStyles.confirmationOverlayCartTextGrandTotalLabelCell}>
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              style={shopStyles.confirmationOverlayCartTextGrandTotalLabelText}
            >
              TOTAL
            </Text>
          </View>
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={shopStyles.confirmationOverlayCartTextGrandTotalAmountCell}
          >
            {formatCartCurrency(cartOverlayGrandTotal)}
          </Text>
        </View>
      </View>
    </View>
  );

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
            <>
              {renderConfirmationCartTextAssets()}
              <Text
                allowFontScaling={false}
                style={shopStyles.confirmationOverlayOrderPopupText}
              >
                {"Are you sure you want to place this order with\n"}
                <Text style={shopStyles.confirmationOverlayOrderPopupTextBrand}>
                  Alla Vostra
                </Text>
                {"?"}
              </Text>
            </>
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
        <View
          style={[
            shopStyles.main,
            {
              paddingTop: shippingPreviewMainPaddingTop,
            },
          ]}
        >
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
              style={[
                shopStyles.shippingPreviewRow,
                {
                  marginTop: shippingPreviewInterStackGap,
                },
              ]}
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
                  preview.key !== "soflo" && {
                    marginBottom: shippingPreviewInterStackGap,
                  },
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
                    <View
                      key={preview.key}
                      onLayout={({ nativeEvent: { layout } }) =>
                        updateShippingPreviewMeasurement(
                          "truckHeight",
                          layout.height,
                        )
                      }
                      style={previewRowStyle}
                    >
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
                              "sofloHeight",
                              layout.height,
                            );
                          }
                        : ({ nativeEvent: { layout } }) =>
                            updateShippingPreviewMeasurement(
                              "bargainHeight",
                              layout.height,
                            )
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
              hidden: true,
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
                  !isTimeOverlayVisible &&
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
                <LinearGradient
                  colors={topOverlayGradientColors}
                  locations={[0, 0.52, 1]}
                  pointerEvents="none"
                  start={{ x: 0.5, y: 1 }}
                  end={{ x: 0.5, y: 0 }}
                  style={[
                    shopStyles.piccolaOverlayTopFill,
                    (isCartOverlayVisible ||
                      isContactOverlayVisible ||
                      isTimeOverlayVisible ||
                      isDeliveryOverlayVisible ||
                      isPaymentOverlayVisible ||
                      isPlaceholderOverlayVisible) &&
                      shopStyles.cartOverlayTopFill,
                  ]}
                />
                <LinearGradient
                  colors={orangeButtonGradientColors}
                  locations={[0, 0.52, 1]}
                  pointerEvents="none"
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
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
                      style={[
                        shopStyles.cartOverlayBottomGrandTotalAnchor,
                        cartOverlayBottomGrandTotalDeliveryAlignedStyle,
                      ]}
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
                          cartOverlayBottomGrandTotalTopAlignedStyle,
                          cartOverlayGrandTotalWidthStyle,
                        ]}
                      >
                        <View
                          style={[
                            shopStyles.cartOverlayBottomGrandTotalOuterBox,
                            cartOverlayGrandTotalWidthStyle,
                          ]}
                        >
                          <View style={shopStyles.cartOverlayBottomGrandTotalStack}>
                            <View
                              style={shopStyles.cartOverlayBottomGrandTotalLabel}
                            >
                              {cartOverlayGrandTotalLetters.map(
                                (letter, index) => (
                                  <Text
                                    allowFontScaling={false}
                                    key={`${letter}-${index}`}
                                    style={
                                      shopStyles.cartOverlayBottomGrandTotalLabelLetter
                                    }
                                  >
                                    {letter}
                                  </Text>
                                ),
                              )}
                            </View>
                            <Text
                              numberOfLines={1}
                              style={[
                                shopStyles.cartOverlayBottomGrandTotalAmount,
                                cartOverlayGrandTotalAmountBoxWidthStyle,
                              ]}
                            >
                              {formatCartCurrency(cartOverlayGrandTotal)}
                            </Text>
                          </View>
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
                        overlayCartProducts.length > 0 && {
                          paddingBottom: cartOverlayProductTopDividerGap,
                        },
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
                              cartOverlayCreamVerticalInset * 2 +
                              cartOverlayProductTopDividerBottomInset -
                              cartOverlayProductTopDividerBaselineBottomInset;
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
                            const productEntryHorizontalDividerThickness =
                              cartOverlayProductTopDividerHeight;
                            const productEntryHorizontalDividerCenterY =
                              productEntryMiniHorizontalDividerTop +
                              productEntryHorizontalDividerThickness / 2;
                            const productEntryLeftHorizontalDividerCenterX =
                              productEntryLeftHorizontalDividerLeft +
                              productEntryLeftHorizontalDividerWidth / 2;
                            const productEntryRightHorizontalDividerCenterX =
                              productEntryRightHorizontalDividerLeft +
                              productEntryRightHorizontalDividerWidth / 2;
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
                            const productEntryFrameHeight =
                              productEntryBottomDividerInnerEdge +
                              cartOverlayProductTopDividerHeight;
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
                            const productEntryOuterTopVerticalDividerHeight =
                              productEntryTopVerticalDividerHeight * 2.16;
                            const productEntryTopVerticalDividerCenter =
                              productEntryTopVerticalDividerTop +
                              productEntryTopVerticalDividerHeight / 2;
                            const productEntryOuterTopVerticalDividerGap =
                              Math.max(
                                0,
                                (productEntryTopVerticalDividerSpace -
                                  productEntryOuterTopVerticalDividerHeight) /
                                  2,
                              );
                            const productEntryOuterBottomVerticalDividerHeight =
                              Math.max(
                                0,
                                productEntryBottomVerticalDividerSpace -
                                  productEntryOuterTopVerticalDividerGap * 2,
                              );
                            const productEntryBottomVerticalDividerCenter =
                              productEntryMiniHorizontalDividerTop +
                              productEntryOuterTopVerticalDividerGap +
                              productEntryOuterBottomVerticalDividerHeight / 2;
                            const productEntryOuterTopVerticalDividerBottom =
                              productEntryTopVerticalDividerCenter +
                              productEntryOuterTopVerticalDividerHeight / 2;
                            const productEntryOuterBottomVerticalDividerTop =
                              productEntryBottomVerticalDividerCenter -
                              productEntryOuterBottomVerticalDividerHeight / 2;
                            const productEntryOuterVerticalDividerConnectorHeight =
                              Math.max(
                                0,
                                productEntryOuterBottomVerticalDividerTop -
                                  productEntryOuterTopVerticalDividerBottom,
                              );
                            const productEntrySecondTopDividerTop =
                              index === 0
                                ? cartOverlayCreamScrollbarTop -
                                  cartOverlayProductTop
                                : cartOverlayProductSecondTopDividerTopInset;
                            const productEntryGridOffsetY =
                              productEntrySecondTopDividerTop -
                              cartOverlayProductSecondTopDividerTopInset;
                            const productEntryRenderedFrameHeight = Math.max(
                              0,
                              productEntryFrameHeight +
                                (index === 0 ? productEntryGridOffsetY : 0),
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
                                      height: productEntryRenderedFrameHeight,
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
                                          cartOverlayProductCenteredDividerLeftInset,
                                        right:
                                          cartOverlayProductCenteredDividerRightInset,
                                        top:
                                          cartOverlayProductSecondTopDividerTopInset +
                                          productEntryGridOffsetY,
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
                                          cartOverlayProductCenteredDividerLeftInset,
                                        right:
                                          cartOverlayProductCenteredDividerRightInset,
                                        top:
                                          productEntryBottomDividerInnerEdge +
                                          productEntryGridOffsetY,
                                      },
                                    ]}
                                  />
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductVerticalDivider,
                                      {
                                        left:
                                          cartOverlayProductOuterVerticalDividerLeftInset,
                                        top:
                                          productEntryTopVerticalDividerCenter +
                                          productEntryGridOffsetY,
                                        height:
                                          productEntryOuterTopVerticalDividerHeight,
                                        transform: [
                                          {
                                            translateY:
                                              -productEntryOuterTopVerticalDividerHeight /
                                              2,
                                          },
                                        ],
                                      },
                                    ]}
                                  />
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductVerticalDivider,
                                      {
                                        left:
                                          cartOverlayProductOuterVerticalDividerLeftInset,
                                        top:
                                          productEntryOuterTopVerticalDividerBottom +
                                          productEntryGridOffsetY,
                                        height:
                                          productEntryOuterVerticalDividerConnectorHeight,
                                      },
                                    ]}
                                  />
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductVerticalDivider,
                                      {
                                        right:
                                          cartOverlayProductOuterVerticalDividerRightInset,
                                        top:
                                          productEntryOuterTopVerticalDividerBottom +
                                          productEntryGridOffsetY,
                                        height:
                                          productEntryOuterVerticalDividerConnectorHeight,
                                      },
                                    ]}
                                  />
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductVerticalDivider,
                                      {
                                        right:
                                          cartOverlayProductOuterVerticalDividerRightInset,
                                        top:
                                          productEntryTopVerticalDividerCenter +
                                          productEntryGridOffsetY,
                                        height:
                                          productEntryOuterTopVerticalDividerHeight,
                                        transform: [
                                          {
                                            translateY:
                                              -productEntryOuterTopVerticalDividerHeight /
                                              2,
                                          },
                                        ],
                                      },
                                    ]}
                                  />
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductVerticalDivider,
                                      {
                                        left:
                                          cartOverlayProductOuterVerticalDividerLeftInset,
                                        top:
                                          productEntryBottomVerticalDividerCenter +
                                          productEntryGridOffsetY,
                                        height:
                                          productEntryOuterBottomVerticalDividerHeight,
                                        transform: [
                                          {
                                            translateY:
                                              -productEntryOuterBottomVerticalDividerHeight /
                                              2,
                                          },
                                        ],
                                      },
                                    ]}
                                  />
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductVerticalDivider,
                                      {
                                        right:
                                          cartOverlayProductOuterVerticalDividerRightInset,
                                        top:
                                          productEntryBottomVerticalDividerCenter +
                                          productEntryGridOffsetY,
                                        height:
                                          productEntryOuterBottomVerticalDividerHeight,
                                        transform: [
                                          {
                                            translateY:
                                              -productEntryOuterBottomVerticalDividerHeight /
                                              2,
                                          },
                                        ],
                                      },
                                    ]}
                                  />
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductVerticalDivider,
                                      shopStyles.cartOverlayProductInGridDivider,
                                      {
                                        left:
                                          cartOverlayProductVerticalDividerLeft,
                                        top:
                                          productEntryTopVerticalDividerTop +
                                          productEntryGridOffsetY,
                                        height:
                                          productEntryTopVerticalDividerHeight,
                                      },
                                    ]}
                                  />
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductVerticalDivider,
                                      shopStyles.cartOverlayProductInGridDivider,
                                      {
                                        left:
                                          cartOverlayProductVerticalDividerLeft,
                                        top:
                                          productEntryBottomVerticalDividerTop +
                                          productEntryGridOffsetY,
                                        height:
                                          productEntryBottomVerticalDividerHeight,
                                      },
                                    ]}
                                  />
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductVerticalDivider,
                                      shopStyles.cartOverlayProductInGridDivider,
                                      {
                                        left:
                                          productEntryLeftHorizontalDividerCenterX -
                                          productEntryHorizontalDividerThickness /
                                            2,
                                        top:
                                          productEntryHorizontalDividerCenterY -
                                          productEntryLeftHorizontalDividerWidth /
                                            2 +
                                          productEntryGridOffsetY,
                                        height:
                                          productEntryLeftHorizontalDividerWidth,
                                        transform: [{ rotate: "90deg" }],
                                      },
                                    ]}
                                  />
                                  <View
                                    pointerEvents="none"
                                    style={[
                                      shopStyles.cartOverlayProductVerticalDivider,
                                      shopStyles.cartOverlayProductInGridDivider,
                                      {
                                        left:
                                          productEntryRightHorizontalDividerCenterX -
                                          productEntryHorizontalDividerThickness /
                                            2,
                                        top:
                                          productEntryHorizontalDividerCenterY -
                                          productEntryRightHorizontalDividerWidth /
                                            2 +
                                          productEntryGridOffsetY,
                                        height:
                                          productEntryRightHorizontalDividerWidth,
                                        transform: [{ rotate: "90deg" }],
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
                                          productEntryTopInset +
                                          productEntryGridOffsetY,
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
                                          productEntryTopInset +
                                          productEntryGridOffsetY,
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
                                        top:
                                          productEntryBottomCellTop +
                                          productEntryGridOffsetY,
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
                                        top:
                                          productEntryBottomCellTop +
                                          productEntryGridOffsetY,
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
                                        {
                                          width:
                                            cartOverlayControlsCellGroupWidth,
                                          columnGap:
                                            cartOverlayControlsCellGap,
                                        },
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
                            top: cartOverlayCreamScrollbarTop,
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
                        {isCartOverlayCreamScrollbarActive ? (
                          <LinearGradient
                            colors={topOverlayGradientColors}
                            locations={[0, 0.52, 1]}
                            pointerEvents="none"
                            start={{ x: 0.5, y: 1 }}
                            end={{ x: 0.5, y: 0 }}
                            style={[
                              shopStyles.cartOverlayCreamScrollbarThumb,
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
                        ) : (
                          <View
                            style={[
                              shopStyles.cartOverlayCreamScrollbarThumb,
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
                        )}
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
                      {!isCartOverlayCheckoutButtonDimmed ? (
                        <OptionOneButtonGradient variant="orange" />
                      ) : null}
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
                  <Animated.View
                    style={[
                      shopStyles.deliveryOverlayContent,
                      deliveryOverlayShakeStyle,
                    ]}
                  >
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
                          : showTimeOverlayFromContact
                      }
                      style={[
                        shopStyles.paymentOverlayCheckoutButton,
                        overlayContentActionButtonBottomAlignedStyle,
                        shouldDimContactProgressionButton &&
                          shopStyles.paymentOverlayCheckoutButtonDimmed,
                      ]}
                    >
                      {!shouldDimContactProgressionButton ? (
                        <OptionOneButtonGradient variant="orange" />
                      ) : null}
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
                  </Animated.View>
                ) : isTimeOverlayVisible || isDeliveryOverlayVisible ? (
                  <Animated.View
                    style={[
                      shopStyles.deliveryOverlayContent,
                      deliveryOverlayShakeStyle,
                    ]}
                  >
                    {(isTimeOverlayVisible
                      ? deliveryTimeOverlayRows
                      : deliveryOverlayRows
                    ).map((row, rowIndex) => {
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
                      const rowHasCityField = rowFields.some(
                        (field) =>
                          field.type === "city" ||
                          field.fields?.some(
                            (groupField) => groupField.type === "city",
                          ),
                      );
                      const rowHasZipField = rowFields.some(
                        (field) =>
                          field.key === "zip" ||
                          field.fields?.some(
                            (groupField) => groupField.key === "zip",
                          ),
                      );
                      const shouldShowRowDeliveryMessage =
                        (rowHasStateField &&
                          shouldShowFloridaOnlyDeliveryMessage) ||
                        (rowHasCityField &&
                          shouldShowDeliveryCityServiceMessage) ||
                        (rowHasZipField && shouldShowDeliveryZipServiceMessage);
                      const deliveryRowMessageText =
                        rowHasStateField && shouldShowFloridaOnlyDeliveryMessage
                          ? "Only Florida deliveries available at this time"
                          : "Only Miami-Dade or Broward deliveries available at this time";
                      const renderDeliveryField = (field) => {
                        const isCityField = field.type === "city";
                        const isStateField = field.type === "state";
                        const isDeliveryTimeDropdownField = Boolean(
                          deliveryTimeDropdownOptionsByType[field.type],
                        );
                        const isDropdownField =
                          isCityField ||
                          isStateField ||
                          isDeliveryTimeDropdownField;
                        const isDeliveryFieldDisabled = Boolean(
                          field.disabled,
                        );
                        const shouldForceDeliveryFieldSurface = Boolean(
                          field.forceSurface,
                        );
                        const deliveryFieldValue = isCityField
                          ? selectedDeliveryCity
                          : isStateField
                            ? selectedDeliveryState
                            : deliveryFieldValues[field.key] || "";
                        const hasSelectedDeliveryCityOption =
                          isCityField &&
                          deliveryServiceAreaCityOptions.includes(selectedDeliveryCity);
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
                                hasSelectedDeliveryCityOption ||
                                hasSelectedDeliveryTimeOption
                              )
                            : deliveryFieldValue.trim().length === 0);
                        const shouldUseStateFieldSurface =
                          !isDeliveryFieldDisabled &&
                          (shouldForceDeliveryFieldSurface ||
                            isDeliveryFieldActive ||
                            (isDropdownField
                              ? hasSelectedDeliveryStateOption ||
                                hasSelectedDeliveryCityOption ||
                                hasSelectedDeliveryTimeOption
                              : deliveryFieldValue.trim().length > 0));
                        const shouldShowDeliveryFieldFault =
                          (isCityField &&
                            shouldShowDeliveryCityServiceMessage) ||
                          (isStateField &&
                            shouldShowFloridaOnlyDeliveryMessage) ||
                          (field.key === "email" &&
                            shouldShowContactOverlayEmailAtMessage) ||
                          (field.key === "zip" &&
                            shouldShowDeliveryZipServiceMessage) ||
                          (!isDropdownField &&
                            Boolean(emptyTouchedDeliveryFieldKeys[field.key]));
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
                              shouldShowDeliveryFieldFault &&
                                shopStyles.deliveryOverlayFieldFaulty,
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
                                    isCityField
                                      ? "City"
                                      : isStateField
                                        ? "State"
                                        : fieldPromptLabel || field.label
                                  }
                                    accessibilityRole="button"
                                    accessibilityState={{
                                    expanded: isCityField
                                      ? isDeliveryCityDropdownOpen
                                      : isStateField
                                        ? isDeliveryStateDropdownOpen
                                        : openDeliveryTimeDropdownKey ===
                                          field.key,
                                  }}
                                  ref={
                                    isCityField
                                      ? deliveryCityButtonRef
                                      : isStateField
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
                                      isCityField &&
                                      isDeliveryCityDropdownOpen
                                    ) {
                                      measureDeliveryCityDropdownAnchor();
                                    }

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
                                    isCityField
                                      ? toggleDeliveryCityDropdown
                                      : isStateField
                                        ? toggleDeliveryStateDropdown
                                        : () =>
                                            toggleDeliveryTimeDropdown(
                                              field.key,
                                            )
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
                                  updateDeliveryFieldValue(field.key, text)
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
                                  shouldShowDeliveryFieldFault &&
                                    shopStyles.deliveryOverlayFieldInputFaulty,
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
                              {deliveryRowMessageText}
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
                        disabled: isTimeOverlayVisible
                          ? shouldDimTimeProgressionButton
                          : shouldDimDeliveryProgressionButton,
                      }}
                      disabled={
                        isTimeOverlayVisible
                          ? shouldDimTimeProgressionButton
                          : shouldDimDeliveryProgressionButton
                      }
                      onPress={
                        isTimeOverlayVisible
                          ? shouldDimTimeProgressionButton
                            ? undefined
                            : showDeliveryOverlayFromTime
                          : shouldDimDeliveryProgressionButton
                          ? undefined
                          : showPaymentOverlayFromDelivery
                      }
                      style={[
                        shopStyles.paymentOverlayCheckoutButton,
                        overlayContentActionButtonBottomAlignedStyle,
                        (isTimeOverlayVisible
                          ? shouldDimTimeProgressionButton
                          : shouldDimDeliveryProgressionButton) &&
                          shopStyles.paymentOverlayCheckoutButtonDimmed,
                      ]}
                    >
                      {!(isTimeOverlayVisible
                        ? shouldDimTimeProgressionButton
                        : shouldDimDeliveryProgressionButton) ? (
                        <OptionOneButtonGradient variant="orange" />
                      ) : null}
                      <Text
                        style={[
                          shopStyles.cartOverlayCheckoutButtonText,
                          (isTimeOverlayVisible
                            ? shouldDimTimeProgressionButton
                            : shouldDimDeliveryProgressionButton) &&
                            shopStyles.cartOverlayCheckoutButtonTextDimmed,
                        ]}
                      >
                        Continue
                      </Text>
                    </Pressable>
                  </Animated.View>
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
                          <View
                            style={[
                              shopStyles.paymentOverlayCardMethodStack,
                              { width: paymentOverlayWalletButtonSize },
                            ]}
                          >
                            <Pressable
                              accessibilityLabel={paymentOverlayCardMethod}
                              accessibilityRole="button"
                              accessibilityState={{
                                selected:
                                  selectedPaymentOverlayMethod ===
                                  paymentOverlayCardMethod,
                              }}
                              onPress={openPaymentCardDetailsOverlay}
                              style={[
                                shopStyles.paymentOverlayWalletMethodButton,
                                paymentOverlayWalletButtonStyle,
                              ]}
                            >
                              <PaymentCardMethodIcon
                                height={paymentOverlayWalletButtonSize * 0.54}
                                width={paymentOverlayWalletButtonSize * 0.78}
                              />
                            </Pressable>
                            {isPaymentCardAccepted ? (
                              <View
                                pointerEvents="none"
                                style={
                                  shopStyles.paymentOverlayCardAcceptedBadge
                                }
                              >
                                <PiccolaQuantityActionIcon
                                  confirmed
                                  size={paymentOverlayWalletButtonSize * 0.32}
                                />
                              </View>
                            ) : null}
                          </View>
                          {paymentOverlayWalletMethods.map((method) => (
                            <Pressable
                              accessibilityLabel={method}
                              accessibilityRole="button"
                              accessibilityState={{
                                selected:
                                  selectedPaymentOverlayMethod === method,
                              }}
                              key={method}
                              onPress={() => selectPaymentWalletMethod(method)}
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
                      </View>
                    </ScrollView>
                    {isPaymentCardDetailsOverlayVisible &&
                    selectedPaymentOverlayMethod === paymentOverlayCardMethod
                      ? renderPaymentCardDetailsOverlay()
                      : null}
                    {isPaymentPayPalOverlayVisible &&
                    selectedPaymentOverlayMethod === paymentOverlayPayPalMethod
                      ? renderPayPalPaymentOverlay()
                      : null}
                    {isPaymentOrderConfirmationVisible ? (
                      renderOrderConfirmationContent({
                        onNoPress: closePaymentOrderConfirmationPrompt,
                      })
                    ) : null}
                    <Pressable
                      accessibilityLabel="Place order"
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: shouldDimVisiblePaymentOrderButton,
                      }}
                      disabled={shouldDimVisiblePaymentOrderButton}
                      onPress={
                        shouldDimVisiblePaymentOrderButton
                          ? undefined
                          : showPaymentOrderConfirmationPrompt
                      }
                      style={[
                        shopStyles.paymentOverlayCheckoutButton,
                        overlayContentActionButtonBottomAlignedStyle,
                        shouldDimVisiblePaymentOrderButton &&
                          shopStyles.paymentOverlayCheckoutButtonDimmed,
                      ]}
                    >
                      {!shouldDimVisiblePaymentOrderButton ? (
                        <OptionOneButtonGradient variant="orange" />
                      ) : null}
                      <Text
                        style={[
                          shopStyles.cartOverlayCheckoutButtonText,
                          shouldDimVisiblePaymentOrderButton &&
                            shopStyles.cartOverlayCheckoutButtonTextDimmed,
                        ]}
                      >
                        Place order
                      </Text>
                    </Pressable>
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
                        <LinearGradient
                          colors={topOverlayGradientColors}
                          locations={[0, 0.52, 1]}
                          pointerEvents="none"
                          start={{ x: 0.5, y: 1 }}
                          end={{ x: 0.5, y: 0 }}
                          style={[
                            shopStyles.piccolaOverlayNavActiveIndicatorSharedGradient,
                            {
                              top: -overlayOrangeBandHeight,
                              height:
                                overlayOrangeBandHeight +
                                piccolaOverlayNavBarHeight,
                            },
                          ]}
                        />
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
                        </View>
                        <View
                          onTouchStart={handleOverlayBandTouchStart}
                          onTouchMove={handleOverlayBandTouchMove}
                          onTouchEnd={handleOverlayBandTouchEnd}
                          onTouchCancel={handleOverlayBandTouchEnd}
                          style={shopStyles.piccolaOverlayImageStack}
                        >
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
                        <View
                          style={[
                            shopStyles.piccolaOverlayDescriptionRow,
                            {
                              paddingHorizontal:
                                piccolaOverlayDescriptionRowSideInset,
                            },
                          ]}
                        >
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
                            pointerEvents="none"
                            style={{
                              width: piccolaOverlayParagraphToActionGap,
                            }}
                          />
                          <View
                            style={[
                              shopStyles.piccolaOverlayActionColumn,
                              {
                                width: piccolaOverlayActionColumnWidth,
                                height: piccolaOverlayActionColumnHeight,
                                transform: [
                                  {
                                    translateY:
                                      piccolaOverlayControlStackTranslateY,
                                  },
                                ],
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
                                activeOverlayProductBadgeText === "NEW" &&
                                  shopStyles.piccolaOverlayPopularTagBlue,
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
                            </View>
                          </View>
                          <View
                            pointerEvents="none"
                            style={{
                              width: piccolaOverlayActionToCounterGap,
                            }}
                          />
                          <View
                            style={{
                              width: piccolaOverlayCounterColumnWidth,
                              height: piccolaOverlayActionColumnHeight,
                              position: "relative",
                              overflow: "visible",
                              transform: [
                                {
                                  translateY:
                                    piccolaOverlayControlStackTranslateY,
                                },
                              ],
                            }}
                          >
                            {showOverlayQuantityControls ? (
                              <View
                                style={[
                                  shopStyles.piccolaOverlayQuantityFrame,
                                  {
                                    top:
                                      piccolaOverlaySwappedBuyButtonTop +
                                      piccolaOverlayQuantityFrameTop -
                                      piccolaOverlayQuantityFrameTopOffset,
                                    left: piccolaOverlayQuantityFrameLeft,
                                    transform: [
                                      { scale: piccolaOverlayCounterScale },
                                    ],
                                  },
                                ]}
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
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
        ) : null}

        {isTruckOverlayVisible &&
        isDeliveryOverlayVisible &&
        isDeliveryCityDropdownOpen &&
        deliveryCityDropdownAnchor ? (
          <View
            pointerEvents="box-none"
            style={shopStyles.deliveryOverlayStateDropdownLayer}
          >
            <Pressable
              accessibilityLabel="Close city options"
              accessibilityRole="button"
              onPress={dismissDeliveryCityDropdownToDefault}
              style={shopStyles.deliveryOverlayStateDropdownDismissArea}
            />
            <View
              style={[
                shopStyles.deliveryOverlayStateDropdown,
                {
                  height: deliveryCityDropdownHeight,
                  left: deliveryCityDropdownAnchor.x,
                  top: deliveryCityDropdownTop,
                  width: deliveryCityDropdownAnchor.width,
                },
              ]}
            >
              <ScrollView
                directionalLockEnabled
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                onScroll={({ nativeEvent }) =>
                  setDeliveryCityDropdownScrollY(
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
                {deliveryServiceAreaCityOptions.map((option, optionIndex) => {
                  const isCenteredOption =
                    optionIndex === deliveryCityDropdownCenterIndex;
                  const isSelectedCityOption = selectedDeliveryCity === option;

                  return (
                    <Pressable
                      accessibilityLabel={`Select ${option}`}
                      accessibilityRole="button"
                      key={option}
                      onPress={() => selectDeliveryCityOption(option)}
                      style={({ pressed }) => [
                        shopStyles.deliveryOverlayStateOption,
                        (pressed || isSelectedCityOption) &&
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
                          isSelectedCityOption &&
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
      isTimeOverlayVisible &&
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

      {!shouldHideShopOverlayBottomControls
        ? renderShippingPreviewActionButton({
            frameStyle: [
              shopStyles.shippingPreviewReadyButtonLiftFrame,
              {
                bottom: safeAreaInsets.bottom + stickyCartEdgeOffset,
                left: shippingPreviewActionClusterLeft,
              },
            ],
          })
        : null}

      {isTruckOverlayVisible && !shouldHideShopOverlayBottomControls ? (
        <View
          pointerEvents="box-none"
          style={[
            shopStyles.shopOverlayStickyLeftFrame,
            {
              bottom: safeAreaInsets.bottom + stickyCartEdgeOffset,
            },
          ]}
        >
            <ButtonShadowPlate
              style={shopStyles.shopOverlayStickyLeftShadowPlate}
            />
            <Pressable
              accessibilityLabel={
                isPaymentOverlayVisible &&
                (isPaymentCardDetailsOverlayVisible ||
                  isPaymentPayPalOverlayVisible)
                  ? "Close payment popup"
                  : "Reset checkout and return to shop preview"
              }
              accessibilityRole="button"
              onPress={handleShopOverlayStickyLeftPress}
              style={shopStyles.shopOverlayStickyLeftButton}
            >
            <OptionOneButtonGradient variant="orange" />
            <View
              pointerEvents="none"
              style={shopStyles.shopOverlayStickyLeftX}
            >
              <View
                style={[
                  shopStyles.shopOverlayStickyLeftXStroke,
                  shopStyles.shopOverlayStickyLeftXStrokeForward,
                ]}
              />
              <View
                style={[
                  shopStyles.shopOverlayStickyLeftXStroke,
                  shopStyles.shopOverlayStickyLeftXStrokeBack,
                ]}
              />
            </View>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
