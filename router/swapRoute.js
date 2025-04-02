const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const swapController = require("../controllers/swapController");

router.post("/", authController.protectStaff, swapController.createSwap);
router.get("/", authController.protectStaff, swapController.getAllSwapForUser);
router.get(
  "/company",
  authController.protectCompany,
  swapController.getAllSwap
);

router.get(
  "/:swapId",
  authController.protectStaff,
  swapController.getOneSwapForUser
);

router.get(
  "/:swapId/company",
  authController.protectCompany,
  swapController.getOneSwap
);

router.patch(
  "/:swapId/accept",
  authController.protectStaff,
  swapController.acceptSwap
);
router.patch(
  "/:swapId/decline",
  authController.protectStaff,
  swapController.declineSwap
);
router.delete(
  "/:swapId",
  authController.protectStaff,
  swapController.deleteSwap
);

router.post(
  "/:swapId/:status",
  authController.protectCompany,
  swapController.updateSwapStatus
);

module.exports = router;
