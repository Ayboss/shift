const express = require("express");
const router = express.Router();

const {
  adminController,
  authController,
  utilsController,
} = require("../controllers");

router.post("/login", adminController.login);

router.use(authController.protectAdmin);
router.post("/register", adminController.register);
router.post("/company/register", adminController.registerCompany);
router.get("/dashboard", adminController.getDashboardDetails);
router.get(
  "/company",
  utilsController.paginated,
  adminController.getAllCompanies
);
router.get("/company/:companyId", adminController.getOneCompany);

module.exports = router;
