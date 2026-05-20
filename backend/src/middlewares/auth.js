const { env } = require("../config/env");
const { verifyToken } = require("../lib/auth");
const { query } = require("../lib/db");
const { HttpError } = require("../lib/http");

async function attachCurrentUser(req, _res, next) {
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const token = bearerToken || req.cookies?.[env.authCookieName];

  req.user = null;

  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyToken(token);
    const result = await query(
      `
        SELECT id, full_name, email, role
        FROM users
        WHERE id = $1
      `,
      [payload.sub],
    );

    req.user = result.rows[0] || null;
    next();
  } catch (_error) {
    req.user = null;
    next();
  }
}

function requireAuth(req, _res, next) {
  if (!req.user) {
    next(new HttpError(401, "Silakan login terlebih dahulu."));
    return;
  }

  next();
}

function requireRole(role) {
  return function roleGuard(req, _res, next) {
    if (!req.user) {
      next(new HttpError(401, "Silakan login terlebih dahulu."));
      return;
    }

    if (req.user.role !== role) {
      next(new HttpError(403, "Akses halaman ini dibatasi untuk petugas."));
      return;
    }

    next();
  };
}

module.exports = {
  attachCurrentUser,
  requireAuth,
  requireRole,
};
