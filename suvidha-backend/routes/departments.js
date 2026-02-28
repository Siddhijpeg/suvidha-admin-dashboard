const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/departmentController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

router.get   ("/",     ctrl.getAll);
router.post  ("/",     authorize("super_admin"), ctrl.create);
router.get   ("/:id",  ctrl.getById);
router.put   ("/:id",  authorize("super_admin"), ctrl.update);
router.delete("/:id",  authorize("super_admin"), ctrl.remove);
router.patch ("/:id/enable",  authorize("super_admin"), ctrl.enable);
router.patch ("/:id/disable", authorize("super_admin"), ctrl.disable);

// Services
router.get   ("/:id/services",                  ctrl.getServices);
router.post  ("/:id/services",                  authorize("super_admin"), ctrl.createService);
router.put   ("/:id/services/:serviceId",        authorize("super_admin"), ctrl.updateService);
router.delete("/:id/services/:serviceId",        authorize("super_admin"), ctrl.deleteService);
router.patch ("/:id/services/:serviceId/enable", authorize("super_admin"), ctrl.enableService);
router.patch ("/:id/services/:serviceId/disable",authorize("super_admin"), ctrl.disableService);

module.exports = router;
