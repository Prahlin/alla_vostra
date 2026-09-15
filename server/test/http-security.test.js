const assert = require("node:assert/strict");
const test = require("node:test");

const {
  enforceRateLimit,
  setCorsHeaders,
} = require("../lib/http-security");

function responseMock() {
  return {
    body: null,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
    },
  };
}

test("CORS allows Alla Vostra but does not reflect an unknown origin", () => {
  const allowedResponse = responseMock();
  setCorsHeaders(
    { headers: { origin: "https://allavostra.com" } },
    allowedResponse,
  );
  assert.equal(
    allowedResponse.headers["Access-Control-Allow-Origin"],
    "https://allavostra.com",
  );

  const blockedResponse = responseMock();
  setCorsHeaders(
    { headers: { origin: "https://untrusted.example" } },
    blockedResponse,
  );
  assert.equal(blockedResponse.headers["Access-Control-Allow-Origin"], undefined);
});

test("rate limiter returns 429 after the configured request count", () => {
  const request = {
    headers: { "x-forwarded-for": "203.0.113.25" },
    socket: {},
  };
  const keyPrefix = `test-${Date.now()}`;

  assert.equal(
    enforceRateLimit(request, responseMock(), {
      keyPrefix,
      limit: 2,
      windowMs: 60000,
    }),
    true,
  );
  assert.equal(
    enforceRateLimit(request, responseMock(), {
      keyPrefix,
      limit: 2,
      windowMs: 60000,
    }),
    true,
  );

  const limitedResponse = responseMock();
  assert.equal(
    enforceRateLimit(request, limitedResponse, {
      keyPrefix,
      limit: 2,
      windowMs: 60000,
    }),
    false,
  );
  assert.equal(limitedResponse.statusCode, 429);
  assert.match(limitedResponse.body.error, /Too many requests/i);
});
