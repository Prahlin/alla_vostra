const postmarkEmailEndpoint = "https://api.postmarkapp.com/email";

async function sendOrderConfirmationEmail({ paymentIntent }) {
  const token = process.env.POSTMARK_SERVER_TOKEN || "";
  const from = process.env.POSTMARK_FROM_EMAIL || "";
  const replyTo = process.env.POSTMARK_REPLY_TO_EMAIL || "";
  const messageStream = process.env.POSTMARK_MESSAGE_STREAM || "outbound";
  const to = sanitizeEmail(paymentIntent.receipt_email);

  if (!token) {
    throw new Error("Postmark server token is not configured.");
  }

  if (!from) {
    throw new Error("Postmark from email is not configured.");
  }

  if (!to) {
    throw new Error("PaymentIntent does not have a customer email.");
  }

  const order = buildOrderEmailModel(paymentIntent);
  const payload = {
    From: from,
    To: to,
    Subject: "Your Alla Vostra order confirmation",
    HtmlBody: renderOrderConfirmationHtml(order),
    TextBody: renderOrderConfirmationText(order),
    MessageStream: messageStream,
    Tag: "order-confirmation",
    Metadata: {
      payment_intent_id: paymentIntent.id,
    },
  };

  if (replyTo) {
    payload.ReplyTo = replyTo;
  }

  const response = await fetch(postmarkEmailEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": token,
    },
    body: JSON.stringify(payload),
  });
  const responseText = await response.text();
  let responsePayload = {};

  try {
    responsePayload = responseText ? JSON.parse(responseText) : {};
  } catch {
    responsePayload = {};
  }

  if (!response.ok || responsePayload.ErrorCode) {
    throw new Error(
      responsePayload.Message || `Postmark email failed with ${response.status}.`,
    );
  }

  return responsePayload;
}

async function sendPayPalOrderConfirmationEmail({ paypalOrder }) {
  const token = process.env.POSTMARK_SERVER_TOKEN || "";
  const from = process.env.POSTMARK_FROM_EMAIL || "";
  const replyTo = process.env.POSTMARK_REPLY_TO_EMAIL || "";
  const messageStream = process.env.POSTMARK_MESSAGE_STREAM || "outbound";
  const to = sanitizeEmail(
    paypalOrder?.payment_source?.paypal?.email_address ||
      paypalOrder?.payer?.email_address,
  );

  if (!token) {
    throw new Error("Postmark server token is not configured.");
  }

  if (!from) {
    throw new Error("Postmark from email is not configured.");
  }

  if (!to) {
    throw new Error("PayPal order does not have a customer email.");
  }

  const order = buildPayPalOrderEmailModel(paypalOrder);
  const payload = {
    From: from,
    To: to,
    Subject: "Your Alla Vostra order confirmation",
    HtmlBody: renderOrderConfirmationHtml(order),
    TextBody: renderOrderConfirmationText(order),
    MessageStream: messageStream,
    Tag: "order-confirmation",
    Metadata: {
      paypal_order_id: paypalOrder.id,
    },
  };

  if (replyTo) {
    payload.ReplyTo = replyTo;
  }

  const response = await fetch(postmarkEmailEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": token,
    },
    body: JSON.stringify(payload),
  });
  const responseText = await response.text();
  let responsePayload = {};

  try {
    responsePayload = responseText ? JSON.parse(responseText) : {};
  } catch {
    responsePayload = {};
  }

  if (!response.ok || responsePayload.ErrorCode) {
    throw new Error(
      responsePayload.Message || `Postmark email failed with ${response.status}.`,
    );
  }

  return responsePayload;
}

async function sendContactMessageEmail({ contact }) {
  const token = process.env.POSTMARK_SERVER_TOKEN || "";
  const from = process.env.POSTMARK_FROM_EMAIL || "";
  const fallbackReplyTo = process.env.POSTMARK_REPLY_TO_EMAIL || "";
  const messageStream = process.env.POSTMARK_MESSAGE_STREAM || "outbound";
  const to =
    sanitizeEmail(process.env.POSTMARK_CONTACT_TO_EMAIL) ||
    sanitizeEmail(fallbackReplyTo) ||
    sanitizeEmail(from);
  const contactMessage = buildContactMessageModel(contact);

  if (!token) {
    throw new Error("Postmark server token is not configured.");
  }

  if (!from) {
    throw new Error("Postmark from email is not configured.");
  }

  if (!to) {
    throw new Error("Contact recipient email is not configured.");
  }

  if (!contactMessage.name) {
    throw validationError("Please enter your name.");
  }

  if (!contactMessage.email) {
    throw validationError("Please enter a valid email address.");
  }

  if (!contactMessage.message) {
    throw validationError("Please enter a message.");
  }

  const payload = {
    From: from,
    To: to,
    ReplyTo: contactMessage.email,
    Subject: `Alla Vostra contact message from ${contactMessage.name}`,
    HtmlBody: renderContactMessageHtml(contactMessage),
    TextBody: renderContactMessageText(contactMessage),
    MessageStream: messageStream,
    Tag: "contact-message",
    Metadata: {
      contact_email: contactMessage.email,
    },
  };

  if (!payload.ReplyTo && fallbackReplyTo) {
    payload.ReplyTo = fallbackReplyTo;
  }

  const response = await fetch(postmarkEmailEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": token,
    },
    body: JSON.stringify(payload),
  });
  const responseText = await response.text();
  let responsePayload = {};

  try {
    responsePayload = responseText ? JSON.parse(responseText) : {};
  } catch {
    responsePayload = {};
  }

  if (!response.ok || responsePayload.ErrorCode) {
    throw new Error(
      responsePayload.Message || `Postmark email failed with ${response.status}.`,
    );
  }

  return responsePayload;
}

function buildOrderEmailModel(paymentIntent) {
  const metadata = paymentIntent.metadata || {};
  const lineItems = parseLineItems(metadata.order_items);
  const customerName =
    sanitizeText(metadata.contact_name, 120) ||
    sanitizeText(paymentIntent.shipping?.name, 120) ||
    "Alla Vostra customer";
  const deliveryAddress =
    sanitizeText(metadata.delivery_address, 500) ||
    formatStripeShippingAddress(paymentIntent.shipping);
  const amountCents = numberFromCents(paymentIntent.amount);
  const subtotalCents = numberFromCents(metadata.subtotal_cents);
  const deliveryFeeCents = numberFromCents(metadata.delivery_fee_cents);
  const taxCents = numberFromCents(metadata.tax_cents);

  return {
    amount: formatCurrency(amountCents),
    amountCents,
    customerFirstName: customerName.split(" ")[0] || "there",
    customerName,
    deliveryAddress,
    deliveryFee: formatCurrency(deliveryFeeCents),
    lineItems,
    paymentId: paymentIntent.id,
    paymentIntentId: paymentIntent.id,
    subtotal: formatCurrency(subtotalCents),
    tax: formatCurrency(taxCents),
  };
}

function buildPayPalOrderEmailModel(paypalOrder) {
  const purchaseUnit = Array.isArray(paypalOrder?.purchase_units)
    ? paypalOrder.purchase_units[0] || {}
    : {};
  const amount = purchaseUnit.amount || {};
  const breakdown = amount.breakdown || {};
  const paypalName = paypalOrder?.payment_source?.paypal?.name || {};
  const payerName = paypalOrder?.payer?.name || {};
  const customerName =
    [
      sanitizeText(paypalName.given_name || payerName.given_name, 80),
      sanitizeText(paypalName.surname || payerName.surname, 80),
    ]
      .filter(Boolean)
      .join(" ") ||
    sanitizeText(purchaseUnit.shipping?.name?.full_name, 120) ||
    "Alla Vostra customer";
  const lineItems = parsePayPalLineItems(purchaseUnit.items);
  const capture = getPayPalCapture(paypalOrder);

  return {
    amount: formatCurrency(centsFromPayPalAmount(amount.value)),
    amountCents: centsFromPayPalAmount(amount.value),
    customerFirstName: customerName.split(" ")[0] || "there",
    customerName,
    deliveryAddress: formatPayPalShippingAddress(purchaseUnit.shipping),
    deliveryFee: formatCurrency(centsFromPayPalAmount(breakdown.shipping?.value)),
    lineItems,
    paymentId: capture.id || paypalOrder.id,
    subtotal: formatCurrency(centsFromPayPalAmount(breakdown.item_total?.value)),
    tax: formatCurrency(centsFromPayPalAmount(breakdown.tax_total?.value)),
  };
}

function buildContactMessageModel(contact) {
  return {
    email: sanitizeEmail(contact?.email),
    message: sanitizeMultilineText(contact?.message, 4000),
    name: sanitizeText(contact?.name, 120),
    phone: sanitizeText(contact?.phone, 80),
    submittedAt: new Date().toISOString(),
  };
}

function renderContactMessageText(contactMessage) {
  return [
    "New Alla Vostra contact message",
    "",
    `Name: ${contactMessage.name}`,
    `Email: ${contactMessage.email}`,
    `Phone: ${contactMessage.phone || "Not provided"}`,
    `Submitted: ${contactMessage.submittedAt}`,
    "",
    "Message:",
    contactMessage.message,
  ].join("\n");
}

function renderContactMessageHtml(contactMessage) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f7f1e6;color:#111111;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f1e6;">
      <tr>
        <td align="center" style="padding:28px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e6e0d7;">
            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 16px;font-size:24px;line-height:30px;font-weight:700;">Alla Vostra contact message</h1>
                ${renderContactDetailRow("Name", contactMessage.name)}
                ${renderContactDetailRow("Email", contactMessage.email)}
                ${renderContactDetailRow(
                  "Phone",
                  contactMessage.phone || "Not provided",
                )}
                ${renderContactDetailRow("Submitted", contactMessage.submittedAt)}
                <h2 style="margin:24px 0 8px;font-size:16px;line-height:22px;">Message</h2>
                <p style="margin:0;font-size:15px;line-height:22px;white-space:pre-wrap;">${escapeHtml(
                  contactMessage.message,
                )}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderContactDetailRow(label, value) {
  return `<p style="margin:0 0 8px;font-size:15px;line-height:22px;"><strong>${escapeHtml(
    label,
  )}:</strong> ${escapeHtml(value)}</p>`;
}

function renderOrderConfirmationText(order) {
  const lines = [
    `Hi ${order.customerFirstName},`,
    "",
    "Thank you for your Alla Vostra order. We received your payment.",
    "",
    "Order summary:",
    ...order.lineItems.map(
      (item) =>
        `${item.quantity} x ${item.name} - ${formatCurrency(
          item.lineTotalCents,
        )}`,
    ),
    `Subtotal: ${order.subtotal}`,
    `Delivery: ${order.deliveryFee}`,
    `Tax: ${order.tax}`,
    `Total paid: ${order.amount}`,
    "",
    "Delivery address:",
    order.deliveryAddress || "Delivery address on file",
    "",
    `Payment ID: ${order.paymentId || order.paymentIntentId}`,
    "",
    "We will contact you if anything needs attention.",
    "",
    "Alla Vostra",
  ];

  return lines.join("\n");
}

function renderOrderConfirmationHtml(order) {
  const itemRows = order.lineItems
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e6e0d7;">${escapeHtml(
            item.quantity,
          )} x ${escapeHtml(item.name)}</td>
          <td align="right" style="padding:8px 0;border-bottom:1px solid #e6e0d7;">${escapeHtml(
            formatCurrency(item.lineTotalCents),
          )}</td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f7f1e6;color:#111111;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f1e6;">
      <tr>
        <td align="center" style="padding:28px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e6e0d7;">
            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 16px;font-size:24px;line-height:30px;font-weight:700;">Alla Vostra</h1>
                <p style="margin:0 0 18px;font-size:16px;line-height:24px;">Hi ${escapeHtml(
                  order.customerFirstName,
                )}, thank you for your order. We received your payment.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:15px;line-height:22px;">
                  ${itemRows}
                  ${renderTotalRow("Subtotal", order.subtotal)}
                  ${renderTotalRow("Delivery", order.deliveryFee)}
                  ${renderTotalRow("Tax", order.tax)}
                  ${renderTotalRow("Total paid", order.amount, true)}
                </table>
                <h2 style="margin:24px 0 8px;font-size:16px;line-height:22px;">Delivery address</h2>
                <p style="margin:0 0 22px;font-size:15px;line-height:22px;">${escapeHtml(
                  order.deliveryAddress || "Delivery address on file",
                )}</p>
                <p style="margin:0 0 8px;font-size:13px;line-height:18px;color:#555555;">Payment ID: ${escapeHtml(
                  order.paymentId || order.paymentIntentId,
                )}</p>
                <p style="margin:0;font-size:15px;line-height:22px;">We will contact you if anything needs attention.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderTotalRow(label, value, isGrandTotal = false) {
  const fontWeight = isGrandTotal ? "700" : "400";

  return `
    <tr>
      <td style="padding:8px 0;font-weight:${fontWeight};">${escapeHtml(
        label,
      )}</td>
      <td align="right" style="padding:8px 0;font-weight:${fontWeight};">${escapeHtml(
        value,
      )}</td>
    </tr>`;
}

function parseLineItems(value) {
  try {
    const parsed = JSON.parse(value || "[]");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => ({
      lineTotalCents: numberFromCents(item.lineTotalCents),
      name: sanitizeText(item.name, 80) || "Alla Vostra item",
      quantity: Math.max(1, Number(item.quantity || 1)),
    }));
  } catch {
    return [];
  }
}

function parsePayPalLineItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => {
    const quantity = Math.max(1, Number(item.quantity || 1));
    const unitAmountCents = centsFromPayPalAmount(item.unit_amount?.value);

    return {
      lineTotalCents: unitAmountCents * quantity,
      name: sanitizeText(item.name, 80) || "Alla Vostra item",
      quantity,
    };
  });
}

function formatStripeShippingAddress(shipping) {
  if (!shipping?.address) {
    return "";
  }

  return [
    shipping.address.line1,
    shipping.address.line2,
    shipping.address.city,
    shipping.address.state,
    shipping.address.postal_code,
  ]
    .map((value) => sanitizeText(value, 160))
    .filter(Boolean)
    .join(", ");
}

function formatPayPalShippingAddress(shipping) {
  const address = shipping?.address || {};

  return [
    address.address_line_1,
    address.address_line_2,
    address.admin_area_2,
    address.admin_area_1,
    address.postal_code,
  ]
    .map((value) => sanitizeText(value, 160))
    .filter(Boolean)
    .join(", ");
}

function getPayPalCapture(paypalOrder) {
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

function centsFromPayPalAmount(value) {
  const number = Number(value || 0);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.round(number * 100));
}

function formatCurrency(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numberFromCents(cents) / 100);
}

function numberFromCents(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
}

function sanitizeText(value, maxLength) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

function sanitizeMultilineText(value, maxLength) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/[ \t]+/g, " "))
    .join("\n")
    .trim()
    .slice(0, maxLength);
}

function sanitizeEmail(value) {
  const email = sanitizeText(value, 160);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

module.exports = {
  sendContactMessageEmail,
  sendOrderConfirmationEmail,
  sendPayPalOrderConfirmationEmail,
};
