const assert = require("node:assert/strict");
const test = require("node:test");

const {
  sendOrderConfirmationEmail,
  sendOrderNotificationEmail,
  sendPayPalOrderNotificationEmail,
} = require("../lib/postmark");

const originalFetch = global.fetch;
const originalEnv = {
  POSTMARK_CONTACT_TO_EMAIL: process.env.POSTMARK_CONTACT_TO_EMAIL,
  POSTMARK_FROM_EMAIL: process.env.POSTMARK_FROM_EMAIL,
  POSTMARK_ORDER_TO_EMAIL: process.env.POSTMARK_ORDER_TO_EMAIL,
  POSTMARK_REPLY_TO_EMAIL: process.env.POSTMARK_REPLY_TO_EMAIL,
  POSTMARK_SERVER_TOKEN: process.env.POSTMARK_SERVER_TOKEN,
};

test.beforeEach(() => {
  process.env.POSTMARK_SERVER_TOKEN = "test-token";
  process.env.POSTMARK_FROM_EMAIL = "receipts@example.com";
  process.env.POSTMARK_REPLY_TO_EMAIL = "hello@example.com";
  process.env.POSTMARK_ORDER_TO_EMAIL = "orders@example.com";
  global.fetch = async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ MessageID: "message-123" }),
  });
});

test.afterEach(() => {
  global.fetch = originalFetch;

  Object.entries(originalEnv).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
      return;
    }

    process.env[key] = value;
  });
});

test("Stripe emails include the requested schedule and merchant recipient", async () => {
  const requests = [];
  global.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body));
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ MessageID: `message-${requests.length}` }),
    };
  };
  const paymentIntent = {
    amount: 6955,
    id: "pi_test_123",
    metadata: {
      contact_email: "buyer@example.com",
      contact_name: "Jamie Customer",
      contact_phone: "954-555-0100",
      delivery_address: "123 Ocean Drive, Fort Lauderdale, FL, 33301",
      delivery_fee_cents: "1000",
      delivery_schedule: "Sep 21st at 7:15 PM",
      order_items: JSON.stringify([
        { lineTotalCents: 5500, name: "Piccola", quantity: 1 },
      ]),
      subtotal_cents: "5500",
      tax_cents: "455",
    },
    receipt_email: "buyer@example.com",
    shipping: { name: "Taylor Recipient", phone: "954-555-0100" },
  };

  await sendOrderNotificationEmail({ paymentIntent });
  await sendOrderConfirmationEmail({ paymentIntent });

  assert.equal(requests[0].To, "orders@example.com");
  assert.equal(requests[0].ReplyTo, "buyer@example.com");
  assert.match(requests[0].TextBody, /NEW PAID ALLA VOSTRA ORDER/);
  assert.match(requests[0].TextBody, /Sep 21st at 7:15 PM/);
  assert.equal(requests[1].To, "buyer@example.com");
  assert.match(requests[1].TextBody, /Requested delivery:\nSep 21st at 7:15 PM/);
});

test("PayPal merchant email recovers schedule and phone from custom_id", async () => {
  let requestPayload;
  global.fetch = async (_url, options) => {
    requestPayload = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ MessageID: "paypal-message" }),
    };
  };

  await sendPayPalOrderNotificationEmail({
    paypalOrder: {
      id: "PAYPAL-ORDER-123",
      payer: {
        email_address: "paypal-buyer@example.com",
        name: { given_name: "Jamie", surname: "Customer" },
      },
      purchase_units: [
        {
          amount: {
            breakdown: {
              item_total: { value: "55.00" },
              shipping: { value: "10.00" },
              tax_total: { value: "4.55" },
            },
            value: "69.55",
          },
          custom_id:
            "AV;delivery=Sep 21st at 7:15 PM;phone=954-555-0100;email=buyer@example.com",
          items: [
            {
              name: "Piccola",
              quantity: "1",
              unit_amount: { value: "55.00" },
            },
          ],
          payments: { captures: [{ id: "CAPTURE-123" }] },
          shipping: {
            address: {
              address_line_1: "123 Ocean Drive",
              admin_area_1: "FL",
              admin_area_2: "Fort Lauderdale",
              postal_code: "33301",
            },
          },
        },
      ],
    },
  });

  assert.equal(requestPayload.To, "orders@example.com");
  assert.equal(requestPayload.ReplyTo, "buyer@example.com");
  assert.match(requestPayload.TextBody, /Sep 21st at 7:15 PM/);
  assert.match(requestPayload.TextBody, /954-555-0100/);
});
