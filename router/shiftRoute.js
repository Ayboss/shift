const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const shiftController = require("../controllers/shiftController");
const { uploadXlsFile } = require("../util/upload");

// common route

router.get("/", authController.protect, shiftController.getAllShifts); //
router.get("/:shiftId", authController.protect, shiftController.getOneShift);
router.get(
  "/staff/:staffId",
  authController.protect,
  shiftController.getAllStaffShift
);

router.use(authController.protectCompany);
// company alone
router.post("/upload", uploadXlsFile, shiftController.addBulkShift);
router.patch("/"); // update a particular shift
router.delete("/"); // delete a particular shift

module.exports = router;
