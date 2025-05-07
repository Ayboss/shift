const express = require("express");
const router = express.Router();
const {
  authController,
  swapController,
  utilsController,
} = require("../controllers");

router.post("/", authController.protectStaff, swapController.createSwap);
router.get(
  "/",
  authController.protectStaff,
  utilsController.paginated,
  swapController.getAllSwapForUser
);
router.get(
  "/company",
  authController.protectCompany,
  utilsController.paginated,
  swapController.getAllSwapForCompany
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

router.patch(
  "/:swapId",
  authController.protectCompany,
  swapController.updateSwapStatus
);

module.exports = router;
