const http = require("http");
const { URL } = require("url");

const handlers = {
  "/api/contact-message": require("./api/contact-message"),
  "/api/health": require("./api/health"),
  "/api/paypal-capture-order": require("./api/paypal-capture-order"),
  "/api/paypal-create-order": require("./api/paypal-create-order"),
  "/api/payment-sheet": require("./api/payment-sheet"),
  "/api/stripe-webhook": require("./api/stripe-webhook"),
};

const port = Number(process.env.PORT || 3000);
const maxBodyBytes = Number(process.env.LOCAL_BODY_LIMIT_BYTES || 1024 * 1024);

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const pathname = url.pathname.replace(/\/$/, "") || "/";
  const handler = handlers[pathname];

  addResponseHelpers(response);

  if (!handler) {
    response.status(404).json({ error: "Route not found." });
    return;
  }

  request.query = Object.fromEntries(url.searchParams.entries());

  try {
    await attachBody(request, handler);
    await handler(request, response);
  } catch (error) {
    if (!response.writableEnded) {
      response.status(error.statusCode || 500).json({
        error: error.message || "Local backend request failed.",
      });
    }
  }
});

server.listen(port, () => {
  console.log(`Alla Vostra local backend listening on http://localhost:${port}`);
});

function addResponseHelpers(response) {
  response.status = function status(code) {
    response.statusCode = code;
    return response;
  };

  response.json = function json(payload) {
    if (!response.hasHeader("Content-Type")) {
      response.setHeader("Content-Type", "application/json; charset=utf-8");
    }

    response.end(JSON.stringify(payload));
  };

  response.send = function send(payload) {
    response.end(payload);
  };
}

async function attachBody(request, handler) {
  const rawBody = await readRequestBody(request);
  request.rawBody = rawBody;

  if (handler.config?.api?.bodyParser === false) {
    request.body = rawBody;
    return;
  }

  if (!rawBody.length) {
    request.body = {};
    return;
  }

  const contentType = request.headers["content-type"] || "";

  if (contentType.includes("application/json")) {
    request.body = JSON.parse(rawBody.toString("utf8"));
    return;
  }

  request.body = rawBody.toString("utf8");
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytes = 0;

    request.on("data", (chunk) => {
      bytes += chunk.length;

      if (bytes > maxBodyBytes) {
        const error = new Error("Request body is too large.");
        error.statusCode = 413;
        reject(error);
        request.destroy();
        return;
      }

      chunks.push(chunk);
    });

    request.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    request.on("error", reject);
  });
}
