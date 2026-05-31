const { query } = require("../../lib/db");
const { comparePassword, hashPassword, serializeUser } = require("../../lib/auth");
const { assert } = require("../../lib/http");

async function findUserByEmail(email) {
  const result = await query(
    `
      SELECT id, username, full_name, email, password_hash, role, avatar_url, created_at, updated_at
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
      SELECT id, username, full_name, email, role, avatar_url, created_at, updated_at
      FROM users
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] || null;
}

async function authenticateUser(email, password) {
  email = String(email || "").trim().toLowerCase();
  password = String(password || "").trim();

  assert(email, 400, "Email wajib diisi.");
  assert(password, 400, "Password wajib diisi.");

  const user = await findUserByEmail(email);
  assert(user, 401, "Email atau password salah.");

  const passwordMatches = await comparePassword(password, user.password_hash);
  assert(passwordMatches, 401, "Email atau password salah.");

  return serializeUser(user);
}

async function updateUserProfile(userId, input = {}) {
  const currentResult = await query(
    `
      SELECT id, username, full_name, email, password_hash, role, avatar_url
      FROM users
      WHERE id = $1
    `,
    [userId],
  );
  const current = currentResult.rows[0];
  assert(current, 404, "Pengguna tidak ditemukan.");

  const nextFullName =
    input.fullName === undefined ? current.full_name : String(input.fullName).trim();
  const nextEmail =
    input.email === undefined ? current.email : String(input.email).trim().toLowerCase();
  const nextAvatarUrl =
    input.avatarUrl === undefined ? current.avatar_url : String(input.avatarUrl || "").trim();

  assert(nextFullName, 400, "Nama lengkap wajib diisi.");
  assert(nextEmail, 400, "Email wajib diisi.");

  if (nextEmail !== current.email) {
    const existing = await query(
      "SELECT id FROM users WHERE lower(email) = lower($1) AND id <> $2",
      [nextEmail, userId],
    );
    assert(existing.rowCount === 0, 409, "Email sudah dipakai akun lain.");
  }

  let nextPasswordHash = current.password_hash;
  if (input.newPassword) {
    assert(input.currentPassword, 400, "Password saat ini wajib diisi.");
    const passwordMatches = await comparePassword(
      input.currentPassword,
      current.password_hash,
    );
    assert(passwordMatches, 401, "Password saat ini salah.");
    assert(
      String(input.newPassword).length >= 6,
      400,
      "Password baru minimal 6 karakter.",
    );
    nextPasswordHash = await hashPassword(input.newPassword);
  }

  const nextUsername = input.username === undefined ? current.username : String(input.username).trim();

  // If changing username, check uniqueness
  if (nextUsername !== current.username && nextUsername !== "") {
    const existingUsername = await query(
      "SELECT id FROM users WHERE lower(username) = lower($1) AND id != $2",
      [nextUsername, userId],
    );
    assert(existingUsername.rowCount === 0, 409, "Username sudah digunakan oleh orang lain.");
    assert(/^[a-zA-Z0-9_]+$/.test(nextUsername), 400, "Username hanya boleh berisi huruf, angka, dan underscore.");
  }

  const result = await query(
    `
      UPDATE users
      SET full_name = $1, email = $2, avatar_url = $3, username = $4, password_hash = $6, updated_at = NOW()
      WHERE id = $5
      RETURNING id, username, full_name, email, role, avatar_url, created_at, updated_at
    `,
    [nextFullName, nextEmail, nextAvatarUrl || null, nextUsername, userId, nextPasswordHash],
  );

  return serializeUser(result.rows[0]);
}

module.exports = {
  findUserByEmail,
  findUserById,
  authenticateUser,
  updateUserProfile,
};
