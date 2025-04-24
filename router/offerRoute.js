const express = require("express");
const router = express.Router();
const offerController = require("../controllers/offerController");
const authController = require("../controllers/authController");

router.get("/", authController.protect, offerController.getAllOffer);
router.get("/:offerId", authController.protect, offerController.getOneOffer);
router.post("/", authController.protectStaff, offerController.createOffer);
router.delete(
  "/:offerId/",
  authController.protectStaff,
  offerController.deleteOffer
);
router.patch(
  "/:offerId/claim",
  authController.protectStaff,
  offerController.claimOffer
);

router.use(authController.protectCompany);
router.patch("/:offerId", offerController.updateOfferStatus); // update offer status

module.exports = router;
