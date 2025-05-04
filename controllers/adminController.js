const catchError = require("../util/catchError");
const { hashPassword, comparePassword } = require("../util/passwordFunc");
const createJWTToken = require("../util/createJWTToken");
const AppError = require("../util/appError");
const companyController = require("../controllers/companyController");
const sequelize = require("../database/database");
const { formatStats } = require("../util/formatStats");
const {
  Notification,
  Offer,
  Swap,
  Staff,
  Company,
  Admin,
} = require("../models");

exports.login = catchError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("please provide email and password", 400));
  }
  const admin = await Admin.scope("withPassword").findOne({ where: { email } });
  if (!admin) {
    return next(new AppError("Admin does not exist", 404));
  }
  if (!comparePassword(password, admin.password)) {
    return next(new AppError("incorrect email or password", 400));
  }
  const token = createJWTToken(admin.id);
  admin.password = undefined;
  return res.status(200).json({
    status: "success",
    token: token,
    data: admin,
  });
});

exports.register = catchError(async (req, res, next) => {
  if (req.body.password && req.body.password.length < 8) {
    return next(new AppError("Please input a stronger password", "401"));
  }
  const hashed = await hashPassword(req.body.password);

  console.log(req.body, "BODY");
  const admin = await Admin.create({
    email: req.body.email,
    password: hashed,
    fullName: req.body.fullName,
  });
  const token = createJWTToken(admin.id);
  return res.status(200).json({
    status: "success",
    token: token,
    data: admin,
  });
});

exports.getDashboardDetails = catchError(async (req, res, next) => {
  const [
    companyCount,
    staffCount,
    swapCountByStatus,
    offerCountByStatus,
    notifications,
  ] = await Promise.all([
    Company.count(),
    Staff.count(),
    Swap.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("status")), "count"],
      ],
      group: ["status"],
      raw: true,
    }),
    Offer.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("status")), "count"],
      ],
      group: ["status"],
      raw: true,
    }),
    Notification.findAll({ where: { notifType: "GENERAL" } }),
  ]);

  const formatswaps = formatStats(swapCountByStatus);
  const formatoffer = formatStats(offerCountByStatus);
  res.status(200).json({
    status: "success",
    data: {
      totalCompanies: companyCount,
      totalStaffs: staffCount,
      swapsByStatus: formatswaps,
      offersByStatus: formatoffer,
      notifications: notifications,
    },
  });
});

exports.getAllCompanies = catchError(async (req, res, next) => {
  const companies = await Company.findAll();
  return res.status(200).json({
    status: "success",
    data: companies,
  });
});

exports.getOneCompany = catchError(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await Company.findOne({ where: { id: companyId } });
  if (!company) {
    return next(new AppError("company not found", 404));
  }
  return res.status(200).json({
    status: "success",
    data: company,
  });
});
exports.registerCompany = companyController.signup;
