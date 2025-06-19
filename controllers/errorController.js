const logger = require("../util/logger");

module.exports = (err, req, res, next) => {
  logger.error(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let message = err.message;
  if (err.name == "SequelizeUniqueConstraintError") {
    message =
      err.errors && err.errors.length > 0 ? err.errors[0].message : message;
  }
  if (process.env.ENV == "production") {
    return res.status(err.statusCode).json({
      status: err.status,
      message: message,
    });
  }
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: message,
    stack: err.stack,
  });
};
