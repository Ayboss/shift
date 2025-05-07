const express = require("express");
const router = express.Router();

const { uploadXlsFile } = require("../util/upload");
const {
  authController,
  shiftController,
  utilsController,
} = require("../controllers");

// common route

router.get(
  "/",
  authController.protect,
  utilsController.paginated,
  shiftController.getAllShifts
); //
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
