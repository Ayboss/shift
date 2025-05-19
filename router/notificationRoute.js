const express = require("express");
const router = express.Router();

const {
  authController,
  notificationController,
  utilsController,
} = require("../controllers");

router.get(
  "/",
  authController.protectStaff,
  utilsController.paginated,
  notificationController.getNotifications
);
router.get(
  "/company",
  authController.protectCompany,
  utilsController.paginated,
  notificationController.getCompanyNotifications
);
router.get(
  "/admin",
  authController.protectAdmin,
  utilsController.paginated,
  notificationController.getAdminNotifications
);
router.post("/", notificationController.createNotification);
module.exports = router;
