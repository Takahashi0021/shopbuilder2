const { Router } = require("express");
const { authenticate, authorize } = require("../middlewares/auth");
const controller = require("../controllers/admin.controller");

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/dashboard", controller.dashboard);
router.get("/tenants", controller.listTenants);
router.patch("/tenants/:tenantId/suspend", controller.suspendTenant);
router.patch("/tenants/:tenantId/activate", controller.activateTenant);
router.get("/users", controller.listUsers);
router.patch("/users/:userId/deactivate", controller.deactivateUser);

module.exports = router;
