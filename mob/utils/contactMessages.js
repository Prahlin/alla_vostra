import { stripePaymentSheetUrl } from "./stripePayments";

const derivedContactMessageUrl = /\/api\/payment-sheet\/?$/.test(
  stripePaymentSheetUrl,
)
  ? stripePaymentSheetUrl.replace(
      /\/api\/payment-sheet\/?$/,
      "/api/contact-message",
    )
  : "";

export const contactMessageUrl =
  process.env.EXPO_PUBLIC_CONTACT_MESSAGE_URL || derivedContactMessageUrl;

export function getContactMessageConfigurationIssue() {
  if (!contactMessageUrl || !/^https?:\/\//.test(contactMessageUrl)) {
    return "Add EXPO_PUBLIC_CONTACT_MESSAGE_URL to mob/.env.";
  }

  return "";
}

export async function sendContactMessage(contact) {
  const configurationIssue = getContactMessageConfigurationIssue();

  if (configurationIssue) {
    throw new Error(configurationIssue);
  }

  const response = await fetch(contactMessageUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contact }),
  });
  const responseText = await response.text();
  let payload = {};

  try {
    payload = responseText ? JSON.parse(responseText) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.error || "Message could not be sent.");
  }

  return payload;
}
