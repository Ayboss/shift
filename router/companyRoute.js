const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");
const authController = require("../controllers/authController");

router.post("/register", companyController.signup);
router.post("/login", companyController.login);

router.use(authController.protectCompany);
router.get("/dashboard", companyController.getDashboardDetails);
router.post("/staff", companyController.addStaff);
router.get("/staff", companyController.getStaff);
router.get("/staff/:staffid", companyController.getOneStaff);
router.patch("/staff", companyController.updateStaff);
router.delete("/staff", companyController.deleteStaff);

module.exports = router;
