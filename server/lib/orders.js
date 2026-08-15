const catalog = {
  Piccola: 5500,
  "Sei Perfetto": 6600,
  "Buon Natale": 7700,
};
const deliveryFeeCents = 1000;
const taxRate = 0.06;

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

  const contact =
    payload.contact && typeof payload.contact === "object"
      ? payload.contact
      : {};
  const delivery =
    payload.delivery && typeof payload.delivery === "object"
      ? payload.delivery
      : {};
  const payment =
    payload.payment && typeof payload.payment === "object"
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
    contactName,
    deliveryAddress,
    deliveryFeeCents,
    email,
    lineItems,
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
    phone,
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

function formatAmountCents(cents) {
  return (Math.max(0, Number(cents || 0)) / 100).toFixed(2);
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

module.exports = {
  buildOrder,
  deliveryFeeCents,
  formatAmountCents,
  httpError,
  sanitizeEmail,
  sanitizeText,
};
