const catalog = {
  Piccola: 5500,
  "Sei Perfetto": 6600,
  "Buon Natale": 7700,
};
const deliveryFeeCents = 1000;
const stateTaxRate = 0.06;
const countySurtaxRate = 0.01;
const taxRate = 0.07;
const currentPricingVersion = 2;
const legacyTaxRate = stateTaxRate;
const deliveryMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const deliveryDaysByMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const deliveryMinutes = new Set(["00", "15", "30", "45"]);
const serviceAreaZipRanges = [
  [33002, 33002],
  [33004, 33004],
  [33008, 33035],
  [33039, 33039],
  [33054, 33084],
  [33090, 33090],
  [33092, 33093],
  [33097, 33097],
  [33101, 33102],
  [33106, 33106],
  [33109, 33109],
  [33111, 33112],
  [33114, 33114],
  [33116, 33116],
  [33119, 33119],
  [33122, 33122],
  [33124, 33147],
  [33149, 33158],
  [33160, 33170],
  [33172, 33199],
  [33301, 33359],
  [33388, 33388],
  [33394, 33394],
  [33441, 33443],
];
const serviceAreaZipCodes = new Set([
  "33206",
  "33222",
  "33231",
  "33233",
  "33234",
  "33238",
  "33239",
  "33242",
  "33243",
  "33245",
  "33247",
  "33255",
  "33256",
  "33257",
  "33261",
  "33265",
  "33266",
  "33269",
  "33280",
  "33283",
  "33296",
  "33299",
]);

function buildOrder(payload) {
  const pricingVersion = normalizePricingVersion(payload.pricingVersion);
  const orderTaxRate =
    pricingVersion >= currentPricingVersion ? taxRate : legacyTaxRate;
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
  const email = sanitizeEmail(contact.email);
  const phone = sanitizeText(contact.phone, 40);
  const deliveryAddressLine = sanitizeText(delivery.address, 160);
  const deliveryCity = sanitizeText(delivery.city, 80);
  const deliveryZip = normalizeZip(delivery.zip);

  if (deliveryState !== "FL") {
    throw httpError("Only Florida deliveries are available at this time.", 400);
  }

  if (!isServiceAreaZip(deliveryZip)) {
    throw httpError(
      "Only Miami-Dade or Broward deliveries are available at this time.",
      400,
    );
  }

  if (!email) {
    throw httpError("A valid contact email is required.", 400);
  }

  if (!phone) {
    throw httpError("A contact phone number is required.", 400);
  }

  if (!deliveryAddressLine || !deliveryCity) {
    throw httpError("A complete delivery address is required.", 400);
  }

  const deliverySchedule = buildDeliverySchedule(delivery);

  const taxableCents = subtotalCents + deliveryFeeCents;
  const taxCents = Math.round(taxableCents * orderTaxRate);
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
  const deliveryAddress = formatDeliveryAddress(delivery);

  if (!contactName) {
    throw httpError("A contact name is required.", 400);
  }

  if (!deliveryName) {
    throw httpError("A delivery recipient name is required.", 400);
  }

  return {
    amountCents,
    contactName,
    deliveryAddress,
    deliveryFeeCents,
    deliverySchedule,
    email,
    lineItems,
    metadata: {
      order_items: truncate(JSON.stringify(lineItems), 500),
      subtotal_cents: String(subtotalCents),
      delivery_fee_cents: String(deliveryFeeCents),
      tax_cents: String(taxCents),
      pricing_version: String(pricingVersion),
      tax_rate: String(orderTaxRate),
      selected_payment_method: sanitizeText(payment.selectedMethod, 80),
      billing_matches_delivery: payment.billingAddressMatchesDelivery
        ? "yes"
        : "no",
      contact_name: truncate(contactName, 500),
      contact_email: truncate(email, 500),
      contact_phone: truncate(phone, 500),
      delivery_address: truncate(deliveryAddress, 500),
      delivery_month: deliverySchedule.month,
      delivery_day: String(deliverySchedule.day),
      delivery_time: deliverySchedule.time,
      delivery_schedule: deliverySchedule.label,
    },
    phone,
    pricingVersion,
    shipping: {
      name: shippingName,
      phone,
      address: {
        line1: deliveryAddressLine,
        line2: sanitizeText(delivery.apartment, 80),
        city: deliveryCity,
        state: deliveryState,
        postal_code: deliveryZip,
        country: "US",
      },
    },
    subtotalCents,
    taxCents,
  };
}

function normalizePricingVersion(value) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < currentPricingVersion) {
    return 1;
  }

  return currentPricingVersion;
}

function buildDeliverySchedule(delivery) {
  const month = sanitizeText(delivery.month, 12);
  const monthIndex = deliveryMonths.indexOf(month);
  const dayMatch = sanitizeText(delivery.date, 12).match(
    /^(3[01]|[12]\d|[1-9])(?:st|nd|rd|th)?$/i,
  );
  const day = Number(dayMatch?.[1] || 0);
  const hour = Number(sanitizeText(delivery.hour, 2));
  const minute = sanitizeText(delivery.minute, 2);
  const period = sanitizeText(delivery.period, 2).toUpperCase();

  if (monthIndex < 0) {
    throw httpError("A valid delivery month is required.", 400);
  }

  if (day < 1 || day > deliveryDaysByMonth[monthIndex]) {
    throw httpError("A valid delivery day is required.", 400);
  }

  if (hour < 1 || hour > 12 || !deliveryMinutes.has(minute)) {
    throw httpError("A valid delivery time is required.", 400);
  }

  if (period !== "AM" && period !== "PM") {
    throw httpError("A valid delivery time period is required.", 400);
  }

  const dayLabel = formatOrdinal(day);
  const time = `${hour}:${minute} ${period}`;

  return {
    day,
    dayLabel,
    label: `${month} ${dayLabel} at ${time}`,
    month,
    time,
  };
}

function formatOrdinal(day) {
  const mod100 = day % 100;

  if (mod100 >= 11 && mod100 <= 13) {
    return `${day}th`;
  }

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

function normalizeZip(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, 5);
}

function isServiceAreaZip(value) {
  const zip = normalizeZip(value);

  if (zip.length !== 5) {
    return false;
  }

  if (serviceAreaZipCodes.has(zip)) {
    return true;
  }

  const numericZip = Number(zip);
  return serviceAreaZipRanges.some(
    ([startZip, endZip]) => numericZip >= startZip && numericZip <= endZip,
  );
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
  countySurtaxRate,
  currentPricingVersion,
  deliveryFeeCents,
  formatAmountCents,
  httpError,
  sanitizeEmail,
  sanitizeText,
  stateTaxRate,
  taxRate,
};
