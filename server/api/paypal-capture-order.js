const { capturePayPalOrder } = require("../lib/paypal");
const { sendPayPalOrderConfirmationEmail } = require("../lib/postmark");

module.exports = async function handler(request, response) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const payload = getRequestBody(request);
    const paypalOrderId = String(payload.paypalOrderId || payload.token || "")
      .trim()
      .slice(0, 80);
    const paypalOrder = await capturePayPalOrder(paypalOrderId);
    const capture = getFirstCapture(paypalOrder);
    const email = await sendConfirmationEmail(paypalOrder);

    response.status(200).json({
      captureId: capture.id || "",
      captureStatus: capture.status || "",
      email,
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

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
}

function getRequestBody(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  if (typeof request.body === "string" && request.body.trim()) {
    return JSON.parse(request.body);
  }

  return {};
}

async function sendConfirmationEmail(paypalOrder) {
  try {
    const postmarkResult = await sendPayPalOrderConfirmationEmail({
      paypalOrder,
    });
    const messageId = postmarkResult.MessageID || postmarkResult.MessageId || "";

    return {
      messageId,
      sent: true,
    };
  } catch (error) {
    return {
      error: error.message || "Order confirmation email failed.",
      sent: false,
    };
  }
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
