const { HttpError } = require("../lib/http");

function notFoundHandler(_req, _res, next) {
  next(new HttpError(404, "Endpoint tidak ditemukan."));
}

function errorHandler(error, _req, res, _next) {
  const status = error instanceof HttpError ? error.status : 500;
  const message =
    error instanceof HttpError
      ? error.message
      : "Terjadi kesalahan pada server.";

  if (!(error instanceof HttpError)) {
    console.error(error);
  }

  res.status(status).json({
    error: {
      message,
      details: error.details || null,
    },
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
