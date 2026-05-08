const { z } = require("zod");

const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  basePrice: z.number().positive(),
  attributes: z.record(z.unknown()).optional().default({}),
});

const variantMatrixSchema = z.object({
  sizes: z.array(z.string()).optional().default([]),
  colors: z.array(z.string()).optional().default([]),
  materials: z.array(z.string()).optional().default([]),
  basePrice: z.number().positive(),
  initialStock: z.number().int().nonnegative().default(0),
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  basePrice: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

module.exports = { createProductSchema, variantMatrixSchema, updateProductSchema };
