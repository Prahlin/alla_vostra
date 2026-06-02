import { Animated, Text, TextInput, View } from "react-native";

import CenterMagnifyView from "../components/CenterMagnifyView";
import PageDivider from "../components/PageDivider";
import contactStyles from "../styles/contactStyles";
import { useHeaderArrowHintScrollHandlers } from "../utils/headerSwipeContext";
import { useHeaderScrollY } from "../utils/headerScrollContext";
import useHeaderSyncedInitialOffset from "../utils/useHeaderSyncedInitialOffset";
import useMainScreenSwipeNavigation from "../utils/useMainScreenSwipeNavigation";

export default function ContactScreen() {
  const scrollY = useHeaderScrollY();
  const initialContentOffset = useHeaderSyncedInitialOffset(scrollY);
  const arrowScrollHandlers = useHeaderArrowHintScrollHandlers();
  const screenSwipeHandlers = useMainScreenSwipeNavigation();

  return (
    <View style={contactStyles.screen} {...screenSwipeHandlers}>
      <Animated.ScrollView
        style={contactStyles.scroll}
        contentContainerStyle={contactStyles.scrollContent}
        contentOffset={initialContentOffset}
        decelerationRate={0.95}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        {...arrowScrollHandlers}
      >
        <View style={contactStyles.main}>
          <View style={contactStyles.pageTitle} />

          <PageDivider expandedSpacing fadeWithScrollY={scrollY} />

          <CenterMagnifyView scrollY={scrollY}>
            <Text style={contactStyles.introText}>Got a business inquiry?</Text>
            <Text style={contactStyles.introText}>
              General questions about our products?
            </Text>
            <Text style={contactStyles.introText}>
              We strive to respond within 48 hours.
            </Text>
          </CenterMagnifyView>

          <View style={contactStyles.formCard}>
            <CenterMagnifyView scrollY={scrollY}>
              <Text style={contactStyles.label}>Full Name</Text>
              <TextInput
                style={contactStyles.input}
                placeholder="Your Name"
                placeholderTextColor="rgba(17, 17, 17, 0.38)"
              />
            </CenterMagnifyView>

            <CenterMagnifyView scrollY={scrollY}>
              <Text style={contactStyles.label}>Email Address</Text>
              <TextInput
                style={contactStyles.input}
                placeholder="you@company.com"
                placeholderTextColor="rgba(17, 17, 17, 0.38)"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </CenterMagnifyView>

            <CenterMagnifyView scrollY={scrollY}>
              <Text style={contactStyles.label}>Phone Number</Text>
              <TextInput
                style={contactStyles.input}
                placeholder="+1 (555) 1234-567"
                placeholderTextColor="rgba(17, 17, 17, 0.38)"
                keyboardType="phone-pad"
              />
            </CenterMagnifyView>

            <CenterMagnifyView scrollY={scrollY}>
              <Text style={contactStyles.label}>Your Message</Text>
              <TextInput
                style={[contactStyles.input, contactStyles.messageInput]}
                placeholder="Your Message"
                placeholderTextColor="rgba(17, 17, 17, 0.38)"
                multiline
                textAlignVertical="top"
              />
            </CenterMagnifyView>

            <CenterMagnifyView scrollY={scrollY} style={contactStyles.buttonWrap}>
              <View style={contactStyles.button}>
                <Text style={contactStyles.buttonText}>Send Message</Text>
              </View>
            </CenterMagnifyView>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
