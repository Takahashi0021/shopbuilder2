const { z } = require("zod");

const createOrderSchema = z.object({
  items: z.array(z.object({
    variantId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1),
  notes: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

module.exports = { createOrderSchema, updateStatusSchema };
