const express = require("express");
const router = express.Router();

const { circleController, authController } = require("../controllers");

router.use(authController.protectStaff);
router.get("/", circleController.getUserCircle);
router.post("/", circleController.createCircle);
router.delete("/", circleController.remmoveFromCircle);

module.exports = router;
