const { buildOrder } = require("../lib/orders");
const { enforceRateLimit, setCorsHeaders } = require("../lib/http-security");
const {
  createPayPalOrder,
  getPayPalApprovalUrl,
} = require("../lib/paypal");

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
      keyPrefix: "paypal-create-order",
      limit: 20,
      windowMs: 10 * 60 * 1000,
    })
  ) {
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
