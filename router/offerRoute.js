const express = require("express");
const router = express.Router();
const offerController = require("../controllers/offerController");
const authController = require("../controllers/authController");

router.post("/", authController.protectStaff, offerController.createOffer);
router.get("/", authController.protectStaff, offerController.getAllOfferStaff);
router.get(
  "/company",
  authController.protectCompany,
  offerController.getAllOfferCompany
);
router.get(
  "/:offerId",
  authController.protectStaff,
  offerController.getOneOffer
);
router.get(
  "/:offerId/company",
  authController.protectCompany,
  offerController.getOneOfferCompany
);
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
