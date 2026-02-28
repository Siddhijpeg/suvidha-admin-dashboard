const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.get("/overview",     ctrl.getOverview);
router.get("/revenue",      ctrl.getRevenueChart);
router.get("/transactions", ctrl.getTxnChart);
router.get("/departments",  ctrl.getDeptStats);
router.get("/kiosks",       ctrl.getKioskStats);
router.get("/behavioral",   ctrl.getBehavioral);

module.exports = router;
