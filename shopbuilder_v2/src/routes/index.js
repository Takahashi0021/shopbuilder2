const { Router } = require("express");
const authRoutes = require("./auth.routes");
const tenantRoutes = require("./tenant.routes");
const productRoutes = require("./product.routes");
const orderRoutes = require("./order.routes");
const adminRoutes = require("./admin.routes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/tenants", tenantRoutes);
router.use("/products", productRoutes);
router.use("/admin", adminRoutes);
router.use("/", orderRoutes);

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "2.0.0" });
});

module.exports = router;
