const { Router } = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { createProductSchema, variantMatrixSchema, updateProductSchema } = require("../validators/product.validators");
const controller = require("../controllers/product.controller");

const router = Router();

router.post("/", authenticate, authorize("MERCHANT", "ADMIN"), validate(createProductSchema), controller.create);
router.get("/", authenticate, authorize("MERCHANT", "ADMIN"), controller.list);
router.get("/:productId", authenticate, authorize("MERCHANT", "ADMIN"), controller.getOne);
router.patch("/:productId", authenticate, authorize("MERCHANT", "ADMIN"), validate(updateProductSchema), controller.update);
router.post("/:productId/variants/generate", authenticate, authorize("MERCHANT", "ADMIN"), validate(variantMatrixSchema), controller.generateVariants);
router.patch("/variants/:variantId/stock", authenticate, authorize("MERCHANT", "ADMIN"), controller.updateStock);

module.exports = router;
