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
      "Serving 4 guests, this mouthwatering treat is a staple at Alla Vostra that features a curated selection of the finest cheeses and charcuterie available in South Florida.",
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
const shopMainPaddingTop = 35.75;
const shippingTitleOfferingsLineHeight = Platform.select({
  web: 58.78125,
  default: 53.882813,
});
const shippingPreviewRowTopGap = 13.5;
const shippingPreviewTruckHeight = 96.811089;
const shippingPreviewTruckBottomGap = 5;
const shippingPreviewBargainHeight = 113.153906;
const shippingPreviewBargainBottomGap = -2.437;
const shippingPreviewSofloHeight = 111.684375;
const shippingPreviewReadyButtonHeight = 55.5;
const shippingPreviewReadyButtonCenterOffsetY = -8;
const shippingPreviewInitialMeasurements = {
  rowY: shippingTitleOfferingsLineHeight * 2 + shippingPreviewRowTopGap,
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
  const shippingPreviewReadyButtonCenteredMarginTop = Math.max(
    0,
    (shippingPreviewAvailableBottomY -
      shippingPreviewSofloBottomY -
      shippingPreviewMeasurements.readyHeight) /
      2 +
      shippingPreviewReadyButtonCenterOffsetY
  );
  const updateShippingPreviewMeasurement = (key, value) => {
    setShippingPreviewMeasurements((current) => {
      if (Math.abs(current[key] - value) < 0.5) return current;

      return { ...current, [key]: value };
    });
  };

  const openTruckOverlay = () => setIsTruckOverlayVisible(true);
  const closeTruckOverlay = () => setIsTruckOverlayVisible(false);

  return (
    <View style={shopStyles.screen}>
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
              style={[
                shopStyles.shippingTitleLine,
                shopStyles.shippingTitleBodyLine,
                shopStyles.shippingTitleAlwaysLine,
              ]}
            >
              Our{"\n"}Offerings
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
                      <Pressable
                        accessibilityLabel="Open truck overlay"
                        accessibilityRole="button"
                        hitSlop={10}
                        onPress={openTruckOverlay}
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
                      </Pressable>
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
            <View
              onLayout={({ nativeEvent: { layout } }) =>
                updateShippingPreviewMeasurement("readyHeight", layout.height)
              }
              style={[
                shopStyles.shippingPill,
                shopStyles.shippingPillOverlay,
                shopStyles.shippingPreviewReadyButton,
                { marginTop: shippingPreviewReadyButtonCenteredMarginTop },
              ]}
            >
              <Text
                style={[
                  shopStyles.shippingPillText,
                  shopStyles.shippingPillTextOverlay,
                  shopStyles.shippingPreviewReadyButtonText,
                  shopStyles.shippingPreviewReadyButtonTextPrimary,
                ]}
              >
                I'm ready !
              </Text>
            </View>
          </View>

          <View style={shopStyles.shippingStack}>
            <ShippingBlock
              image={require("../truck1.png")}
              onImagePress={openTruckOverlay}
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
          <View pointerEvents="box-none" style={shopStyles.truckOverlayFrame}>
            <View
              onStartShouldSetResponder={() => true}
              style={shopStyles.truckOverlayWindow}
            >
              <ShippingBlock
                blockStyleOverride={shopStyles.shippingBlockOverlay}
                image={require("../truck1_square.png")}
                imageStyleOverride={shopStyles.shippingIconOverlay}
                pillStyleOverride={shopStyles.shippingPillOverlay}
                pillTextStyleOverride={shopStyles.shippingPillTextOverlay}
              >
                12 hour shipping
              </ShippingBlock>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
