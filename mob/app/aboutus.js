import { useCallback, useState } from "react";
import { Animated, Image, Text, View, useWindowDimensions } from "react-native";

import CenterMagnifyView from "../components/CenterMagnifyView";
import MainScreenIntroSpacer from "../components/MainScreenIntroSpacer";
import aboutusStyles from "../styles/aboutusStyles";
import sharedStyles from "../styles/sharedStyles";
import { useMainScreenScrollProps } from "../utils/mainScreenScrollContext";
import { getMainScreenScrollViewProps } from "../utils/platformLayout";
import { getFeatureImageWidth } from "../utils/responsiveLayout";
import useMainScreenSwipeNavigation from "../utils/useMainScreenSwipeNavigation";

const featureImageAspectRatio = 1280 / 853;
const aboutFeatureMagnifiedScale = 1.08;
const aboutFeatureMagnifyRampViewportRatio = 0.5;

function isMatchingLayout(currentLayout, nextLayout) {
  return (
    currentLayout &&
    Math.abs(currentLayout.y - nextLayout.y) < 0.5 &&
    Math.abs(currentLayout.height - nextLayout.height) < 0.5
  );
}

export default function AboutusScreen() {
  const [sectionLayouts, setSectionLayouts] = useState({});
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
  const croppedImageWidth = getFeatureImageWidth(windowWidth);
  const croppedImageHeight = croppedImageWidth * featureImageAspectRatio;
  const handleSectionLayout = useCallback(
    (sectionName) =>
      ({ nativeEvent }) => {
        const { height, y } = nativeEvent.layout;
        const nextLayout = { height, y };

        setSectionLayouts((currentLayouts) => {
          if (isMatchingLayout(currentLayouts[sectionName], nextLayout)) {
            return currentLayouts;
          }

          return {
            ...currentLayouts,
            [sectionName]: nextLayout,
          };
        });
      },
    []
  );

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

          <CenterMagnifyView
            magnifyEnterAnchorLayout={sectionLayouts.image}
            magnifyExitAnchorLayout={sectionLayouts.image}
            magnifyRampViewportRatio={aboutFeatureMagnifyRampViewportRatio}
            magnifiedScale={aboutFeatureMagnifiedScale}
            scrollY={scrollY}
            style={aboutusStyles.aboutSection}
          >
            <View
              onLayout={handleSectionLayout("image")}
              style={[
                aboutusStyles.imageWrap,
                { width: croppedImageWidth, height: croppedImageHeight },
              ]}
            >
              <Image
                pointerEvents="none"
                source={require("../convenience2_content_fill_mockup_1_plain_gray_gradient_mos9_tile_blend_both_mockup.png")}
                style={[
                  sharedStyles.featureImage,
                  { backgroundColor: "transparent" },
                  { height: croppedImageHeight },
                ]}
                resizeMode="contain"
              />
            </View>
          </CenterMagnifyView>

          <CenterMagnifyView
            magnifyEnterAnchorLayout={sectionLayouts.paragraph1}
            magnifyExitAnchorLayout={sectionLayouts.paragraph1}
            magnifyRampViewportRatio={aboutFeatureMagnifyRampViewportRatio}
            magnifiedScale={aboutFeatureMagnifiedScale}
            scrollY={scrollY}
            style={[aboutusStyles.aboutSection, aboutusStyles.copy]}
          >
            <Text
              onLayout={handleSectionLayout("paragraph1")}
              style={[
                aboutusStyles.paragraph,
                aboutusStyles.paragraphSectionGap,
              ]}
            >
              Since we served up our very first cheeseplate, Alla Vostra has
              been about one thing and one thing only: providing our customers
              with the most intricate and delicious grazing boards you'll find
              anywhere in the Miami metropolitan area.
            </Text>
          </CenterMagnifyView>

          <CenterMagnifyView
            magnifyEnterAnchorLayout={sectionLayouts.paragraph2}
            magnifyExitAnchorLayout={sectionLayouts.paragraph2}
            magnifyRampViewportRatio={aboutFeatureMagnifyRampViewportRatio}
            magnifiedScale={aboutFeatureMagnifiedScale}
            scrollY={scrollY}
            style={[aboutusStyles.aboutSection, aboutusStyles.copy]}
          >
            <Text
              onLayout={handleSectionLayout("paragraph2")}
              style={[
                aboutusStyles.paragraph,
                aboutusStyles.paragraphSectionGap,
              ]}
            >
              Whether ordering one of our products or all of them, you can count
              on the fact that a purchase from our family-owned and operated
              business is one whose taste will delight and memory bring joy long
              after the last bite has been taken and the guests have gone home.
            </Text>
          </CenterMagnifyView>

          <CenterMagnifyView
            magnifyEnterAnchorLayout={sectionLayouts.paragraph3}
            magnifyExitAnchorLayout={sectionLayouts.signatureEnd}
            magnifyRampViewportRatio={aboutFeatureMagnifyRampViewportRatio}
            magnifiedScale={aboutFeatureMagnifiedScale}
            scrollY={scrollY}
            style={[aboutusStyles.aboutSection, aboutusStyles.copy]}
          >
            <Text
              onLayout={handleSectionLayout("paragraph3")}
              style={aboutusStyles.paragraph}
            >
              We thank you for your patronage, and could not possibly be any
              more excited about what the relationship between our business and
              customers has to bring as we move farther into what will surely be
              an eventful, festive decade.
            </Text>

            <View style={aboutusStyles.signatureSpacer} />

            <View style={aboutusStyles.signatureBlock}>
              <Text style={aboutusStyles.signature}>
                Warm regards,
              </Text>

              <Text
                style={[
                  aboutusStyles.signature,
                  aboutusStyles.signatureName,
                  aboutusStyles.signatureNameCentered,
                ]}
              >
                Janny
              </Text>

              <Text
                onLayout={handleSectionLayout("signatureEnd")}
                style={aboutusStyles.signature}
              >
                Owner/Operator of Alla Vostra
              </Text>
            </View>

            <View style={aboutusStyles.signatureSpacer} />
          </CenterMagnifyView>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
