const { sendContactMessageEmail } = require("../lib/postmark");
const { enforceRateLimit, setCorsHeaders } = require("../lib/http-security");

module.exports = async function handler(request, response) {
  setCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  if (
    !enforceRateLimit(request, response, {
      keyPrefix: "contact-message",
      limit: 5,
      windowMs: 10 * 60 * 1000,
    })
  ) {
    return;
  }

  try {
    const payload = getRequestBody(request);
    const postmarkResult = await sendContactMessageEmail({
      contact: payload.contact,
    });
    const messageId = postmarkResult.MessageID || postmarkResult.MessageId || "";

    response.status(200).json({
      message: "Message sent.",
      messageId,
    });
  } catch (error) {
    response.status(error.statusCode || 500).json({
      error: error.message || "Contact message failed.",
    });
  }
};

function getRequestBody(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  if (typeof request.body === "string" && request.body.trim()) {
    return JSON.parse(request.body);
  }

  return {};
}
