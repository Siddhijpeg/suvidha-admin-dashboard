const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/complaintController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get ("/",          ctrl.getAll);
router.get ("/stats",     ctrl.getStats);
router.get ("/:id",       ctrl.getById);
router.patch("/:id/status",   ctrl.updateStatus);
router.patch("/:id/assign",   authorize("super_admin","department_admin"), ctrl.assign);
router.post ("/:id/escalate", authorize("super_admin","department_admin"), ctrl.escalate);

module.exports = router;
