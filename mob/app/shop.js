import { Animated, Image, Pressable, Text, View } from "react-native";
import { useRef } from "react";

import AppHeader from "../components/AppHeader";
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

function ShippingBlock({ image, children, large = false }) {
  return (
    <View style={shopStyles.shippingBlock}>
      <Image
        source={image}
        style={large ? shopStyles.shippingIconLarge : shopStyles.shippingIcon}
        resizeMode="contain"
      />
      <View style={shopStyles.shippingPill}>
        <Text style={shopStyles.shippingPillText}>{children}</Text>
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
  const headerY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

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
          <Text style={shopStyles.shippingTitle}>
            With Alla Vostra,{"\n"}you can count on...
          </Text>

          <View style={shopStyles.shippingStack}>
            <ShippingBlock image={require("../truck1.png")}>
              12 hour shipping
            </ShippingBlock>

            <Text style={shopStyles.plusSign}>+</Text>

            <ShippingBlock image={require("../bargain.png")}>
              $10 delivery fee
            </ShippingBlock>

            <Text style={shopStyles.inText}>in</Text>

            <ShippingBlock image={require("../soflo.png")} large>
              M. Dade/Broward !
            </ShippingBlock>
          </View>

          <View style={shopStyles.productsList}>
            {products.map((product) => (
              <ProductCard key={product.name} product={product} />
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}