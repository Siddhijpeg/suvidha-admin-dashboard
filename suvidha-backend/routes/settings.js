const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/settingsController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("super_admin"));

router.get ("/",               ctrl.get);
router.put ("/",               ctrl.update);
router.get ("/payment",        ctrl.getPayment);
router.put ("/payment",        ctrl.updatePayment);
router.get ("/audit-logs",     ctrl.getAuditLogs);
router.get ("/blacklist",      ctrl.getBlacklist);
router.post("/blacklist",      ctrl.addBlacklist);
router.delete("/blacklist/:id",ctrl.removeBlacklist);
router.get ("/cms",            ctrl.getCMS);
router.put ("/cms",            ctrl.updateCMS);
router.delete("/cms/:id",      ctrl.deleteCMS);

module.exports = router;
