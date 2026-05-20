const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      fullName: user.full_name || user.fullName,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

function serializeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    fullName: user.full_name || user.fullName,
    email: user.email,
    role: user.role,
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  serializeUser,
};
