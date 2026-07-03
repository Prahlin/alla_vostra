import { useState } from "react";
import { Alert, Animated, Text, TextInput, View } from "react-native";

import CenterMagnifyView from "../components/CenterMagnifyView";
import HapticPressable from "../components/HapticPressable";
import MainScreenIntroSpacer from "../components/MainScreenIntroSpacer";
import contactStyles from "../styles/contactStyles";
import { sendContactMessage } from "../utils/contactMessages";
import { useMainScreenScrollProps } from "../utils/mainScreenScrollContext";
import { getMainScreenScrollViewProps } from "../utils/platformLayout";
import useMainScreenSwipeNavigation from "../utils/useMainScreenSwipeNavigation";

export default function ContactScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const {
    compactTopLayout,
    initialContentOffset,
    scrollContentInsetStyle,
    scrollHandlers,
    scrollY,
  } =
    useMainScreenScrollProps();
  const screenSwipeHandlers = useMainScreenSwipeNavigation();
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();
  const canSubmit =
    trimmedName.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) &&
    trimmedMessage.length > 0 &&
    !isSending;

  const showContactAlert = (title, alertMessage) => {
    if (typeof window !== "undefined" && typeof window.alert === "function") {
      window.alert(`${title}\n${alertMessage}`);
      return;
    }

    Alert.alert(title, alertMessage);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setStatusMessage("Please enter your name, email, and message.");
      return;
    }

    setIsSending(true);
    setStatusMessage("");

    try {
      await sendContactMessage({
        email: trimmedEmail,
        message: trimmedMessage,
        name: trimmedName,
        phone: phone.trim(),
      });
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setStatusMessage("Message sent. We will respond within 48 hours.");
      showContactAlert(
        "Message sent",
        "Thank you. Your message was sent to Alla Vostra.",
      );
    } catch (error) {
      const errorMessage = error?.message || "Please try again.";
      setStatusMessage(errorMessage);
      showContactAlert("Message not sent", errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={contactStyles.screen} {...screenSwipeHandlers}>
      <Animated.ScrollView
        style={contactStyles.scroll}
        contentContainerStyle={[
          contactStyles.scrollContent,
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
        <View style={contactStyles.main}>
          <MainScreenIntroSpacer
            compactTopLayout={compactTopLayout}
            pageTitleStyle={contactStyles.pageTitle}
            scrollY={scrollY}
          />

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
                onChangeText={setName}
                returnKeyType="next"
                textContentType="name"
                value={name}
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
                autoCorrect={false}
                onChangeText={setEmail}
                returnKeyType="next"
                textContentType="emailAddress"
                value={email}
              />
            </CenterMagnifyView>

            <CenterMagnifyView scrollY={scrollY}>
              <Text style={contactStyles.label}>Phone Number</Text>
              <TextInput
                style={contactStyles.input}
                placeholder="+1 (555) 1234-567"
                placeholderTextColor="rgba(17, 17, 17, 0.38)"
                keyboardType="phone-pad"
                onChangeText={setPhone}
                returnKeyType="next"
                textContentType="telephoneNumber"
                value={phone}
              />
            </CenterMagnifyView>

            <CenterMagnifyView scrollY={scrollY}>
              <Text style={contactStyles.label}>Your Message</Text>
              <TextInput
                style={[contactStyles.input, contactStyles.messageInput]}
                placeholder="Your Message"
                placeholderTextColor="rgba(17, 17, 17, 0.38)"
                multiline
                onChangeText={setMessage}
                returnKeyType="default"
                textAlignVertical="top"
                value={message}
              />
            </CenterMagnifyView>

            <CenterMagnifyView scrollY={scrollY} style={contactStyles.buttonWrap}>
              <HapticPressable
                accessibilityRole="button"
                disabled={isSending}
                onPress={handleSubmit}
                style={({ pressed }) => [
                  contactStyles.button,
                  (!canSubmit || pressed) && contactStyles.buttonDimmed,
                ]}
              >
                <Text style={contactStyles.buttonText}>
                  {isSending ? "Sending..." : "Send Message"}
                </Text>
              </HapticPressable>
              {statusMessage ? (
                <Text style={contactStyles.statusText}>{statusMessage}</Text>
              ) : null}
            </CenterMagnifyView>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
