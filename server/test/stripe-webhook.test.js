const assert = require("node:assert/strict");
const test = require("node:test");

const {
  handlePaymentIntentSucceeded,
  readRawBody,
} = require("../api/stripe-webhook");

const originalFetch = global.fetch;
const originalEnv = {
  POSTMARK_FROM_EMAIL: process.env.POSTMARK_FROM_EMAIL,
  POSTMARK_ORDER_TO_EMAIL: process.env.POSTMARK_ORDER_TO_EMAIL,
  POSTMARK_SERVER_TOKEN: process.env.POSTMARK_SERVER_TOKEN,
};

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

test("Stripe success records merchant and customer email delivery independently", async () => {
  process.env.POSTMARK_SERVER_TOKEN = "test-token";
  process.env.POSTMARK_FROM_EMAIL = "receipts@example.com";
  process.env.POSTMARK_ORDER_TO_EMAIL = "orders@example.com";
  const postmarkRequests = [];
  global.fetch = async (_url, options) => {
    const payload = JSON.parse(options.body);
    postmarkRequests.push(payload);
    return {
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({ MessageID: `message-${postmarkRequests.length}` }),
    };
  };

  const paymentIntent = {
    amount: 6955,
    id: "pi_webhook_test",
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
  const metadataUpdates = [];
  const stripe = {
    paymentIntents: {
      retrieve: async () => paymentIntent,
      update: async (_id, update) => {
        paymentIntent.metadata = update.metadata;
        metadataUpdates.push(update.metadata);
      },
    },
  };

  await handlePaymentIntentSucceeded(stripe, { id: paymentIntent.id });

  assert.equal(postmarkRequests.length, 2);
  assert.equal(postmarkRequests[0].To, "orders@example.com");
  assert.equal(postmarkRequests[1].To, "buyer@example.com");
  assert.equal(metadataUpdates.length, 2);
  assert.equal(paymentIntent.metadata.order_notification_email_sent, "yes");
  assert.equal(paymentIntent.metadata.confirmation_email_sent, "yes");

  await handlePaymentIntentSucceeded(stripe, { id: paymentIntent.id });
  assert.equal(postmarkRequests.length, 2);
});

test("readRawBody reads the request stream before touching Vercel body helpers", async () => {
  const listeners = {};
  const request = {
    get body() {
      throw new Error("request.body should not be read before the stream");
    },
    on(eventName, listener) {
      listeners[eventName] = listener;
    },
  };

  const rawBodyPromise = readRawBody(request);
  listeners.data(Buffer.from('{"ok":true}'));
  listeners.end();

  assert.equal(await rawBodyPromise, '{"ok":true}');
});
