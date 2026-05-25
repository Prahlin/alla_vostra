import { Animated, Text, TextInput, View } from "react-native";
import { useRef } from "react";

import AppHeader from "../components/AppHeader";
import PageDivider from "../components/PageDivider";
import contactStyles from "../styles/contactStyles";

export default function ContactScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <View style={contactStyles.screen}>
      <Animated.ScrollView
        style={contactStyles.scroll}
        contentContainerStyle={contactStyles.scrollContent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <AppHeader activePage="contact" scrollY={scrollY} />

        <View style={contactStyles.main}>
          <Text style={contactStyles.pageTitle}>Let's Talk</Text>

          <PageDivider />

          <Text style={contactStyles.introText}>
            Got a business inquiry?
          </Text>

          <Text style={contactStyles.introText}>
            General questions about our products?
          </Text>

          <Text style={contactStyles.introText}>
            We strive to respond within 48 hours.
          </Text>

          <View style={contactStyles.formCard}>
            <Text style={contactStyles.label}>Full Name</Text>
            <TextInput
              style={contactStyles.input}
              placeholder="John Doe"
              placeholderTextColor="rgba(17, 17, 17, 0.38)"
            />

            <Text style={contactStyles.label}>Email Address</Text>
            <TextInput
              style={contactStyles.input}
              placeholder="you@company.com"
              placeholderTextColor="rgba(17, 17, 17, 0.38)"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={contactStyles.label}>Phone Number</Text>
            <TextInput
              style={contactStyles.input}
              placeholder="+1 (555) 1234-567"
              placeholderTextColor="rgba(17, 17, 17, 0.38)"
              keyboardType="phone-pad"
            />

            <Text style={contactStyles.label}>Your Message</Text>
            <TextInput
              style={[contactStyles.input, contactStyles.messageInput]}
              placeholder="Your Message"
              placeholderTextColor="rgba(17, 17, 17, 0.38)"
              multiline
              textAlignVertical="top"
            />

            <View style={contactStyles.button}>
              <Text style={contactStyles.buttonText}>Send Message</Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}