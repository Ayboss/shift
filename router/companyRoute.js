const express = require("express");
const router = express.Router();

const {
  utilsController,
  companyController,
  authController,
} = require("../controllers");

router.post("/register", companyController.signup);
router.post("/login", companyController.login);

router.use(authController.protectCompany);
router.get("/dashboard", companyController.getDashboardDetails);
router.get("/workers", companyController.getWorkerDetails);
router.post("/staff", companyController.addStaff);
router.get("/staff", utilsController.paginated, companyController.getStaff);
router.get("/staff/:staffId", companyController.getOneStaff);
router.patch("/staff", companyController.updateStaff);
router.patch("/staff/block/:staffId", companyController.blockStaff);
router.delete("/staff", companyController.deleteStaff);

module.exports = router;
