const assert = require("node:assert/strict");
const test = require("node:test");

const { buildOrder, taxRate } = require("../lib/orders");

function validPayload() {
  return {
    pricingVersion: 2,
    items: [{ name: "Piccola", quantity: 1 }],
    contact: {
      email: "buyer@example.com",
      firstName: "Jamie",
      lastName: "Customer",
      phone: "954-555-0100",
    },
    delivery: {
      address: "123 Ocean Drive",
      apartment: "Unit 4",
      city: "Fort Lauderdale",
      date: "21st",
      firstName: "Taylor",
      hour: "7",
      lastName: "Recipient",
      minute: "15",
      month: "Sep",
      period: "PM",
      state: "FL",
      zip: "33301",
    },
    payment: {
      billingAddressMatchesDelivery: true,
      selectedMethod: "Google Pay",
    },
  };
}

test("buildOrder preserves the delivery schedule and applies 7% tax", () => {
  const order = buildOrder(validPayload());

  assert.equal(taxRate, 0.07);
  assert.equal(order.subtotalCents, 5500);
  assert.equal(order.deliveryFeeCents, 1000);
  assert.equal(order.taxCents, 455);
  assert.equal(order.amountCents, 6955);
  assert.deepEqual(order.deliverySchedule, {
    day: 21,
    dayLabel: "21st",
    label: "Sep 21st at 7:15 PM",
    month: "Sep",
    time: "7:15 PM",
  });
  assert.equal(order.metadata.delivery_schedule, "Sep 21st at 7:15 PM");
  assert.equal(order.metadata.contact_phone, "954-555-0100");
  assert.equal(order.metadata.tax_rate, "0.07");
});

test("buildOrder rejects dates that do not exist in the selected month", () => {
  const payload = validPayload();
  payload.delivery.month = "Apr";
  payload.delivery.date = "31st";

  assert.throws(
    () => buildOrder(payload),
    /valid delivery day/i,
  );
});

test("buildOrder rejects delivery ZIP codes outside the service area", () => {
  const payload = validPayload();
  payload.delivery.zip = "32801";

  assert.throws(
    () => buildOrder(payload),
    /Miami-Dade or Broward/i,
  );
});

test("buildOrder rejects missing fulfillment contact details", () => {
  const payload = validPayload();
  payload.contact.email = "not-an-email";

  assert.throws(() => buildOrder(payload), /valid contact email/i);
});

test("legacy app orders retain 6% tax during the Play rollout", () => {
  const payload = validPayload();
  delete payload.pricingVersion;
  const order = buildOrder(payload);

  assert.equal(order.pricingVersion, 1);
  assert.equal(order.taxCents, 390);
  assert.equal(order.amountCents, 6890);
  assert.equal(order.metadata.tax_rate, "0.06");
});
