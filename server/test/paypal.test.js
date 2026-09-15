const assert = require("node:assert/strict");
const test = require("node:test");

const { buildOrder } = require("../lib/orders");
const { buildPayPalOrderPayload } = require("../lib/paypal");

test("PayPal purchase records retain fulfillment details", () => {
  const order = buildOrder({
    pricingVersion: 2,
    items: [{ name: "Sei Perfetto", quantity: 2 }],
    contact: {
      email: "buyer@example.com",
      firstName: "Jamie",
      lastName: "Customer",
      phone: "305-555-0123",
    },
    delivery: {
      address: "900 Biscayne Boulevard",
      city: "Miami",
      date: "2nd",
      firstName: "Taylor",
      hour: "10",
      lastName: "Recipient",
      minute: "30",
      month: "Oct",
      period: "AM",
      state: "FL",
      zip: "33132",
    },
    payment: { selectedMethod: "PayPal" },
  });
  const payload = buildPayPalOrderPayload(order, {
    cancelUrl: "allavostra://paypal-return?paypalStatus=cancel",
    returnUrl: "allavostra://paypal-return",
  });
  const purchaseUnit = payload.purchase_units[0];

  assert.match(purchaseUnit.description, /Oct 2nd at 10:30 AM/);
  assert.match(purchaseUnit.custom_id, /AV;v=2;/);
  assert.match(purchaseUnit.custom_id, /delivery=Oct 2nd at 10:30 AM/);
  assert.match(purchaseUnit.custom_id, /phone=305-555-0123/);
  assert.match(purchaseUnit.custom_id, /email=buyer@example.com/);
  assert.equal(purchaseUnit.amount.breakdown.tax_total.value, "9.94");
});
