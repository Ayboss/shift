const express = require("express");
const router = express.Router();
const staffController = require("../controllers/staffController");
const authController = require("../controllers/authController");
const { uploadProfileImage } = require("../util/upload");

router.post("/register", staffController.signup);
router.post("/login", staffController.login);
router.post("/forgotpassword", staffController.forgotPassword);
router.get("/verify/:staffId", staffController.verifyStaffCompany);
router.post(
  "/confirmcode",
  authController.protectStaffWithPassword,
  staffController.confirmCode
);
router.post(
  "/resetpassword",
  authController.protectStaffWithPassword,
  staffController.resetpassword
);

router.use(authController.protectStaff);
router.post("/password/set", staffController.setPassword);

router.use(authController.isVerified);
router.get("/offerswap", staffController.getOffersAndSwaps);
router.get("/working/:shiftId", staffController.workingAtSameTime);
router.get("/all", staffController.getStaffs);
router.get("/:staffId", staffController.getOneStaff);
router.patch(
  "/profileimg",
  uploadProfileImage,
  staffController.uploadStaffImage
);
router.patch("/", staffController.updateStaff);
router.get("/", staffController.getCurrentUserWithDashboard);
module.exports = router;
