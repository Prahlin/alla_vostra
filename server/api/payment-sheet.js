const Stripe = require("stripe");

const catalog = {
  Piccola: 5500,
  "Sei Perfetto": 6600,
  "Buon Natale": 7700,
};
const deliveryFeeCents = 1000;
const taxRate = 0.06;

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

  const secretKey = process.env.STRIPE_SECRET_KEY || "";

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
        deliveryFee: deliveryFeeCents,
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

function buildOrder(payload) {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const lineItems = [];
  let subtotalCents = 0;

  items.forEach((item) => {
    const name = sanitizeText(item?.name, 80);
    const quantity = Number(item?.quantity || 0);

    if (!catalog[name] || !Number.isInteger(quantity) || quantity < 1) {
      return;
    }

    if (quantity > 99) {
      throw httpError("Item quantity is too high.", 400);
    }

    const unitAmountCents = catalog[name];
    const lineTotalCents = unitAmountCents * quantity;
    subtotalCents += lineTotalCents;
    lineItems.push({
      name,
      quantity,
      unitAmountCents,
      lineTotalCents,
    });
  });

  if (lineItems.length === 0 || subtotalCents <= 0) {
    throw httpError("Cart is empty.", 400);
  }

  const contact = payload.contact && typeof payload.contact === "object"
    ? payload.contact
    : {};
  const delivery = payload.delivery && typeof payload.delivery === "object"
    ? payload.delivery
    : {};
  const payment = payload.payment && typeof payload.payment === "object"
    ? payload.payment
    : {};
  const deliveryState = sanitizeText(delivery.state, 24).toUpperCase();

  if (deliveryState !== "FL") {
    throw httpError("Only Florida deliveries are available at this time.", 400);
  }

  const taxableCents = subtotalCents + deliveryFeeCents;
  const taxCents = Math.round(taxableCents * taxRate);
  const amountCents = taxableCents + taxCents;
  const contactName = [
    sanitizeText(contact.firstName, 80),
    sanitizeText(contact.lastName, 80),
  ]
    .filter(Boolean)
    .join(" ");
  const deliveryName = [
    sanitizeText(delivery.firstName, 80),
    sanitizeText(delivery.lastName, 80),
  ]
    .filter(Boolean)
    .join(" ");
  const shippingName =
    deliveryName || contactName || "Alla Vostra customer";
  const email = sanitizeEmail(contact.email);
  const phone = sanitizeText(contact.phone, 40);
  const deliveryAddress = formatDeliveryAddress(delivery);

  return {
    amountCents,
    email,
    metadata: {
      order_items: truncate(JSON.stringify(lineItems), 500),
      subtotal_cents: String(subtotalCents),
      delivery_fee_cents: String(deliveryFeeCents),
      tax_cents: String(taxCents),
      selected_payment_method: sanitizeText(payment.selectedMethod, 80),
      billing_matches_delivery: payment.billingAddressMatchesDelivery
        ? "yes"
        : "no",
      contact_name: truncate(contactName, 500),
      delivery_address: truncate(deliveryAddress, 500),
    },
    shipping: {
      name: shippingName,
      phone,
      address: {
        line1: sanitizeText(delivery.address, 160),
        line2: sanitizeText(delivery.apartment, 80),
        city: sanitizeText(delivery.city, 80),
        state: deliveryState,
        postal_code: sanitizeText(delivery.zip, 24),
        country: "US",
      },
    },
    subtotalCents,
    taxCents,
  };
}

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function sanitizeText(value, maxLength) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

function sanitizeEmail(value) {
  const email = sanitizeText(value, 160);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function truncate(value, maxLength) {
  return String(value || "").slice(0, maxLength);
}

function formatDeliveryAddress(delivery) {
  return [
    sanitizeText(delivery.address, 160),
    sanitizeText(delivery.apartment, 80),
    sanitizeText(delivery.city, 80),
    sanitizeText(delivery.state, 24),
    sanitizeText(delivery.zip, 24),
  ]
    .filter(Boolean)
    .join(", ");
}
