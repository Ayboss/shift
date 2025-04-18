const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const authController = require("../controllers/authController");
const { uploadProfileImage } = require("../util/upload");

router.post("/register", staffController.signup);
router.post("/login", staffController.login);
router.post("/confirmcode", staffController.confirmCode);

router.use(authController.protectStaff);
router.post("/password/set", staffController.setPassword);

router.use(authController.isVerified);
router.get("/working/:shiftId", staffController.workingAtSameTime);
router.get("/:staffId", staffController.getOneStaff);
router.patch("/", staffController.updateStaff);
router.patch(
  "/profileimg",
  uploadProfileImage,
  staffController.uploadStaffImage
);

module.exports = router;
