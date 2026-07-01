import Constants from "expo-constants";
import * as Linking from "expo-linking";

export const stripePublishableKey =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
export const stripePaymentSheetUrl =
  process.env.EXPO_PUBLIC_STRIPE_PAYMENT_SHEET_URL || "";
export const stripeMerchantIdentifier =
  process.env.EXPO_PUBLIC_STRIPE_MERCHANT_IDENTIFIER || "";

export const isExpoGo = Constants.appOwnership === "expo";
export const isStripeLiveMode = stripePublishableKey.startsWith("pk_live_");
export const stripeReturnURL = Linking.createURL("stripe-redirect");
export const stripeUrlScheme = isExpoGo ? Linking.createURL("/--/") : "allavostra";

export function getStripeConfigurationIssue() {
  if (!stripePublishableKey || !stripePublishableKey.startsWith("pk_")) {
    return "Add EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY to mob/.env.";
  }

  if (!stripePaymentSheetUrl || !/^https?:\/\//.test(stripePaymentSheetUrl)) {
    return "Add EXPO_PUBLIC_STRIPE_PAYMENT_SHEET_URL to mob/.env.";
  }

  return "";
}

export async function createStripePaymentSheet(orderPayload) {
  const configurationIssue = getStripeConfigurationIssue();

  if (configurationIssue) {
    throw new Error(configurationIssue);
  }

  const response = await fetch(stripePaymentSheetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderPayload),
  });
  const responseText = await response.text();
  let payload = {};

  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.error || "Stripe payment setup failed.");
  }

  if (!payload.paymentIntentClientSecret) {
    throw new Error("Stripe did not return a payment client secret.");
  }

  return payload;
}
