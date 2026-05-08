const { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } = require("../../src/utils/jwt");

process.env.JWT_SECRET = "test-secret-key-that-is-at-least-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-refresh-key-that-is-at-least-32-chars-long";
process.env.JWT_ACCESS_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";

describe("JWT utilities", () => {
  const payload = { userId: "user-123", email: "test@test.com", role: "MERCHANT" };

  test("signs and verifies access token", () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
  });

  test("signs and verifies refresh token", () => {
    const token = signRefreshToken({ userId: "user-123" });
    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe("user-123");
  });

  test("throws on invalid token", () => {
    expect(() => verifyAccessToken("invalid.token.here")).toThrow();
  });

  test("access token has correct expiry metadata", () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });
});
