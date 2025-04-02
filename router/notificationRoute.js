const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authController = require("../controllers/authController");

router.use(authController.protectStaff);
router.get("/", notificationController.getNotifications);
router.post("/", notificationController.createNotification);
module.exports = router;
