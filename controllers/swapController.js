const Shift = require("../models/shiftModel");
const Swap = require("../models/swapModel");
const AppError = require("../util/appError");
const catchError = require("../util/catchError");
const status = require("../util/statusType");

exports.createSwap = catchError(async (req, res, next) => {
  const user = req.user;
  const { shiftId, swapWithId, reason } = req.body;

  const shift = await Shift.findOne({
    where: { staffId: user.id, id: shiftId },
  });
  if (!shift) {
    return next(new AppError("This shift does not exist for this user", 400));
  }

  const prevShift = await Swap.findOne({
    where: {
      shiftId: shiftId,
    },
  });
  if (prevShift) {
    return next(new AppError("Shift already exist as an swap", 400));
  }
  const swap = await Swap.create({
    companyId: user.companyId,
    staffId: user.id,
    claimerId: swapWithId,
    shiftId: shiftId,
    reason: reason,
  });

  return res.status(200).json({
    status: "success",
    data: swap,
  });
});

exports.getAllSwapForUser = catchError(async (req, res, next) => {
  const user = req.user;
  const swaps = await Swap.findAll({
    where: { companyId: user.companyId, staffId: user.id },
  });

  return res.status(200).json({
    status: "success",
    data: swaps,
  });
});

exports.getAllSwap = catchError(async (req, res, next) => {
  const company = req.user;
  const swaps = await Swap.findAll({
    where: { companyId: company.id },
  });

  return res.status(200).json({
    status: "success",
    data: swaps,
  });
});

exports.getOneSwapForUser = catchError(async (req, res, next) => {
  const { swapId } = req.params;
  const user = req.user;

  const swap = await Swap.findOne({
    where: { companyId: user.companyId, id: swapId, staffId: user.id },
  });

  if (!swap) {
    return next(new AppError("This swap for this company does not exist", 400));
  }
  return res.status(200).json({
    status: "success",
    data: swap,
  });
});

exports.getOneSwap = catchError(async (req, res, next) => {
  const { swapId } = req.params;
  const company = req.user;

  const swap = await Swap.findOne({
    where: { companyId: company.id, id: swapId },
  });
  if (!swap) {
    return next(new AppError("This swap for this company does not exist", 400));
  }
  return res.status(200).json({
    status: "success",
    data: swap,
  });
});

exports.acceptSwap = catchError(async (req, res, next) => {
  // first check if the swap exist, and it's in the company , and it's open
  // accept the swap
  const user = req.user;
  const { swapId } = req.params;

  const swap = await Swap.findOne({
    where: { companyId: user.companyId, id: swapId, status: status.OPEN },
  });

  if (!swap) {
    return next(new AppError("This swap does not exist", 400));
  }
  await swap.update({ status: status.IN_REVIEW });
  return res.status(200).json({
    status: "success",
    data: swap,
  });
});

exports.declineSwap = catchError(async (req, res, next) => {
  const user = req.user;
  const { swapId } = req.params;

  const swap = await Swap.findOne({
    where: { companyId: user.companyId, id: swapId, status: status.OPEN },
  });

  if (!swap) {
    return next(new AppError("This swap does not exist", 400));
  }
  await swap.update({ status: status.DECLINED });
  return res.status(200).json({
    status: "success",
    data: swap,
  });
});

exports.deleteSwap = catchError(async (req, res, next) => {
  const user = req.user;
  const { swapId } = req.params;

  const swap = await Swap.findOne({
    where: { companyId: user.companyId, id: swapId, status: status.OPEN },
  });

  if (!swap) {
    return next(new AppError("This swap does not exist", 400));
  }
  await swap.destroy();
  return res.status(200).json({
    status: "success",
    data: swap,
  });
});

// update by company
exports.updateSwapStatus = catchError(async (req, res, next) => {
  const company = req.user;
  const { status: statusval, swapId } = req.params;
  if (statusval != status.ACCEPTED || statusval != status.DECLINED) {
    return new AppError(
      "you can either pass ACCEPTED  or DECLINED to the status",
      400
    );
  }
  const swap = await Swap.findOne({
    where: { companyId: company.id, status: status.IN_REVIEW, id: swapId },
  });
  if (!swap) {
    return next(new AppError("This swap is no longer in review", 400));
  }
  await swap.update({ status: statusval });
  return res.status(200).json({
    status: "success",
    data: swap,
  });
});
