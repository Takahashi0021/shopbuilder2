function success(res, data, statusCode = 200, meta = null) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

function error(res, message, statusCode = 500, details = null) {
  const body = { success: false, error: { message, code: statusCode } };
  if (details) body.error.details = details;
  return res.status(statusCode).json(body);
}

function paginated(res, data, cursor, total) {
  return res.status(200).json({
    success: true,
    data,
    meta: { nextCursor: cursor, total },
  });
}

module.exports = { success, error, paginated };
