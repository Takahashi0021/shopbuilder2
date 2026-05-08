const request = require("supertest");

process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/shopbuilder_test";
process.env.REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
process.env.JWT_SECRET = "test-secret-key-that-is-at-least-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-refresh-key-that-is-at-least-32-chars-long";
process.env.JWT_ACCESS_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.CORS_ORIGINS = "http://localhost:3000";
process.env.NODE_ENV = "test";

let app;
let prisma;

beforeAll(async () => {
  app = require("../../src/index");
  prisma = require("../../src/config/database");
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { contains: "@test-integration.com" } } });
  await prisma.$disconnect();
  const redis = require("../../src/config/redis");
  await redis.quit();
});

describe("Auth Integration", () => {
  const testUser = {
    email: `user_${Date.now()}@test-integration.com`,
    username: `testuser_${Date.now()}`,
    password: "Secret@123",
    role: "CUSTOMER",
  };
  let refreshToken;
  let accessToken;

  test("POST /api/v1/auth/register - creates user", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
  });

  test("POST /api/v1/auth/register - rejects duplicate email", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(testUser);
    expect(res.status).toBe(409);
  });

  test("POST /api/v1/auth/login - issues tokens", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  test("POST /api/v1/auth/login - rejects wrong password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  test("GET /api/v1/auth/me - returns user with valid token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });

  test("GET /api/v1/auth/me - rejects missing token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  test("GET /api/v1/auth/me - rejects invalid token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.status).toBe(401);
  });

  test("POST /api/v1/auth/refresh - issues new access token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  test("POST /api/v1/auth/logout - revokes refresh token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/logout")
      .send({ refreshToken });
    expect(res.status).toBe(200);

    const retryRefresh = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken });
    expect(retryRefresh.status).toBe(401);
  });

  test("RBAC - CUSTOMER cannot access merchant-only route", async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    const customerToken = loginRes.body.data.accessToken;

    const res = await request(app)
      .get("/api/v1/tenants/me")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });
});
