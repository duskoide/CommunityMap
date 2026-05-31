const express = require("express");
const rateLimit = require("express-rate-limit");
const { query } = require("../../lib/db");
const { hashPassword, serializeUser, signToken } = require("../../lib/auth");
const { assert } = require("../../lib/http");
const { env } = require("../../config/env");
const { authenticateUser, updateUserProfile } = require("./auth.service");
const { requireAuth } = require("../../middlewares/auth");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    error: {
      message: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
      code: "RATE_LIMIT_EXCEEDED",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

function setAuthCookie(res, token) {
  res.cookie(env.authCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

router.post("/register", async (req, res, next) => {
  try {
    const { username, fullName, email, password, role = "citizen" } = req.body || {};

    assert(username?.trim(), 400, "Username wajib diisi.");
    assert(/^[a-zA-Z0-9_]+$/.test(username), 400, "Username hanya boleh berisi huruf, angka, dan underscore.");
    assert(fullName?.trim(), 400, "Nama lengkap wajib diisi.");
    assert(email?.trim(), 400, "Email wajib diisi.");
    assert(password?.trim(), 400, "Password wajib diisi.");
    assert(password.trim().length >= 6, 400, "Password minimal 6 karakter.");
    assert(
      ["citizen", "admin"].includes(role),
      400,
      "Role pengguna tidak valid.",
    );

    const existingEmail = await query(
      "SELECT id FROM users WHERE lower(email) = lower($1)",
      [email],
    );
    assert(existingEmail.rowCount === 0, 409, "Email sudah terdaftar.");

    const existingUsername = await query(
      "SELECT id FROM users WHERE lower(username) = lower($1)",
      [username],
    );
    assert(existingUsername.rowCount === 0, 409, "Username sudah terdaftar.");

    const passwordHash = await hashPassword(password);
    const result = await query(
      `
        INSERT INTO users (username, full_name, email, password_hash, role, avatar_url, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NULL, NOW(), NOW())
        RETURNING id, username, full_name, email, role, avatar_url
      `,
      [username.trim(), fullName.trim(), email.trim().toLowerCase(), passwordHash, role],
    );

    const user = serializeUser(result.rows[0]);
    const token = signToken(user);
    setAuthCookie(res, token);

    res.status(201).json({
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await authenticateUser(email, password);
    const token = signToken(user);
    setAuthCookie(res, token);

    res.json({
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", async (_req, res) => {
  res.clearCookie(env.authCookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    path: "/",
  });

  res.json({
    data: {
      message: "Sesi login sudah diakhiri.",
    },
  });
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({
    data: {
      user: serializeUser(req.user),
    },
  });
});

router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await updateUserProfile(req.user.id, req.body || {});
    const token = signToken(user);
    setAuthCookie(res, token);

    res.json({
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = { authRouter: router };
