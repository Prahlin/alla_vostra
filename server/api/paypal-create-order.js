const { buildOrder } = require("../lib/orders");
const {
  createPayPalOrder,
  getPayPalApprovalUrl,
} = require("../lib/paypal");

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
    const order = buildOrder(payload);
    const paypalOrder = await createPayPalOrder(order, {
      cancelUrl: sanitizeUrl(payload.cancelUrl),
      returnUrl: sanitizeUrl(payload.returnUrl),
    });
    const approvalUrl = getPayPalApprovalUrl(paypalOrder);

    if (!approvalUrl) {
      throw new Error("PayPal did not return an approval URL.");
    }

    response.status(200).json({
      approvalUrl,
      amount: order.amountCents,
      currency: "usd",
      paypalOrderId: paypalOrder.id,
      status: paypalOrder.status,
      totals: {
        subtotal: order.subtotalCents,
        deliveryFee: order.deliveryFeeCents,
        tax: order.taxCents,
        grandTotal: order.amountCents,
      },
    });
  } catch (error) {
    response.status(error.statusCode || 400).json({
      error: error.message || "PayPal order creation failed.",
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

function sanitizeUrl(value) {
  const url = String(value || "").trim();

  if (!url) {
    throw new Error("PayPal return URL is missing.");
  }

  return url.slice(0, 2048);
}
