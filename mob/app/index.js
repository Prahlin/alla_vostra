import { Animated, Image, Text, View } from "react-native";

import PageDivider from "../components/PageDivider";
import sharedStyles from "../styles/sharedStyles";
import { useHeaderScrollY } from "../utils/headerScrollContext";
import useHeaderSyncedInitialOffset from "../utils/useHeaderSyncedInitialOffset";
import useMainScreenSwipeNavigation from "../utils/useMainScreenSwipeNavigation";

export default function HomeScreen() {
  const scrollY = useHeaderScrollY();
  const initialContentOffset = useHeaderSyncedInitialOffset(scrollY);
  const screenSwipeHandlers = useMainScreenSwipeNavigation();

  return (
    <View style={sharedStyles.screen} {...screenSwipeHandlers}>
      <Animated.ScrollView
        style={sharedStyles.scroll}
        contentContainerStyle={sharedStyles.scrollContent}
        contentOffset={initialContentOffset}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <View style={sharedStyles.main}>
          <Text style={sharedStyles.pageTitle}> </Text>

          <View style={sharedStyles.featureBlock}>
            <Image
              source={require("../passion111.png")}
              style={sharedStyles.featureImage}
              resizeMode="cover"
            />
            <Text style={sharedStyles.featureTitle}>Passion</Text>
            <Text style={sharedStyles.featureText}>
              Every Alla Vostra board is prepared with care, precision, and a
              love for the grazing experience.
            </Text>
          </View>

          <PageDivider />

          <View style={sharedStyles.featureBlock}>
            <Image
              source={require("../taste111.png")}
              style={sharedStyles.featureImage}
              resizeMode="cover"
            />
            <Text style={sharedStyles.featureTitle}>Taste</Text>
            <Text style={sharedStyles.featureText}>
              Our boards are built around layered flavor: cheeses, meats,
              fruits, sweets, spreads, and accoutrements.
            </Text>
          </View>

          <PageDivider />

          <View style={sharedStyles.featureBlock}>
            <Image
              source={require("../convenience111.png")}
              style={sharedStyles.featureImage}
              resizeMode="cover"
            />
            <Text style={sharedStyles.featureTitle}>Convenience</Text>
            <Text style={sharedStyles.featureText}>
              Alla Vostra brings the board to you for celebrations, family
              gatherings, and larger events.
            </Text>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
