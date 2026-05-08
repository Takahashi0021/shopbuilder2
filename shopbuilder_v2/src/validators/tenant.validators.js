const { z } = require("zod");

const onboardTenantSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  dbUrl: z.string().url().optional(),
});

const webhookSchema = z.object({
  url: z.string().url(),
  eventType: z.enum([
    "PRODUCT_CREATED",
    "PRODUCT_UPDATED",
    "ORDER_CREATED",
    "ORDER_UPDATED",
    "VARIANT_STOCK_UPDATED",
  ]),
});

module.exports = { onboardTenantSchema, webhookSchema };
