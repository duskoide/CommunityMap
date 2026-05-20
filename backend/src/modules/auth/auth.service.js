const { query } = require("../../lib/db");
const { comparePassword, serializeUser } = require("../../lib/auth");
const { assert } = require("../../lib/http");

async function findUserByEmail(email) {
  const result = await query(
    `
      SELECT id, full_name, email, password_hash, role, created_at, updated_at
      FROM users
      WHERE lower(email) = lower($1)
    `,
    [email],
  );

  return result.rows[0] || null;
}

async function findUserById(id) {
  const result = await query(
    `
      SELECT id, full_name, email, role, created_at, updated_at
      FROM users
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] || null;
}

async function authenticateUser(email, password) {
  assert(email, 400, "Email wajib diisi.");
  assert(password, 400, "Password wajib diisi.");

  const user = await findUserByEmail(email);
  assert(user, 401, "Email atau password salah.");

  const passwordMatches = await comparePassword(password, user.password_hash);
  assert(passwordMatches, 401, "Email atau password salah.");

  return serializeUser(user);
}

module.exports = {
  findUserByEmail,
  findUserById,
  authenticateUser,
};
