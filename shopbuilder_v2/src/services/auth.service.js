const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const prisma = require("../config/database");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const emailService = require("./email.service");

async function register({ email, username, password, role }) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    if (!existing.isActive) {
      const passwordHash = await bcrypt.hash(password, 12);
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: existing.id },
        data: { isActive: true, isEmailVerified: false, passwordHash, role, username, verificationToken, verificationExpiry },
      });

      try {
        await emailService.sendVerificationEmail(email, verificationToken, username);
        console.log("✅ Verification email sent to:", email);
      } catch (e) {
        console.error("❌ Email error:", e.message);
      }

      return { email, username, role, isEmailVerified: false };
    }

    const field = existing.email === email ? "email" : "username";
    const err = new Error(`${field} already in use`);
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: { email, username, passwordHash, role, verificationToken, verificationExpiry },
    select: { id: true, email: true, username: true, role: true, isEmailVerified: true, createdAt: true },
  });

  try {
    await emailService.sendVerificationEmail(email, verificationToken, username);
    console.log("✅ Verification email sent to:", email);
  } catch (e) {
    console.error("❌ Email error:", e.message);
  }

  return user;
}

async function verifyEmail(token) {
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    const err = new Error("Invalid or expired verification token");
    err.statusCode = 400;
    throw err;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, verificationToken: null, verificationExpiry: null },
  });

  return { message: "Email verified successfully" };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  if (!user.isEmailVerified) {
    const err = new Error("Please verify your email before logging in");
    err.statusCode = 403;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error("Account is deactivated");
    err.statusCode = 403;
    throw err;
  }

  const payload = { userId: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ userId: user.id });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, username: user.username, role: user.role, tenantId: user.tenantId },
  };
}

async function refresh(refreshToken) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    const err = new Error("Invalid or expired refresh token");
    err.statusCode = 401;
    throw err;
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    const err = new Error("Refresh token revoked or expired");
    err.statusCode = 401;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 401;
    throw err;
  }

  const newAccessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  });

  return { accessToken: newAccessToken };
}

async function logout(refreshToken) {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revokedAt: new Date() },
  });
}

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  try {
    await emailService.sendPasswordResetEmail(email, resetToken, user.username);
    console.log("✅ Password reset email sent to:", email);
  } catch (e) {
    console.error("❌ Email error:", e.message);
  }
}

async function resetPassword(token, newPassword) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    const err = new Error("Invalid or expired reset token");
    err.statusCode = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  await prisma.refreshToken.updateMany({
    where: { userId: user.id },
    data: { revokedAt: new Date() },
  });

  return { message: "Password reset successfully" };
}

module.exports = { register, verifyEmail, login, refresh, logout, forgotPassword, resetPassword };