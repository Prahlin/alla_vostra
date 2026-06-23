import { Animated, Image, Text, View, useWindowDimensions } from "react-native";

import CenterMagnifyView from "../components/CenterMagnifyView";
import MainScreenIntroSpacer from "../components/MainScreenIntroSpacer";
import aboutusStyles from "../styles/aboutusStyles";
import sharedStyles from "../styles/sharedStyles";
import { useMainScreenScrollProps } from "../utils/mainScreenScrollContext";
import { getMainScreenScrollViewProps } from "../utils/platformLayout";
import useMainScreenSwipeNavigation from "../utils/useMainScreenSwipeNavigation";

const featureImageAspectRatio = 1280 / 853;

export default function AboutusScreen() {
  const {
    compactTopLayout,
    initialContentOffset,
    scrollContentInsetStyle,
    scrollHandlers,
    scrollY,
  } =
    useMainScreenScrollProps();
  const screenSwipeHandlers = useMainScreenSwipeNavigation();
  const { width: windowWidth } = useWindowDimensions();
  const croppedImageWidth = windowWidth * 1.05;
  const croppedImageHeight = croppedImageWidth * featureImageAspectRatio;

  return (
    <View style={aboutusStyles.screen} {...screenSwipeHandlers}>
      <Animated.ScrollView
        style={aboutusStyles.scroll}
        contentContainerStyle={[
          aboutusStyles.scrollContent,
          scrollContentInsetStyle,
        ]}
        contentOffset={initialContentOffset}
        decelerationRate={0.95}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        {...getMainScreenScrollViewProps()}
        {...screenSwipeHandlers}
        {...scrollHandlers}
      >
        <View style={aboutusStyles.main}>
          <MainScreenIntroSpacer
            compactTopLayout={compactTopLayout}
            pageTitleStyle={aboutusStyles.pageTitle}
            scrollY={scrollY}
          />

          <CenterMagnifyView scrollY={scrollY} style={{ alignItems: "center" }}>
            <View
              style={[
                aboutusStyles.imageWrap,
                { width: croppedImageWidth, height: croppedImageHeight },
              ]}
            >
              <Image
                source={require("../convenience2_content_fill_mockup_1_plain_gray_gradient_mos9_tile_blend_both_mockup.png")}
                style={[
                  sharedStyles.featureImage,
                  { backgroundColor: "transparent" },
                  { height: croppedImageHeight },
                ]}
                resizeMode="contain"
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
                Whether ordering one of our products or all of them, you can
                count on the fact that a purchase from our family-owned and
                operated business is one whose taste will delight and memory
                bring joy long after the last bite has been taken and the guests
                have gone home.
              </Text>

              <Text style={aboutusStyles.paragraph}>
                We thank you for your patronage, and could not possibly be any
                more excited about what the relationship between our business and
                customers has to bring as we move farther into what will surely
                be an eventful, festive decade.
              </Text>

              <Text style={aboutusStyles.signature}>
                - Janny, Owner/Operator of Alla Vostra
              </Text>
            </View>
          </CenterMagnifyView>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
