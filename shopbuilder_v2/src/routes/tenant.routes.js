const { Router } = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { onboardTenantSchema, webhookSchema } = require("../validators/tenant.validators");
const controller = require("../controllers/tenant.controller");

const router = Router();

router.post("/onboard", authenticate, validate(onboardTenantSchema), controller.onboard);
router.get("/me", authenticate, authorize("MERCHANT", "ADMIN"), controller.getMyTenant);
router.post("/webhooks", authenticate, authorize("MERCHANT", "ADMIN"), validate(webhookSchema), controller.createWebhook);
router.get("/webhooks", authenticate, authorize("MERCHANT", "ADMIN"), controller.listWebhooks);

module.exports = router;
