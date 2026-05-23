import { Animated, Image, Text, View } from "react-native";
import { useRef } from "react";

import AppHeader from "../components/AppHeader";
import PageDivider from "../components/PageDivider";
import sharedStyles from "../styles/sharedStyles";

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <View style={sharedStyles.screen}>
      <Animated.ScrollView
        style={sharedStyles.scroll}
        contentContainerStyle={sharedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <AppHeader activePage="home" scrollY={scrollY} showCarousel={false} showHero={false} />

        <AppHeader activePage="home" scrollY={scrollY} showOnlyCarousel />

        <AppHeader activePage="home" scrollY={scrollY} showOnlyHero />

        <View style={sharedStyles.main}>
          <Text style={sharedStyles.pageTitle}>Delicacies That Have It All</Text>

          <View style={sharedStyles.featureBlock}>
            <Image source={require("../passion111.png")} style={sharedStyles.featureImage} resizeMode="cover" />
            <Text style={sharedStyles.featureTitle}>Passion</Text>
            <Text style={sharedStyles.featureText}>
              Every Alla Vostra board is prepared with care, precision, and a love for the grazing experience.
            </Text>
          </View>

          <PageDivider />

          <View style={sharedStyles.featureBlock}>
            <Image source={require("../taste111.png")} style={sharedStyles.featureImage} resizeMode="cover" />
            <Text style={sharedStyles.featureTitle}>Taste</Text>
            <Text style={sharedStyles.featureText}>
              Our boards are built around layered flavor: cheeses, meats, fruits, sweets, spreads, and accoutrements.
            </Text>
          </View>

          <PageDivider />

          <View style={sharedStyles.featureBlock}>
            <Image source={require("../convenience111.png")} style={sharedStyles.featureImage} resizeMode="cover" />
            <Text style={sharedStyles.featureTitle}>Convenience</Text>
            <Text style={sharedStyles.featureText}>
              Alla Vostra brings the board to you for celebrations, family gatherings, and larger events.
            </Text>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}