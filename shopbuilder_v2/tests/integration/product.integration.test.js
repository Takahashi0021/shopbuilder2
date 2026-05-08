const request = require("supertest");

process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/shopbuilder_test";
process.env.REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
process.env.JWT_SECRET = "test-secret-key-that-is-at-least-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-refresh-key-that-is-at-least-32-chars-long";
process.env.JWT_ACCESS_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.CORS_ORIGINS = "http://localhost:3000";
process.env.NODE_ENV = "test";
process.env.MERCHANT_1_DB_URL = process.env.DATABASE_URL;

let app, prisma, merchantToken, tenantId, productId, variantId;

const ts = Date.now();
const merchantUser = {
  email: `merchant_${ts}@test-integration.com`,
  username: `merchant_${ts}`,
  password: "Secret@123",
  role: "MERCHANT",
};

beforeAll(async () => {
  app = require("../../src/index");
  prisma = require("../../src/config/database");
  await prisma.$connect();

  await request(app).post("/api/v1/auth/register").send(merchantUser);
  const loginRes = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: merchantUser.email, password: merchantUser.password });
  merchantToken = loginRes.body.data.accessToken;

  const tenantRes = await request(app)
    .post("/api/v1/tenants/onboard")
    .set("Authorization", `Bearer ${merchantToken}`)
    .send({ name: "Test Shop", slug: `test-shop-${ts}` });

  const loginRes2 = await request(app)
    .post("/api/v1/auth/login")
    .send({ email: merchantUser.email, password: merchantUser.password });
  merchantToken = loginRes2.body.data.accessToken;
  tenantId = tenantRes.body.data?.tenant?.id;
});

afterAll(async () => {
  await prisma.productVariant.deleteMany({ where: { product: { tenant: { slug: { contains: `test-shop-${ts}` } } } } });
  await prisma.product.deleteMany({ where: { tenant: { slug: { contains: `test-shop-${ts}` } } } });
  await prisma.webhook.deleteMany({ where: { tenant: { slug: { contains: `test-shop-${ts}` } } } });
  await prisma.tenant.deleteMany({ where: { slug: { contains: `test-shop-${ts}` } } });
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { contains: "@test-integration.com" } } });
  await prisma.$disconnect();
  const redis = require("../../src/config/redis");
  await redis.quit();
});

describe("Product Integration", () => {
  test("POST /api/v1/products - creates product", async () => {
    const res = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${merchantToken}`)
      .send({ name: "Test T-Shirt", basePrice: 29.99, description: "A test product" });
    expect(res.status).toBe(201);
    productId = res.body.data.product.id;
    expect(productId).toBeDefined();
  });

  test("GET /api/v1/products - returns paginated list", async () => {
    const res = await request(app)
      .get("/api/v1/products")
      .set("Authorization", `Bearer ${merchantToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.meta).toHaveProperty("nextCursor");
  });

  test("POST /api/v1/products/:id/variants/generate - generates SKU matrix", async () => {
    const res = await request(app)
      .post(`/api/v1/products/${productId}/variants/generate`)
      .set("Authorization", `Bearer ${merchantToken}`)
      .send({
        sizes: ["S", "M", "L"],
        colors: ["Red", "Blue"],
        basePrice: 29.99,
        initialStock: 50,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.count).toBe(6);
    variantId = res.body.data.variants[0].id;
  });

  test("PATCH /api/v1/products/variants/:id/stock - adjusts stock", async () => {
    const res = await request(app)
      .patch(`/api/v1/products/variants/${variantId}/stock`)
      .set("Authorization", `Bearer ${merchantToken}`)
      .send({ delta: -10 });
    expect(res.status).toBe(200);
    expect(res.body.data.variant.stock).toBe(40);
  });

  test("PATCH /api/v1/products/variants/:id/stock - rejects oversell", async () => {
    const res = await request(app)
      .patch(`/api/v1/products/variants/${variantId}/stock`)
      .set("Authorization", `Bearer ${merchantToken}`)
      .send({ delta: -9999 });
    expect(res.status).toBe(409);
  });

  test("GET /api/v1/products/:id - returns product with variants", async () => {
    const res = await request(app)
      .get(`/api/v1/products/${productId}`)
      .set("Authorization", `Bearer ${merchantToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.product.variants.length).toBeGreaterThan(0);
  });
});
