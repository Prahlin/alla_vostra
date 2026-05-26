import { Animated, Image, Text, View } from "react-native";
import { useEffect } from "react";

import PageDivider from "../components/PageDivider";
import aboutusStyles from "../styles/aboutusStyles";
import { useHeaderScrollY } from "../utils/headerScrollContext";

export default function AboutusScreen() {
  const scrollY = useHeaderScrollY();

  useEffect(() => {
    scrollY?.setValue(0);
  }, [scrollY]);

  return (
    <View style={aboutusStyles.screen}>
      <Animated.ScrollView
        style={aboutusStyles.scroll}
        contentContainerStyle={aboutusStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={aboutusStyles.main}>
          <Text style={aboutusStyles.pageTitle}> </Text>

          <PageDivider />

          <View style={aboutusStyles.imageWrap}>
            <Image
              source={require("../convenience111.png")}
              style={aboutusStyles.aboutImage}
              resizeMode="cover"
            />
          </View>

          <View style={aboutusStyles.copy}>
            <Text style={aboutusStyles.paragraph}>
              Since we served up our very first cheeseplate, Alla Vostra has
              been about one thing and one thing only: providing our customers
              with the most intricate and delicious grazing boards you'll find
              anywhere in the Miami metropolitan area.
            </Text>

            <Text style={aboutusStyles.paragraph}>
              Whether ordering one of our products or all of them, you can count
              on the fact that a purchase from our family-owned and operated
              business is one whose taste will delight and memory bring joy long
              after the last bite has been taken and the guests have gone home.
            </Text>

            <Text style={aboutusStyles.paragraph}>
              We thank you for your patronage, and could not possibly be any
              more excited about what the relationship between our business and
              customers has to bring as we move farther into what will surely be
              an eventful, festive decade.
            </Text>

            <Text style={aboutusStyles.signature}>
              - Janny, Owner/Operator of Alla Vostra
            </Text>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}