const { sendContactMessageEmail } = require("../lib/postmark");

module.exports = async function handler(request, response) {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed." });
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

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
}

function getRequestBody(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  if (typeof request.body === "string" && request.body.trim()) {
    return JSON.parse(request.body);
  }

  return {};
}
