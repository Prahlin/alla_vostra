import { Animated, Image, Text, View, useWindowDimensions } from "react-native";
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

export default function HomeScreen() {
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
  const passionImageBlendTranslateY = scrollY.interpolate({
    inputRange: [0, passionImageBlendScrollDistance],
    outputRange: [-passionImageBlendFeatherHeight, croppedImageWidth],
    extrapolate: "clamp",
  });

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
            pageTitleStyle={sharedStyles.pageTitle}
            scrollY={scrollY}
          />

          <CenterMagnifyView
            scrollY={scrollY}
            style={sharedStyles.featureBlock}
          >
            <View
              style={[
                sharedStyles.directionalImageBlendWrap,
                { width: croppedImageWidth, height: croppedImageWidth },
              ]}
            >
              <Image
                source={require("../passion111.png")}
                style={[
                  sharedStyles.featureImage,
                  { height: croppedImageWidth },
                ]}
                resizeMode="contain"
              />
              <Animated.View
                pointerEvents="none"
                style={[
                  sharedStyles.topToBottomImageBlendPanel,
                  {
                    height:
                      croppedImageWidth + passionImageBlendFeatherHeight,
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
                      height: croppedImageWidth,
                      backgroundColor: passionImageBlendOverlayColor,
                    },
                  ]}
                />
              </Animated.View>
            </View>
            <Text style={sharedStyles.featureTitle}>Passion</Text>
            <Text style={sharedStyles.featureText}>
              Every Alla Vostra board is prepared with care, precision, and a
              love for the grazing experience.
            </Text>
          </CenterMagnifyView>

          <PageDivider />

          <CenterMagnifyView
            scrollY={scrollY}
            style={sharedStyles.featureBlock}
          >
            <View style={{ width: croppedImageWidth }}>
              <Image
                source={require("../taste111.png")}
                style={[
                  sharedStyles.featureImage,
                  { height: croppedImageWidth },
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={sharedStyles.featureTitle}>Taste</Text>
            <Text style={sharedStyles.featureText}>
              Our boards are built around layered flavor: cheeses, meats,
              fruits, sweets, spreads, and accoutrements.
            </Text>
          </CenterMagnifyView>

          <PageDivider />

          <CenterMagnifyView
            scrollY={scrollY}
            style={sharedStyles.featureBlock}
          >
            <View style={{ width: croppedImageWidth }}>
              <Image
                source={require("../convenience111.png")}
                style={[
                  sharedStyles.featureImage,
                  { height: croppedImageWidth },
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={sharedStyles.featureTitle}>Convenience</Text>
            <Text style={sharedStyles.featureText}>
              Alla Vostra brings the board to you for celebrations, family
              gatherings, and larger events.
            </Text>
          </CenterMagnifyView>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
