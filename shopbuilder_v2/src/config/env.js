const { z } = require("zod");
require("dotenv").config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  MERCHANT_1_DB_URL: z.string().url().optional(),
  MERCHANT_2_DB_URL: z.string().url().optional(),
  GMAIL_USER: z.string().email().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

module.exports = parsed.data;
