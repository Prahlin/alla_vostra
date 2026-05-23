import { Animated, ScrollView, Text, View } from "react-native";
import { useRef } from "react";

import AppHeader from "../components/AppHeader";
import shopStyles from "../styles/shopStyles";
import sharedStyles from "../styles/sharedStyles";
import ProductCard from "../components/ProductCard";

export default function ShopScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <View style={sharedStyles.screen}>
      <Animated.ScrollView
        style={sharedStyles.scroll}
        contentContainerStyle={sharedStyles.scrollContent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
          }
        )}
      >
        <AppHeader activePage="shop" scrollY={scrollY} />

        <View style={shopStyles.shopMain}>
          <Text style={shopStyles.shopTitle}>Boards & Catering</Text>

          <View style={shopStyles.shippingWrap}>
            <View style={shopStyles.shippingPill}>
              <Text style={shopStyles.shippingText}>
                Local Delivery Available
              </Text>
            </View>

            <Text style={shopStyles.shippingConnector}>•</Text>

            <View style={shopStyles.shippingPill}>
              <Text style={shopStyles.shippingText}>
                Pickup Scheduling Included
              </Text>
            </View>
          </View>

          <View style={shopStyles.productList}>
            <ProductCard
              image={require("../passion111.png")}
              title="Piccola"
              text="A compact grazing experience featuring curated meats, cheeses, fruits, sweets, crackers, and elevated spreads."
            />

            <ProductCard
              image={require("../passion211.png")}
              title="Classica"
              text="An expanded board experience with premium ingredients designed for larger gatherings and celebrations."
            />
          </View>

          <Text style={shopStyles.paymentNote}>
            Final pricing may vary depending on customization, delivery,
            quantity, and event requirements.
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}