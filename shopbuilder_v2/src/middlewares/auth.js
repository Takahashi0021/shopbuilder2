const { verifyAccessToken } = require("../utils/jwt");
const { error } = require("../utils/response");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return error(res, "Authentication required", 401);
  }

  const token = authHeader.slice(7);
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return error(res, "Token expired", 401);
    }
    return error(res, "Invalid token", 401);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, "Authentication required", 401);
    }
    if (!roles.includes(req.user.role)) {
      return error(res, "Insufficient permissions", 403);
    }
    next();
  };
}

module.exports = { authenticate, authorize };
