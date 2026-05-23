import { Alert, Linking, Platform } from "react-native";

export async function openPaymentLink(url) {
  if (!url) {
    if (Platform.OS === "web") {
      window.alert("No payment link has been added for this product yet.");
      return;
    }

    Alert.alert("Payment link missing", "No payment link has been added yet.");
    return;
  }

  try {
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      throw new Error("Cannot open URL");
    }

    await Linking.openURL(url);
  } catch (error) {
    if (Platform.OS === "web") {
      window.alert("Unable to open this payment link.");
      return;
    }

    Alert.alert("Unable to open link", "Please try again later.");
  }
}