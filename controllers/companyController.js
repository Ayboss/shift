const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Company = require("../models/companyModel");
const AppError = require("../util/appError");
const catchError = require("../util/catchError");
const Staff = require("../models/staffModel");
const createJWTToken = require("../util/createJWTToken");
const { hashPassword, comparePassword } = require("../util/passwordFunc");

exports.signup = catchError(async (req, res, next) => {
  if (req.body.password && req.body.password.length < 8) {
    return next(new AppError("Please input a stronger password", "401"));
  }
  // hashpassword
  const hashed = await hashPassword(req.body.password);

  const company = await Company.create({
    companyName: req.body.companyName,
    companyEmail: req.body.companyEmail,
    country: req.body.country,
    city: req.body.city,
    district: req.body.district,
    numberOfStaffs: req.body.numberOfStaffs,
    password: hashed,
  });

  const token = createJWTToken(company.id);
  return res.status(200).json({
    status: "success",
    token: token,
    data: company,
  });
});

exports.login = catchError(async (req, res, next) => {
  const { companyEmail, password } = req.body;
  //check if email and password
  if (!companyEmail || !password) {
    return next(new AppError("please provide email and password", 400));
  }
  const company = await Company.scope("withPassword").findOne({
    where: { companyEmail: companyEmail },
  });
  if (!company) {
    return next(AppError("company does not exist", 404));
  }

  if (!comparePassword(password, company.password)) {
    return next(new AppError("incorrect email or password", 400));
  }

  const token = createJWTToken(company.id);
  return res.status(200).json({
    status: "success",
    token: token,
    data: company,
  });
});

exports.addStaff = catchError(async (req, res, next) => {
  const company = req.user;
  if (!req.body.email) {
    return next(new AppError("email is a required field", 400));
  }
  const staff = await Staff.create({
    email: req.body.email,
    companyId: company.id,
  });

  return res.status(201).json({
    status: "success",
    message: "A new staff has been added to your company",
    data: {
      staff: {
        email: staff.email,
        staffid: staff.id,
      },
    },
  });
});

exports.getStaff = catchError(async (req, res, next) => {
  const company = req.user;
  const staffs = await Staff.findAll({ where: { companyId: company.id } });

  return res.status(200).json({
    status: "success",
    data: staffs,
  });
});

exports.getOneStaff = catchError(async (req, res, next) => {
  const company = req.user;
  const staffid = req.params.staffid;
  const staff = await Staff.findOne({
    where: { companyId: company.id, id: staffid },
  });
  if (!staff) {
    return next(new AppError("this staff does not exist", 400));
  }
  return res.status(200).json({
    status: "success",
    data: staff,
  });
});

exports.updateStaff = catchError(async (req, res, next) => {});

exports.deleteStaff = catchError(async (req, res, next) => {});
