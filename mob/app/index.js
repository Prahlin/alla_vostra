import { Animated, Image, Text, View, useWindowDimensions } from "react-native";

import CenterMagnifyView from "../components/CenterMagnifyView";
import PageDivider from "../components/PageDivider";
import sharedStyles from "../styles/sharedStyles";
import { useHeaderScrollY } from "../utils/headerScrollContext";
import useHeaderSyncedInitialOffset from "../utils/useHeaderSyncedInitialOffset";
import useMainScreenSwipeNavigation from "../utils/useMainScreenSwipeNavigation";

export default function HomeScreen() {
  const scrollY = useHeaderScrollY();
  const initialContentOffset = useHeaderSyncedInitialOffset(scrollY);
  const screenSwipeHandlers = useMainScreenSwipeNavigation();
  const { width: windowWidth } = useWindowDimensions();
  const croppedImageWidth = windowWidth * 1.05;

  return (
    <View style={sharedStyles.screen} {...screenSwipeHandlers}>
      <Animated.ScrollView
        style={sharedStyles.scroll}
        contentContainerStyle={sharedStyles.scrollContent}
        contentOffset={initialContentOffset}
        decelerationRate={0.95}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={sharedStyles.main}>
          <Text style={sharedStyles.pageTitle}> </Text>

          <PageDivider expandedSpacing fadeWithScrollY={scrollY} />

          <CenterMagnifyView
            scrollY={scrollY}
            style={sharedStyles.featureBlock}
          >
            <View style={{ width: croppedImageWidth }}>
              <Image
                source={require("../passion111.png")}
                style={[
                  sharedStyles.featureImage,
                  { height: croppedImageWidth },
                ]}
                resizeMode="contain"
              />
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
