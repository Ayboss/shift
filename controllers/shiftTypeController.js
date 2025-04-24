const ShiftType = require("../models/shiftTypeModel");
const AppError = require("../util/appError");
const catchError = require("../util/catchError");

exports.getShiftType = catchError(async (req, res, next) => {
  const { shiftTypeId } = req.params;
  const company = req.user;
  const shiftType = await ShiftType.findOne({
    where: { companyId: company.id, id: shiftTypeId },
  });
  res.status(200).json({
    status: "success",
    data: shiftType,
  });
});

exports.getAllShiftType = catchError(async (req, res, next) => {
  const company = req.user;
  const shiftTypes = await ShiftType.findAll({
    where: { companyId: company.id },
    order: [["startTime", "ASC"]],
  });
  res.status(200).json({
    status: "success",
    data: shiftTypes,
  });
});

exports.createShiftType = catchError(async (req, res, next) => {
  const company = req.user;
  // do validation
  const shiftType = await ShiftType.create({
    companyId: company.id,
    name: req.body.name.toLowerCase(),
    startTime: req.body.startTime,
    endTime: req.body.endTime,
  });
  res.status(201).json({
    status: "success",
    data: shiftType,
  });
});

exports.updateShiftType = catchError(async (req, res, next) => {
  const { shiftTypeId } = req.params;
  const company = req.user;
  const shiftType = await ShiftType.findOne({
    where: { companyId: company.id, id: shiftTypeId },
  });
  if (!shiftType) {
    return next(new AppError("This shifttype does not exist", 400));
  }
  if (req.body.name) shiftType.name = req.body.name.toLowerCase();
  if (req.body.startTime) shiftType.startTime = req.body.startTime;
  if (req.body.endTime) shiftType.endTime = req.body.endTime;

  await shiftType.save();
  res.status(201).json({
    status: "success",
    data: shiftType,
  });
});

exports.deleteShiftType = catchError(async (req, res, next) => {
  const { shiftTypeId } = req.params;
  const company = req.user;
  const shiftType = await ShiftType.findOne({
    where: { companyId: company.id, id: shiftTypeId },
  });
  if (!shiftType) {
    return next(new AppError("This shifttype does not exist", 400));
  }
  await shiftType.destroy();
  return res.status(200).json({
    status: "success",
    data: shiftType,
  });
});
