const paypalApiBases = {
  live: "https://api-m.paypal.com",
  sandbox: "https://api-m.sandbox.paypal.com",
};

function getPayPalEnvironment() {
  const value = String(
    process.env.PAYPAL_ENVIRONMENT || process.env.PAYPAL_MODE || "sandbox",
  )
    .trim()
    .toLowerCase();

  return value === "live" ? "live" : "sandbox";
}

function getPayPalConfigurationIssue() {
  const clientId = process.env.PAYPAL_CLIENT_ID || "";
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";

  if (!clientId) {
    return "PayPal client ID is not configured.";
  }

  if (!clientSecret) {
    return "PayPal client secret is not configured.";
  }

  return "";
}

async function createPayPalOrder(order, { cancelUrl, returnUrl }) {
  const payload = buildPayPalOrderPayload(order, { cancelUrl, returnUrl });
  const requestId = `alla-vostra-create-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  return paypalRequest("/v2/checkout/orders", {
    body: payload,
    headers: {
      "PayPal-Request-Id": requestId,
      Prefer: "return=representation",
    },
    method: "POST",
  });
}

async function capturePayPalOrder(paypalOrderId) {
  const orderId = String(paypalOrderId || "").trim();

  if (!/^[A-Z0-9-]{6,64}$/i.test(orderId)) {
    const error = new Error("PayPal order ID is missing.");
    error.statusCode = 400;
    throw error;
  }

  return paypalRequest(
    `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      body: {},
      headers: {
        "PayPal-Request-Id": `alla-vostra-capture-${orderId}`,
        Prefer: "return=representation",
      },
      method: "POST",
    },
  );
}

function getPayPalApprovalUrl(paypalOrder) {
  const links = Array.isArray(paypalOrder?.links) ? paypalOrder.links : [];
  const approvalLink =
    links.find((link) => link.rel === "payer-action") ||
    links.find((link) => link.rel === "approve");

  return approvalLink?.href || "";
}

function buildPayPalOrderPayload(order, { cancelUrl, returnUrl }) {
  return {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          breakdown: {
            item_total: money(order.subtotalCents),
            shipping: money(order.deliveryFeeCents),
            tax_total: money(order.taxCents),
          },
          currency_code: "USD",
          value: amount(order.amountCents),
        },
        custom_id: `alla-vostra-${Date.now()}`,
        description: "Alla Vostra order",
        items: order.lineItems.map((item) => ({
          category: "PHYSICAL_GOODS",
          name: item.name,
          quantity: String(item.quantity),
          unit_amount: money(item.unitAmountCents),
        })),
        shipping: {
          address: {
            address_line_1: order.shipping.address.line1,
            address_line_2: order.shipping.address.line2 || undefined,
            admin_area_1: order.shipping.address.state,
            admin_area_2: order.shipping.address.city,
            country_code: order.shipping.address.country,
            postal_code: order.shipping.address.postal_code,
          },
          name: {
            full_name: order.shipping.name,
          },
        },
      },
    ],
    payment_source: {
      paypal: {
        email_address: order.email || undefined,
        experience_context: {
          brand_name: "Alla Vostra",
          cancel_url: cancelUrl,
          landing_page: "LOGIN",
          payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
          return_url: returnUrl,
          shipping_preference: "SET_PROVIDED_ADDRESS",
          user_action: "PAY_NOW",
        },
      },
    },
  };
}

async function paypalRequest(path, { body, headers = {}, method }) {
  const configurationIssue = getPayPalConfigurationIssue();

  if (configurationIssue) {
    const error = new Error(configurationIssue);
    error.statusCode = 500;
    throw error;
  }

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${paypalApiBases[getPayPalEnvironment()]}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body || {}),
  });
  const payload = await readJsonResponse(response);

  if (!response.ok) {
    const error = new Error(
      payload.message ||
        payload.error_description ||
        `PayPal request failed with ${response.status}.`,
    );
    error.statusCode = response.status;
    error.paypal = payload;
    throw error;
  }

  return payload;
}

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID || "";
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );
  const response = await fetch(
    `${paypalApiBases[getPayPalEnvironment()]}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    },
  );
  const payload = await readJsonResponse(response);

  if (!response.ok || !payload.access_token) {
    const error = new Error(
      payload.error_description ||
        payload.message ||
        "PayPal authentication failed.",
    );
    error.statusCode = response.status || 500;
    error.paypal = payload;
    throw error;
  }

  return payload.access_token;
}

async function readJsonResponse(response) {
  const responseText = await response.text();

  try {
    return responseText ? JSON.parse(responseText) : {};
  } catch {
    return {};
  }
}

function money(cents) {
  return {
    currency_code: "USD",
    value: amount(cents),
  };
}

function amount(cents) {
  return (Math.max(0, Number(cents || 0)) / 100).toFixed(2);
}

module.exports = {
  capturePayPalOrder,
  createPayPalOrder,
  getPayPalApprovalUrl,
};
