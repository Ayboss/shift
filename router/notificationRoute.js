const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authController = require("../controllers/authController");

router.get(
  "/",
  authController.protectStaff,
  notificationController.getNotifications
);
router.get(
  "/company",
  authController.protectCompany,
  notificationController.getCompanyNotifications
);
router.post("/", notificationController.createNotification);
module.exports = router;
