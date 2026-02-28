const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/kioskController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get  ("/",          ctrl.getAll);
router.post ("/",          authorize("super_admin"), ctrl.create);
router.get  ("/:id",       ctrl.getById);
router.put  ("/:id",       authorize("super_admin"), ctrl.update);
router.get  ("/:id/stats", ctrl.getStats);

// Remote actions
router.patch("/:id/enable",      authorize("super_admin"), ctrl.enable);
router.patch("/:id/disable",     authorize("super_admin"), ctrl.disable);
router.patch("/:id/maintenance", authorize("super_admin"), ctrl.maintenance);
router.post ("/:id/force-logout",authorize("super_admin","operator"), ctrl.forceLogout);
router.post ("/:id/restart",     authorize("super_admin"), ctrl.restart);
router.post ("/:id/update",      authorize("super_admin"), ctrl.pushUpdate);

module.exports = router;
