const express = require("express");
const router = express.Router();
const cicleController = require("../controllers/circleController");
const authController = require("../controllers/authController");

router.use(authController.protectStaff);
router.get("/", cicleController.getUserCircle);
router.post("/", cicleController.createCircle);
router.delete("/", cicleController.remmoveFromCircle);

module.exports = router;
