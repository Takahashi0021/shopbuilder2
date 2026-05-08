const authService = require("../services/auth.service");
const { success, error } = require("../utils/response");

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    return success(res, { user, message: "Registration successful. Please check your email to verify your account." }, 201);
  } catch (err) { next(err); }
}

async function verifyEmail(req, res, next) {
  try {
    const result = await authService.verifyEmail(req.query.token);
    return success(res, result);
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return success(res, result);
  } catch (err) { next(err); }
}

async function refreshToken(req, res, next) {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    return success(res, result);
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.body.refreshToken);
    return success(res, { message: "Logged out successfully" });
  } catch (err) { next(err); }
}

async function forgotPassword(req, res, next) {
  try {
    await authService.forgotPassword(req.body.email);
    return success(res, { message: "If that email exists, a reset link has been sent" });
  } catch (err) { next(err); }
}

async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(req.query.token, req.body.password);
    return success(res, result);
  } catch (err) { next(err); }
}

async function me(req, res) {
  return success(res, { user: req.user });
}

module.exports = { register, verifyEmail, login, refreshToken, logout, forgotPassword, resetPassword, me };
