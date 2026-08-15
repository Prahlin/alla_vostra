import * as Linking from "expo-linking";

export const paypalCreateOrderUrl =
  process.env.EXPO_PUBLIC_PAYPAL_CREATE_ORDER_URL || "";
export const paypalCaptureOrderUrl =
  process.env.EXPO_PUBLIC_PAYPAL_CAPTURE_ORDER_URL || "";
export const paypalReturnUrl = Linking.createURL("paypal-return");
export const paypalCancelUrl = appendQueryParam(
  paypalReturnUrl,
  "paypalStatus",
  "cancel",
);
const paypalRequestTimeoutMs = 30000;
const paypalApprovalTimeoutMs = 5 * 60 * 1000;

export function getPayPalConfigurationIssue() {
  if (!paypalCreateOrderUrl || !/^https?:\/\//.test(paypalCreateOrderUrl)) {
    return "Add EXPO_PUBLIC_PAYPAL_CREATE_ORDER_URL to mob/.env.";
  }

  if (!paypalCaptureOrderUrl || !/^https?:\/\//.test(paypalCaptureOrderUrl)) {
    return "Add EXPO_PUBLIC_PAYPAL_CAPTURE_ORDER_URL to mob/.env.";
  }

  return "";
}

export async function startPayPalCheckout(orderPayload) {
  const configurationIssue = getPayPalConfigurationIssue();

  if (configurationIssue) {
    throw new Error(configurationIssue);
  }

  const paypalOrder = await postPayPalJson(paypalCreateOrderUrl, {
    ...orderPayload,
    cancelUrl: paypalCancelUrl,
    returnUrl: paypalReturnUrl,
  });

  if (!paypalOrder.approvalUrl || !paypalOrder.paypalOrderId) {
    throw new Error("PayPal did not return checkout details.");
  }

  const approvedUrl = await openPayPalApprovalUrl(paypalOrder.approvalUrl);

  const redirectParams = Linking.parse(approvedUrl)?.queryParams || {};

  if (redirectParams.paypalStatus === "cancel") {
    throw new Error("PayPal checkout was canceled.");
  }

  const paypalOrderId =
    String(redirectParams.token || redirectParams.orderId || "").trim() ||
    paypalOrder.paypalOrderId;

  if (!paypalOrderId) {
    throw new Error("PayPal did not return an order ID.");
  }

  return postPayPalJson(paypalCaptureOrderUrl, {
    paypalOrderId,
  });
}

async function openPayPalApprovalUrl(approvalUrl) {
  let timeoutId;
  let subscription;

  const redirectPromise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("PayPal checkout timed out."));
    }, paypalApprovalTimeoutMs);

    subscription = Linking.addEventListener("url", ({ url }) => {
      if (String(url || "").startsWith(paypalReturnUrl)) {
        resolve(url);
      }
    });
  });

  try {
    const canOpen = await Linking.canOpenURL(approvalUrl);

    if (!canOpen) {
      throw new Error("Unable to open PayPal checkout.");
    }

    await Linking.openURL(approvalUrl);

    return await redirectPromise;
  } finally {
    clearTimeout(timeoutId);
    subscription?.remove();
  }
}

async function postPayPalJson(url, payload) {
  const abortController =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutId = abortController
    ? setTimeout(() => abortController.abort(), paypalRequestTimeoutMs)
    : null;
  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      ...(abortController ? { signal: abortController.signal } : null),
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("PayPal setup timed out. Check the payment server.");
    }

    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }

  const responseText = await response.text();
  let responsePayload = {};

  try {
    responsePayload = responseText ? JSON.parse(responseText) : {};
  } catch {
    responsePayload = {};
  }

  if (!response.ok) {
    throw new Error(responsePayload.error || "PayPal request failed.");
  }

  return responsePayload;
}

function appendQueryParam(url, key, value) {
  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(
    value,
  )}`;
}
