const { error } = require("../utils/response");

function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return error(res, "Validation failed", 422, result.error.flatten().fieldErrors);
    }
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
