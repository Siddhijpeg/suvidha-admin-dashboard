const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/transactionController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get("/",                ctrl.getAll);
router.get("/revenue",         ctrl.getRevenue);
router.get("/reconcile",       authorize("super_admin","department_admin"), ctrl.reconcile);
router.get("/export/csv",      ctrl.exportCSV);
router.get("/:id",             ctrl.getById);

module.exports = router;
