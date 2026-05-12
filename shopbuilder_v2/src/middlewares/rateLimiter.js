const rateLimit = require("express-rate-limit");
const { error } = require("../utils/response");

function createRateLimiter(windowMs, max, prefix) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `${prefix}:${req.ip}`,
    handler: (req, res) =>
      error(res, `Too many requests. Max ${max} per ${windowMs / 60000} minute(s).`, 429),
  });
}

const authLimiter = createRateLimiter(60 * 1000, 5, "auth");
const apiLimiter = createRateLimiter(60 * 1000, 100, "api");

module.exports = { authLimiter, apiLimiter };