const express = require("express");
const {
  attendanceController,
  utilsController,
  authController,
} = require("../controllers");

const router = express.Router();

// get all attendance
router.get(
  "/",
  authController.protectCompany,
  utilsController.paginated,
  attendanceController.getCompanyAttendance
);

// get all staff attendance
router.get(
  "/staff/:staffId",
  authController.protectCompany,
  utilsController.paginated,
  attendanceController.getStaffAttendance
);

// create attendance token
router.get(
  "/qrinfo",
  authController.protectCompany,
  attendanceController.getQRAttendaceInformation
);
// mark attendance
router.post(
  "/markAttendance",
  authController.protectStaff,
  attendanceController.markAttendace
);

module.exports = router;
