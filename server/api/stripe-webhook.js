const Stripe = require("stripe");

const { sendOrderConfirmationEmail } = require("../lib/postmark");

async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  if (!secretKey.startsWith("sk_")) {
    response.status(500).json({ error: "Stripe is not configured." });
    return;
  }

  if (!webhookSecret.startsWith("whsec_")) {
    response.status(500).json({ error: "Stripe webhook is not configured." });
    return;
  }

  const stripe = new Stripe(secretKey);
  const signature = request.headers["stripe-signature"];

  if (!signature) {
    response.status(400).json({ error: "Missing Stripe signature." });
    return;
  }

  let event;

  try {
    const rawBody = await readRawBody(request);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    response.status(400).json({
      error: `Webhook signature verification failed: ${error.message}`,
    });
    return;
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      await handlePaymentIntentSucceeded(stripe, event.data.object);
    }

    response.status(200).json({ received: true });
  } catch (error) {
    response.status(500).json({
      error: error.message || "Webhook handling failed.",
    });
  }
}

handler.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = handler;

async function handlePaymentIntentSucceeded(stripe, eventPaymentIntent) {
  const paymentIntent = await stripe.paymentIntents.retrieve(
    eventPaymentIntent.id,
  );
  const metadata = paymentIntent.metadata || {};

  if (metadata.confirmation_email_sent === "yes") {
    return;
  }

  if (!paymentIntent.receipt_email) {
    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: {
        ...metadata,
        confirmation_email_skipped: "missing_receipt_email",
      },
    });
    return;
  }

  const postmarkResult = await sendOrderConfirmationEmail({ paymentIntent });
  const messageId = postmarkResult.MessageID || postmarkResult.MessageId || "";

  await stripe.paymentIntents.update(paymentIntent.id, {
    metadata: {
      ...metadata,
      confirmation_email_message_id: String(messageId).slice(0, 500),
      confirmation_email_sent: "yes",
      confirmation_email_sent_at: new Date().toISOString(),
    },
  });
}

async function readRawBody(request) {
  if (typeof request.body === "string") {
    return request.body;
  }

  if (Buffer.isBuffer(request.body)) {
    return request.body.toString("utf8");
  }

  if (request.rawBody) {
    return Buffer.isBuffer(request.rawBody)
      ? request.rawBody.toString("utf8")
      : String(request.rawBody);
  }

  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on("data", (chunk) => {
      chunks.push(Buffer.from(chunk));
    });
    request.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    request.on("error", reject);
  });
}
