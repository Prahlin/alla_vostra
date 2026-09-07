import Constants from "expo-constants";
import React from "react";
import { Platform, View } from "react-native";

const shouldUseStripeNative =
  Constants.appOwnership !== "expo" && Platform.OS !== "web";

const stripeNative = shouldUseStripeNative
  ? require("@stripe/stripe-react-native")
  : null;

const unavailableStripeError = {
  message: "Native Stripe checkout requires a development or store build.",
};

export const StripeProvider = shouldUseStripeNative
  ? stripeNative.StripeProvider
  : ({ children }) => <>{children}</>;

export const CardForm = shouldUseStripeNative
  ? stripeNative.CardForm
  : ({ style }) => <View style={style} />;

export const PlatformPay = shouldUseStripeNative
  ? stripeNative.PlatformPay
  : {
      BillingAddressFormat: {
        Min: "Min",
      },
      PaymentType: {
        Immediate: "Immediate",
      },
    };

export const useStripe = shouldUseStripeNative
  ? stripeNative.useStripe
  : () => ({
      confirmPayment: async () => ({ error: unavailableStripeError }),
      createPaymentMethod: async () => ({ error: unavailableStripeError }),
    });

export const usePlatformPay = shouldUseStripeNative
  ? stripeNative.usePlatformPay
  : () => ({
      confirmPlatformPayPayment: async () => ({
        error: unavailableStripeError,
      }),
      isPlatformPaySupported: async () => false,
    });
