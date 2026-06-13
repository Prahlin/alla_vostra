import {
  Animated,
  Image,
  Platform,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppHeader from "../components/AppHeader";
import PageDivider from "../components/PageDivider";
import shopStyles from "../styles/shopStyles";
import { openPaymentLink } from "../utils/openPaymentLink";

const products = [
  {
    name: "Piccola",
    price: "$70",
    image: require("../janny1brevised.png"),
    paymentUrl: "https://www.paypal.com/ncp/payment/UFKT9RHKL9YJY",
    description:
      "Serving 4, this mouthwatering treat is a curation of the finest cheeses and charcuterie found in South Florida",
  },
  {
    name: "Sei Perfetto",
    price: "$100",
    image: require("../janny2drevised.png"),
    paymentUrl: "https://www.paypal.com/ncp/payment/UFKT9RHKL9YJY",
    description:
      "Serving 6 guests, this irresistible delicacy captures the true essence of what it feels like to be around beloved family, trusted friends, and loyal clients.",
  },
  {
    name: "Buon Natale",
    price: "$130",
    image: require("../janny3erevised.png"),
    paymentUrl: "https://www.paypal.com/ncp/payment/UFKT9RHKL9YJY",
    description:
      "Serving 8 guests, this generous board brings a full Alla Vostra spread to larger gatherings, celebrations, and holiday tables.",
  },
];

const piccolaProduct = products[0];
const overlayNavProducts = [products[1], products[0], products[2]];

const shippingPreviewImages = [
  {
    key: "truck",
    image: require("../truck1_square.png"),
    label: "12 hour shipping",
    style: shopStyles.shippingPreviewIconTruck,
  },
  {
    key: "bargain",
    image: require("../bargain_square.png"),
    label: "$10 delivery",
    large: false,
  },
  {
    key: "soflo",
    image: require("../soflo_square.png"),
    label: "M. Dade/Broward",
    style: shopStyles.shippingPreviewIconSoflo,
  },
];

const shopHeaderHeight = 120;
const shopMainHorizontalPadding = 24;
const truckOverlayHorizontalMargin = shopMainHorizontalPadding * 0.5;
const truckOverlayBorderWidth = 2;
const truckOverlayInnerHorizontalPadding = truckOverlayHorizontalMargin * 2;
const piccolaOverlayActionWidth = 77.22;
const piccolaOverlayNavBarHeight = 45.36;
const shopMainPaddingTop = 26.8125;
const shippingTitleOfferingsLineHeight = Platform.select({
  web: 40.00798828125,
  default: 36.673989598125,
});
const shippingPreviewRowTopGap = 35;
const shippingPreviewTruckHeight = 96.811089;
const shippingPreviewTruckBottomGap = 40;
const shippingPreviewBargainHeight = 113.153906;
const shippingPreviewBargainBottomGap = 40;
const shippingPreviewSofloHeight = 111.684375;
const shippingPreviewReadyButtonHeight = 55.5;
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

function ShippingBlock({
  image,
  blockStyleOverride,
  children,
  large = false,
  imageStyleOverride,
  pillStyleOverride,
  pillTextStyleOverride,
  reducedGap = false,
  onImagePress,
}) {
  const imageStyle = large ? shopStyles.shippingIconLarge : shopStyles.shippingIcon;
  const reducedGapStyle = large
    ? shopStyles.shippingIconLargeReducedGap
    : shopStyles.shippingIconReducedGap;
  const imageStyles = [
    imageStyle,
    reducedGap && reducedGapStyle,
    imageStyleOverride,
  ];
  const imageElement = onImagePress ? (
    <Pressable
      accessibilityLabel="Open truck overlay"
      accessibilityRole="button"
      hitSlop={10}
      onPress={onImagePress}
      style={imageStyles}
    >
      <Image
        source={image}
        style={shopStyles.shippingIconFill}
        resizeMode="contain"
      />
    </Pressable>
  ) : (
    <Image source={image} style={imageStyles} resizeMode="contain" />
  );

  return (
    <View style={[shopStyles.shippingBlock, blockStyleOverride]}>
      {imageElement}
      <View style={[shopStyles.shippingPill, pillStyleOverride]}>
        <Text style={[shopStyles.shippingPillText, pillTextStyleOverride]}>
          {children}
        </Text>
      </View>
    </View>
  );
}

function ProductCard({ product }) {
  return (
    <View style={shopStyles.productCard}>
      <Image
        source={product.image}
        style={shopStyles.productImage}
        resizeMode="contain"
      />

      <Text style={shopStyles.productName}>{product.name}</Text>
      <Text style={shopStyles.productDescription}>{product.description}</Text>
      <Text style={shopStyles.productPrice}>{product.price}</Text>

      <Pressable
        style={shopStyles.cartButton}
        onPress={() => openPaymentLink(product.paymentUrl)}
      >
        <Text style={shopStyles.cartButtonText}>Add To Cart</Text>
      </Pressable>
    </View>
  );
}

export default function ShopScreen() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const headerY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isTruckOverlayVisible, setIsTruckOverlayVisible] = useState(false);
  const [shippingPreviewMeasurements, setShippingPreviewMeasurements] =
    useState(shippingPreviewInitialMeasurements);
  const shippingPreviewOffsetLeft = windowWidth * 0.025 - 24;
  const shippingPreviewTruckOffsetLeft = windowWidth * 0.0425;
  const shippingPreviewSofloOffsetLeft = windowWidth * 0.03125;
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
  const piccolaOverlayParagraphWidth = Math.max(
    0,
    piccolaOverlayInnerWidth -
      piccolaOverlayActionWidth -
      truckOverlayInnerHorizontalPadding
  );
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

  const openTruckOverlay = () => setIsTruckOverlayVisible(true);
  const closeTruckOverlay = () => setIsTruckOverlayVisible(false);
  const toggleTruckOverlay = () =>
    setIsTruckOverlayVisible((isVisible) => !isVisible);

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
        <AppHeader scrollY={headerY} showCarousel={false} showHero={false} />
      </View>

      <Animated.ScrollView
        style={shopStyles.scroll}
        contentContainerStyle={shopStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
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
              style={[
                shopStyles.shippingPreviewRow,
                { marginLeft: shippingPreviewOffsetLeft },
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
                ];
                const previewButton = (
                  <View
                    style={[
                      shopStyles.shippingPreviewItemButtonOuter,
                      preview.key === "soflo" &&
                        shopStyles.shippingPreviewItemButtonOuterSoflo,
                    ]}
                  >
                    <View
                      style={[
                        shopStyles.shippingPill,
                        shopStyles.shippingPillOverlay,
                        shopStyles.shippingPreviewItemButton,
                      ]}
                    >
                      <View style={shopStyles.shippingPreviewItemButtonInner}>
                        <Text
                          adjustsFontSizeToFit
                          numberOfLines={1}
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

                if (preview.key === "truck") {
                  return (
                    <View key={preview.key} style={previewRowStyle}>
                      <View
                        style={[
                          previewStyle,
                          { marginLeft: shippingPreviewTruckOffsetLeft },
                        ]}
                      >
                        <Image
                          source={preview.image}
                          style={shopStyles.shippingPreviewIconFill}
                          resizeMode="contain"
                        />
                      </View>
                      {previewButton}
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
                    <Image
                      source={preview.image}
                      style={[
                        previewStyle,
                        preview.key === "soflo" && {
                          marginLeft: shippingPreviewSofloOffsetLeft,
                        },
                      ]}
                      resizeMode="contain"
                    />
                    {previewButton}
                  </View>
                );
              })}
            </View>
            <Pressable
              accessibilityLabel={
                isTruckOverlayVisible
                  ? "Close Piccola overlay"
                  : "Open Piccola overlay"
              }
              accessibilityRole="button"
              onPress={toggleTruckOverlay}
              onLayout={({ nativeEvent: { layout } }) => {
                updateShippingPreviewMeasurement("readyY", layout.y);
                updateShippingPreviewMeasurement("readyHeight", layout.height);
              }}
              style={[
                shopStyles.shippingPill,
                shopStyles.shippingPillOverlay,
                shopStyles.shippingPreviewReadyButton,
                isTruckOverlayVisible &&
                  shopStyles.shippingPreviewBackButton,
                { marginTop: shippingPreviewReadyButtonCenteredMarginTop },
              ]}
            >
              {isTruckOverlayVisible ? (
                <>
                  <View
                    pointerEvents="none"
                    style={shopStyles.shippingPreviewBackButtonSideLeft}
                  />
                  <View
                    pointerEvents="none"
                    style={shopStyles.shippingPreviewBackButtonSideRight}
                  />
                </>
              ) : null}
              <Text
                style={[
                  shopStyles.shippingPillText,
                  shopStyles.shippingPillTextOverlay,
                  shopStyles.shippingPreviewReadyButtonText,
                  shopStyles.shippingPreviewReadyButtonTextPrimary,
                  isTruckOverlayVisible &&
                    shopStyles.shippingPreviewBackButtonText,
                ]}
              >
                {isTruckOverlayVisible ? "Back" : "I'm ready !"}
              </Text>
              {!isTruckOverlayVisible ? (
                <View style={shopStyles.shippingPreviewReadyButtonTriangle} />
              ) : (
                <View
                  style={shopStyles.shippingPreviewReadyButtonTriangleBack}
                />
              )}
            </Pressable>
          </View>

          <View style={shopStyles.shippingStack}>
            <ShippingBlock
              image={require("../truck1.png")}
              reducedGap
            >
              12 hour shipping
            </ShippingBlock>

            <View style={shopStyles.plusSignWrap}>
              <View style={shopStyles.plusSignVertical} />
              <View style={shopStyles.plusSignHorizontal} />
            </View>

            <ShippingBlock
              image={require("../bargain_square.png")}
              imageStyleOverride={shopStyles.shippingIconBargainSquare}
            >
              $10 delivery fee
            </ShippingBlock>

            <View style={shopStyles.downArrowWrap}>
              <View style={shopStyles.downArrowShaft} />
              <View style={shopStyles.downArrowHeadWrap}>
                <View style={shopStyles.downArrowHeadLeft} />
                <View style={shopStyles.downArrowHeadRight} />
              </View>
            </View>

            <ShippingBlock
              image={require("../soflo_square.png")}
              imageStyleOverride={shopStyles.shippingIconSofloSquare}
              large
              reducedGap
            >
              M. Dade/Broward !
            </ShippingBlock>
          </View>

          <PageDivider />
          <Text style={shopStyles.offersHeading}>Our offers</Text>

          <View style={shopStyles.productsList}>
            {products.map((product) => (
              <ProductCard key={product.name} product={product} />
            ))}
          </View>
        </View>
      </Animated.ScrollView>

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
              onStartShouldSetResponder={() => true}
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
                style={shopStyles.piccolaOverlayTopFill}
              />
              <View style={shopStyles.piccolaOverlayNavBar}>
                {overlayNavProducts.map((product) => (
                  <Pressable
                    accessibilityRole="button"
                    key={product.name}
                    style={[
                      shopStyles.piccolaOverlayNavItem,
                      product.name !== "Piccola" &&
                        shopStyles.piccolaOverlayNavItemInverted,
                    ]}
                  >
                    <Text
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      style={[
                        shopStyles.piccolaOverlayNavItemText,
                        product.name !== "Piccola" &&
                          shopStyles.piccolaOverlayNavItemTextInverted,
                      ]}
                    >
                      {product.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View
                pointerEvents="none"
                style={shopStyles.piccolaOverlayBottomFill}
              />
              <View
                style={[
                  shopStyles.piccolaOverlayContent,
                  {
                    height: truckOverlayContentHeight,
                    marginTop: truckOverlayContentOffsetTop,
                  },
                ]}
              >
                <Text style={shopStyles.piccolaOverlayHeading}>
                  {piccolaProduct.name}
                </Text>
                <View style={shopStyles.piccolaOverlayBody}>
                  <Image
                    source={piccolaProduct.image}
                    style={shopStyles.piccolaOverlayImage}
                    resizeMode="contain"
                  />
                  <View style={shopStyles.piccolaOverlayDescriptionRow}>
                    <View
                      style={[
                        shopStyles.piccolaOverlayDescriptionColumn,
                        { width: piccolaOverlayParagraphWidth },
                      ]}
                    >
                      <Text
                        style={shopStyles.piccolaOverlayDescription}
                      >
                        {piccolaProduct.description}
                      </Text>
                    </View>
                    <View
                      style={[
                        shopStyles.piccolaOverlayActionColumn,
                        { marginLeft: truckOverlayInnerHorizontalPadding },
                      ]}
                    >
                      <View style={shopStyles.piccolaOverlayPriceSlot}>
                        <Text style={shopStyles.piccolaOverlayPrice}>$60</Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() =>
                          openPaymentLink(piccolaProduct.paymentUrl)
                        }
                        style={shopStyles.piccolaOverlayBuyButton}
                      >
                        <Text style={shopStyles.piccolaOverlayBuyButtonText}>
                          BUY
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
