const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const AppError = require("../util/appError");
const catchError = require("../util/catchError");
const { Admin, Staff, Company } = require("../models");

const checkAndDecode = async (req, next) => {
  try {
    let token = "";
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(new AppError("Please login to access this resource", 401));
    }
    return await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError("Please login to access this resource", 401));
  }
};

exports.protectCompany = catchError(async (req, res, next) => {
  const decode = await checkAndDecode(req, next);
  const currentUser = await Company.findOne({ where: { id: decode.id } });
  if (!currentUser) {
    return next(new AppError("company with token does not exit", 401));
  }
  req.user = currentUser;
  next();
});

exports.protectStaff = catchError(async (req, res, next) => {
  const decode = await checkAndDecode(req, next);
  const currentUser = await Staff.findOne({ where: { id: decode.id } });

  if (!currentUser) {
    return next(new AppError("staff with token does not exit", 401));
  }

  if (currentUser.blocked) {
    return next(
      new AppError(
        "staff is blocked please contact you companies administration",
        401
      )
    );
  }

  req.user = currentUser;
  next();
});

exports.protectStaffWithPassword = catchError(async (req, res, next) => {
  const decode = await checkAndDecode(req, next);
  const currentUser = await Staff.scope("withPassword").findOne({
    where: { id: decode.id },
  });

  if (!currentUser) {
    return next(new AppError("staff with token does not exit", 401));
  }

  if (currentUser.blocked) {
    return next(
      new AppError(
        "staff is blocked please contact you companies administration",
        401
      )
    );
  }

  req.user = currentUser;
  next();
});

exports.protectAdmin = catchError(async (req, res, next) => {
  const decode = await checkAndDecode(req, next);
  const currentUser = await Admin.findOne({ where: { id: decode.id } });

  if (!currentUser) {
    return next(new AppError("Admin with token does not exit", 401));
  }

  req.user = currentUser;
  next();
});

exports.isVerified = catchError(async (req, res, next) => {
  if (!req.user.verified) {
    return next(
      new AppError("please verify user by completing the signup process", 401)
    );
  }
  next();
});

exports.protect = catchError(async (req, res, next) => {
  const decode = await checkAndDecode(req, next);
  const type =
    (req.query.type && req.query.type.toLowerCase()) == "company"
      ? "company"
      : "user";

  let currentUser = null;
  if (type == "company") {
    currentUser = await Company.findOne({ where: { id: decode.id } });
    req.companyId = currentUser?.id;
  } else {
    currentUser = await Staff.findOne({ where: { id: decode.id } });
  }
  if (!currentUser) {
    return next(new AppError("user with token does not exit", 401));
  }

  if (type == "company") {
    currentUser.companyId = currentUser?.id;
  }
  req.user = currentUser;
  next();
});
