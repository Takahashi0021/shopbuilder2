const logger = require("../utils/logger");

function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, path: req.path });

  if (err.code === "P2002") {
    return res.status(409).json({ success: false, error: { message: "Resource already exists", code: 409 } });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ success: false, error: { message: "Resource not found", code: 404 } });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode < 500 ? err.message : "Internal server error";

  res.status(statusCode).json({ success: false, error: { message, code: statusCode } });
}

function notFound(req, res) {
  res.status(404).json({ success: false, error: { message: `Route ${req.method} ${req.path} not found`, code: 404 } });
}

module.exports = { errorHandler, notFound };
