const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[^a-zA-Z0-9]/, "Must contain special character"),
  role: z.enum(["MERCHANT", "CUSTOMER"]).default("CUSTOMER"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),
});

module.exports = { registerSchema, loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema };
