import {
  Animated,
  Image,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useRef, useState } from "react";

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
    style: shopStyles.shippingPreviewIconTruck,
  },
  { key: "bargain", image: require("../bargain.png"), large: false },
  {
    key: "soflo",
    image: require("../soflo.png"),
    style: shopStyles.shippingPreviewIconSoflo,
  },
];

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
  const { width: windowWidth } = useWindowDimensions();
  const headerY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isTruckOverlayVisible, setIsTruckOverlayVisible] = useState(false);
  const shippingPreviewOffsetLeft = windowWidth * 0.05 - 24;

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

                if (preview.key === "truck") {
                  return (
                    <Pressable
                      accessibilityLabel="Open truck overlay"
                      accessibilityRole="button"
                      hitSlop={10}
                      key={preview.key}
                      onPress={openTruckOverlay}
                      style={previewStyle}
                    >
                      <Image
                        source={preview.image}
                        style={shopStyles.shippingPreviewIconFill}
                        resizeMode="contain"
                      />
                    </Pressable>
                  );
                }

                return (
                  <Image
                    key={preview.key}
                    source={preview.image}
                    style={previewStyle}
                    resizeMode="contain"
                  />
                );
              })}
            </View>
            <View
              style={[
                shopStyles.shippingPill,
                shopStyles.shippingPillOverlay,
                shopStyles.shippingPreviewReadyButton,
              ]}
            >
              <Text
                style={[
                  shopStyles.shippingPillText,
                  shopStyles.shippingPillTextOverlay,
                  shopStyles.shippingPreviewReadyButtonText,
                ]}
              >
                Let's do it!
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

            <ShippingBlock image={require("../bargain.png")}>
              $10 delivery fee
            </ShippingBlock>

            <View style={shopStyles.downArrowWrap}>
              <View style={shopStyles.downArrowShaft} />
              <View style={shopStyles.downArrowHeadWrap}>
                <View style={shopStyles.downArrowHeadLeft} />
                <View style={shopStyles.downArrowHeadRight} />
              </View>
            </View>

            <ShippingBlock image={require("../soflo.png")} large reducedGap>
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
