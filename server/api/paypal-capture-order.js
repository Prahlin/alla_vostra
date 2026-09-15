const { capturePayPalOrder } = require("../lib/paypal");
const { enforceRateLimit, setCorsHeaders } = require("../lib/http-security");
const {
  sendPayPalOrderConfirmationEmail,
  sendPayPalOrderNotificationEmail,
} = require("../lib/postmark");

module.exports = async function handler(request, response) {
  setCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  if (
    !enforceRateLimit(request, response, {
      keyPrefix: "paypal-capture-order",
      limit: 30,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return;
  }

  try {
    const payload = getRequestBody(request);
    const paypalOrderId = String(payload.paypalOrderId || payload.token || "")
      .trim()
      .slice(0, 80);
    const paypalOrder = await capturePayPalOrder(paypalOrderId);
    const capture = getFirstCapture(paypalOrder);
    const emails = await sendOrderEmails(paypalOrder);

    response.status(200).json({
      captureId: capture.id || "",
      captureStatus: capture.status || "",
      email: emails.customer,
      emails,
      message: "PayPal payment captured.",
      paypalOrderId: paypalOrder.id,
      status: paypalOrder.status,
    });
  } catch (error) {
    response.status(error.statusCode || 400).json({
      error: error.message || "PayPal capture failed.",
    });
  }
};

function getRequestBody(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  if (typeof request.body === "string" && request.body.trim()) {
    return JSON.parse(request.body);
  }

  return {};
}

async function sendOrderEmails(paypalOrder) {
  const [notificationResult, confirmationResult] = await Promise.allSettled([
    sendPayPalOrderNotificationEmail({ paypalOrder }),
    sendPayPalOrderConfirmationEmail({ paypalOrder }),
  ]);

  const emails = {
    business: formatEmailResult(
      notificationResult,
      "Business order notification email failed.",
    ),
    customer: formatEmailResult(
      confirmationResult,
      "Customer order confirmation email failed.",
    ),
  };

  if (!emails.business.sent) {
    console.error("PayPal business order notification failed.", {
      error: emails.business.error,
      paypalOrderId: paypalOrder.id,
    });
  }

  return emails;
}

function formatEmailResult(result, fallbackError) {
  if (result.status === "fulfilled") {
    return {
      messageId: result.value.MessageID || result.value.MessageId || "",
      sent: true,
    };
  }

  return {
    error: result.reason?.message || fallbackError,
    sent: false,
  };
}

function getFirstCapture(paypalOrder) {
  const purchaseUnits = Array.isArray(paypalOrder?.purchase_units)
    ? paypalOrder.purchase_units
    : [];

  for (const purchaseUnit of purchaseUnits) {
    const captures = Array.isArray(purchaseUnit?.payments?.captures)
      ? purchaseUnit.payments.captures
      : [];

    if (captures[0]) {
      return captures[0];
    }
  }

  return {};
}
