const { Router } = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { createOrderSchema, updateStatusSchema } = require("../validators/order.validators");
const controller = require("../controllers/order.controller");

const router = Router();

router.post("/stores/:tenantSlug/orders", authenticate, authorize("CUSTOMER"), validate(createOrderSchema), controller.createBySlug);
router.get("/orders", authenticate, controller.listOrders);
router.get("/orders/:orderId", authenticate, controller.getOne);
router.patch("/orders/:orderId/status", authenticate, authorize("MERCHANT", "ADMIN"), validate(updateStatusSchema), controller.updateStatus);

module.exports = router;
