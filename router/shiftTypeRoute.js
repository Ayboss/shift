const router = require("express").Router();
const authController = require("../controllers/authController");
const shiftTypeController = require("../controllers/shiftTypeController");

router.use(authController.protectCompany);

router.get("/", shiftTypeController.getAllShiftType);
router.get("/:shiftTypeId", shiftTypeController.getShiftType);
router.post("/", shiftTypeController.createShiftType);
router.patch("/:shiftTypeId", shiftTypeController.updateShiftType);
router.delete("/:shiftTypeId", shiftTypeController.deleteShiftType);

module.exports = router;
