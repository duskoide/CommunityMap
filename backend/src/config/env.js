const path = require("path");
const dotenv = require("dotenv");

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });

function parseFrontendOrigins(value) {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const frontendPort = Number(process.env.FRONTEND_PORT || 3000);
const defaultOrigins = [
  `http://localhost:${frontendPort}`,
  `http://127.0.0.1:${frontendPort}`,
  `http://localhost:${frontendPort + 1}`,
  `http://127.0.0.1:${frontendPort + 1}`,
];

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.BACKEND_PORT || 4000),
  frontendOrigins: process.env.FRONTEND_ORIGIN
    ? parseFrontendOrigins(process.env.FRONTEND_ORIGIN)
    : defaultOrigins,
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://communitymap:communitymap@localhost:5432/communitymap",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  authCookieName: process.env.AUTH_COOKIE_NAME || "communitymap_token",
};

module.exports = { env };
