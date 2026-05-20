const express = require("express");
const { query } = require("../../lib/db");
const { hashPassword, serializeUser, signToken } = require("../../lib/auth");
const { assert } = require("../../lib/http");
const { env } = require("../../config/env");
const { authenticateUser } = require("./auth.service");
const { requireAuth } = require("../../middlewares/auth");

const router = express.Router();

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
    const { fullName, email, password, role = "citizen" } = req.body || {};

    assert(fullName?.trim(), 400, "Nama lengkap wajib diisi.");
    assert(email?.trim(), 400, "Email wajib diisi.");
    assert(password?.trim(), 400, "Password wajib diisi.");
    assert(
      ["citizen", "admin"].includes(role),
      400,
      "Role pengguna tidak valid.",
    );

    const existing = await query(
      "SELECT id FROM users WHERE lower(email) = lower($1)",
      [email],
    );
    assert(existing.rowCount === 0, 409, "Email sudah terdaftar.");

    const passwordHash = await hashPassword(password);
    const result = await query(
      `
        INSERT INTO users (full_name, email, password_hash, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, full_name, email, role
      `,
      [fullName.trim(), email.trim().toLowerCase(), passwordHash, role],
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

router.post("/login", async (req, res, next) => {
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

module.exports = { authRouter: router };
