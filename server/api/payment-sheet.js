const Stripe = require("stripe");

const { buildOrder } = require("../lib/orders");
const { enforceRateLimit, setCorsHeaders } = require("../lib/http-security");

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
      keyPrefix: "payment-sheet",
      limit: 20,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return;
  }

  const secretKey = String(process.env.STRIPE_SECRET_KEY || "").trim();

  if (!secretKey.startsWith("sk_")) {
    response.status(500).json({ error: "Stripe is not configured." });
    return;
  }

  try {
    const payload = getRequestBody(request);
    const order = buildOrder(payload);
    const stripe = new Stripe(secretKey);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.amountCents,
      currency: "usd",
      description: "Alla Vostra order",
      payment_method_types: ["card"],
      metadata: order.metadata,
      receipt_email: order.email || undefined,
      shipping: order.shipping,
    });

    response.status(200).json({
      paymentIntentClientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: order.amountCents,
      currency: "usd",
      totals: {
        subtotal: order.subtotalCents,
        deliveryFee: order.deliveryFeeCents,
        tax: order.taxCents,
        grandTotal: order.amountCents,
      },
    });
  } catch (error) {
    response.status(error.statusCode || 400).json({
      error: error.message || "Stripe payment setup failed.",
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
