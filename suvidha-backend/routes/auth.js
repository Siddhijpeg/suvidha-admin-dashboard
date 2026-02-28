const express  = require("express");
const router   = express.Router();
const ctrl     = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

router.post("/login",    ctrl.login);
router.get ("/me",       protect, ctrl.getMe);
router.get ("/users",    protect, authorize("super_admin"), ctrl.getUsers);
router.post("/users",    protect, authorize("super_admin"), ctrl.register);
router.put ("/users/:id",protect, authorize("super_admin"), ctrl.updateUser);
router.delete("/users/:id",protect,authorize("super_admin"),ctrl.deleteUser);

module.exports = router;
