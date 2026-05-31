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
  host: process.env.BACKEND_HOST || "127.0.0.1",
  uploadDir:
    process.env.UPLOAD_DIR || path.resolve(__dirname, "..", "..", "uploads"),
  frontendOrigins: process.env.FRONTEND_ORIGIN
    ? parseFrontendOrigins(process.env.FRONTEND_ORIGIN)
    : defaultOrigins,
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://communitymap:communitymap@localhost:5433/communitymap",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  authCookieName: process.env.AUTH_COOKIE_NAME || "communitymap_token",
  awsRegion: process.env.AWS_REGION || "ap-southeast-3",
  awsS3Bucket: process.env.AWS_S3_BUCKET || "",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};

if (env.jwtSecret === "change-me" && env.nodeEnv === "production") {
  console.warn(
    "[SECURITY] JWT_SECRET is set to the default value 'change-me'. " +
    "Set a strong secret via the JWT_SECRET environment variable before deploying to production.",
  );
}

module.exports = { env };
