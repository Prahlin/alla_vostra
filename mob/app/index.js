import { useCallback, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import CenterMagnifyView from "../components/CenterMagnifyView";
import MainScreenIntroSpacer from "../components/MainScreenIntroSpacer";
import PageDivider from "../components/PageDivider";
import sharedStyles from "../styles/sharedStyles";
import { useMainScreenScrollProps } from "../utils/mainScreenScrollContext";
import useMainScreenSwipeNavigation from "../utils/useMainScreenSwipeNavigation";

const passionImageBlendScrollDistance = 720;
const passionImageBlendFeatherHeight = 170;
const passionImageBlendOverlayColor = "rgba(255, 252, 242, 0.92)";
const featureImageAspectRatio = 1280 / 853;
const homeFeatureMagnifiedScale = 1.08;
const homeFeatureMagnifyRampViewportRatio = 0.5;

function isMatchingLayout(currentLayout, nextLayout) {
  return (
    currentLayout &&
    Math.abs(currentLayout.y - nextLayout.y) < 0.5 &&
    Math.abs(currentLayout.height - nextLayout.height) < 0.5
  );
}

export default function HomeScreen() {
  const [imageLayouts, setImageLayouts] = useState({});
  const [paragraphLayouts, setParagraphLayouts] = useState({});
  const {
    compactTopLayout,
    initialContentOffset,
    scrollHandlers,
    scrollY,
  } =
    useMainScreenScrollProps();
  const screenSwipeHandlers = useMainScreenSwipeNavigation();
  const { width: windowWidth } = useWindowDimensions();
  const croppedImageWidth = windowWidth * 1.05;
  const croppedImageHeight = croppedImageWidth * featureImageAspectRatio;
  const passionImageBlendTranslateY = scrollY.interpolate({
    inputRange: [0, passionImageBlendScrollDistance],
    outputRange: [-passionImageBlendFeatherHeight, croppedImageHeight],
    extrapolate: "clamp",
  });
  const handleParagraphLayout = useCallback(
    (featureName) =>
      ({ nativeEvent }) => {
        const { height, y } = nativeEvent.layout;
        const nextLayout = { height, y };

        setParagraphLayouts((currentLayouts) => {
          if (isMatchingLayout(currentLayouts[featureName], nextLayout)) {
            return currentLayouts;
          }

          return {
            ...currentLayouts,
            [featureName]: nextLayout,
          };
        });
      },
    []
  );
  const handleImageLayout = useCallback(
    (featureName) =>
      ({ nativeEvent }) => {
        const { height, y } = nativeEvent.layout;
        const nextLayout = { height, y };

        setImageLayouts((currentLayouts) => {
          if (isMatchingLayout(currentLayouts[featureName], nextLayout)) {
            return currentLayouts;
          }

          return {
            ...currentLayouts,
            [featureName]: nextLayout,
          };
        });
      },
    []
  );

  return (
    <View style={sharedStyles.screen} {...screenSwipeHandlers}>
      <Animated.ScrollView
        style={sharedStyles.scroll}
        contentContainerStyle={sharedStyles.scrollContent}
        contentOffset={initialContentOffset}
        decelerationRate={0.95}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        {...scrollHandlers}
      >
        <View style={sharedStyles.main}>
          <MainScreenIntroSpacer
            compactTopLayout={compactTopLayout}
            pageTitleStyle={[sharedStyles.pageTitle, homeStyles.pageTitle]}
            scrollY={scrollY}
          />

          <CenterMagnifyView
            magnifyEnterAnchorLayout={imageLayouts.passion}
            magnifyExitAnchorLayout={paragraphLayouts.passion}
            magnifyRampViewportRatio={homeFeatureMagnifyRampViewportRatio}
            magnifiedScale={homeFeatureMagnifiedScale}
            scrollY={scrollY}
            style={sharedStyles.featureBlock}
          >
            <View
              onLayout={handleImageLayout("passion")}
              style={[
                sharedStyles.directionalImageBlendWrap,
                { width: croppedImageWidth, height: croppedImageHeight },
              ]}
            >
              <Image
                source={require("../passion111_mos9_bright_italian_mockup_tile_blend_both_mockup.png")}
                style={[
                  sharedStyles.featureImage,
                  { backgroundColor: "transparent" },
                  { height: croppedImageHeight },
                ]}
                resizeMode="contain"
              />
              <Animated.View
                pointerEvents="none"
                style={[
                  sharedStyles.topToBottomImageBlendPanel,
                  {
                    height:
                      croppedImageHeight + passionImageBlendFeatherHeight,
                    transform: [{ translateY: passionImageBlendTranslateY }],
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    "rgba(255, 252, 242, 0)",
                    passionImageBlendOverlayColor,
                  ]}
                  locations={[0, 1]}
                  style={sharedStyles.topToBottomImageBlendFeather}
                />
                <View
                  style={[
                    sharedStyles.topToBottomImageBlendSolid,
                    {
                      height: croppedImageHeight,
                      backgroundColor: passionImageBlendOverlayColor,
                    },
                  ]}
                />
              </Animated.View>
            </View>
            <Text style={[sharedStyles.featureTitle, homeStyles.featureTitle]}>
              Passion
            </Text>
            <Text
              onLayout={handleParagraphLayout("passion")}
              style={[sharedStyles.featureText, homeStyles.featureText]}
            >
              Every Alla Vostra board is prepared with care, precision, and a
              love for the grazing experience.
            </Text>
          </CenterMagnifyView>

          <PageDivider />

          <CenterMagnifyView
            magnifyEnterAnchorLayout={imageLayouts.taste}
            magnifyExitAnchorLayout={paragraphLayouts.taste}
            magnifyRampViewportRatio={homeFeatureMagnifyRampViewportRatio}
            magnifiedScale={homeFeatureMagnifiedScale}
            scrollY={scrollY}
            style={sharedStyles.featureBlock}
          >
            <View
              onLayout={handleImageLayout("taste")}
              style={{ width: croppedImageWidth, height: croppedImageHeight }}
            >
              <Image
                source={require("../taste111_mos9_bright_soft_mockup_tile_blend_both_mockup.png")}
                style={[
                  sharedStyles.featureImage,
                  { backgroundColor: "transparent" },
                  { height: croppedImageHeight },
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={[sharedStyles.featureTitle, homeStyles.featureTitle]}>
              Taste
            </Text>
            <Text
              onLayout={handleParagraphLayout("taste")}
              style={[sharedStyles.featureText, homeStyles.featureText]}
            >
              Our boards are built around layered flavor: cheeses, meats,
              fruits, sweets, spreads, and accoutrements.
            </Text>
          </CenterMagnifyView>

          <PageDivider />

          <CenterMagnifyView
            magnifyEnterAnchorLayout={imageLayouts.convenience}
            magnifyExitAnchorLayout={paragraphLayouts.convenience}
            magnifyRampViewportRatio={homeFeatureMagnifyRampViewportRatio}
            magnifiedScale={homeFeatureMagnifiedScale}
            scrollY={scrollY}
            style={sharedStyles.featureBlock}
          >
            <View
              onLayout={handleImageLayout("convenience")}
              style={{ width: croppedImageWidth, height: croppedImageHeight }}
            >
              <Image
                source={require("../convenience111_mos9_bright_soft_mockup_tile_blend_both_mockup.png")}
                style={[
                  sharedStyles.featureImage,
                  { backgroundColor: "transparent" },
                  { height: croppedImageHeight },
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={[sharedStyles.featureTitle, homeStyles.featureTitle]}>
              Convenience
            </Text>
            <Text
              onLayout={handleParagraphLayout("convenience")}
              style={[sharedStyles.featureText, homeStyles.featureText]}
            >
              Alla Vostra brings the board to you for celebrations, family
              gatherings, and larger events.
            </Text>
          </CenterMagnifyView>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const homeStyles = StyleSheet.create({
  pageTitle: {
    lineHeight: 64.5,
  },

  featureTitle: {
    lineHeight: 57,
  },

  featureText: {
    lineHeight: 65.25,
  },
});
