const express = require("express");
const router = express.Router();

const { paymentController, authController } = require("../controllers");

router.use(authController.protectCompany);
router.post("/company/createOrder", paymentController.createOrder);
router.post("/company/captureOrder/:orderId", paymentController.captureOrder);
// router.post("/company/captureWebhook", paymentController.captureWebhook);

module.exports = router;
