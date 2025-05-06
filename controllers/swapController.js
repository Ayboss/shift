const { Op } = require("sequelize");
const AppError = require("../util/appError");
const catchError = require("../util/catchError");
const status = require("../util/statusType");
const {
  notifySwapCreated,
  notifySwapAccepted,
  notifySwapDeclined,
  notifySwapAcceptedByCompany,
} = require("./eventlisteners");
const { Swap, Staff, Shift } = require("../models");

const attribute = [
  "id",
  "fullName",
  "phoneNumber",
  "email",
  "image",
  "isImageMemoji",
];

const modelInclude = [
  {
    model: Staff,
    as: "staff",
    attributes: attribute,
  },
  {
    model: Staff,
    as: "claimer",
    attributes: attribute,
  },
  {
    model: Shift,
    as: "staffShift",
    attributes: ["date", "type"],
  },
  {
    model: Shift,
    as: "claimerShift",
    attributes: ["date", "type"],
  },
];
const getSwap = catchError(async (whereclause, res, next) => {
  const swap = await Swap.findOne({
    where: whereclause,
    include: modelInclude,
  });

  if (!swap) {
    return next(new AppError("This swap for this company does not exist", 400));
  }
  return res.status(200).json({
    status: "success",
    data: swap,
  });
});

const getAllSwap = catchError(async (whereClause, res) => {
  // filter by status
  const swaps = await Swap.findAll({
    where: whereClause,
    include: modelInclude,
  });

  return res.status(200).json({
    status: "success",
    data: swaps,
  });
});

exports.createSwap = catchError(async (req, res, next) => {
  // you are changing the id of two shifts basically
  const user = req.user;
  const { shiftId, claimerShiftId, reason } = req.body;

  const shift = await Shift.findOne({
    where: { staffId: user.id, id: shiftId },
  });
  if (!shift) {
    return next(new AppError("This shift does not exist for this user", 400));
  }

  const claimershift = await Shift.findOne({
    where: { companyId: user.companyId, id: claimerShiftId },
  });
  if (!claimershift) {
    return next(new AppError("This claimershift does not exist", 400));
  }

  const prevShift = await Swap.findOne({
    where: {
      [Op.or]: [{ shiftId: shiftId }, { shiftId: claimerShiftId }],
    },
  });
  if (prevShift) {
    return next(new AppError("Shift already exist as an swap", 400));
  }
  const swap = await Swap.create({
    companyId: user.companyId,
    staffId: user.id,
    claimerId: claimershift.staffId,
    shiftId: shiftId,
    reason: reason,
    claimerShiftId: claimerShiftId,
  });
  notifySwapCreated(swap, user.fullName);
  return res.status(200).json({
    status: "success",
    data: swap,
  });
});

exports.getAllSwapForUser = catchError(async (req, res, next) => {
  const user = req.user;
  const { status } = req.query;
  const whereClause = {
    companyId: user.companyId,
    [Op.or]: [{ staffId: user.id }, { claimerId: user.id }],
  };
  if (status) {
    whereClause.status = status;
  }
  getAllSwap(whereClause, res);
});

exports.getAllSwapForCompany = catchError(async (req, res, next) => {
  const company = req.user;
  const whereClause = {
    companyId: company.id,
  };
  const { status } = req.query;
  if (status) {
    whereClause.status = status;
  }
  getAllSwap(whereClause, res);
});

exports.getOneSwapForUser = catchError(async (req, res, next) => {
  const user = req.user;
  const { swapId } = req.params;
  const whereclause = {
    companyId: user.companyId,
    id: swapId,
    [Op.or]: [{ staffId: user.id }, { claimerId: user.id }],
  };
  getSwap(whereclause, res, next);
});

exports.getOneSwap = catchError(async (req, res, next) => {
  const { swapId } = req.params;
  const company = req.user;
  const whereclause = { companyId: company.id, id: swapId };
  getSwap(whereclause, res, next);
});

exports.acceptSwap = catchError(async (req, res, next) => {
  const user = req.user;
  const { swapId } = req.params;

  const swap = await Swap.findOne({
    where: {
      companyId: user.companyId,
      id: swapId,
      status: status.OPEN,
      claimerId: user.id,
    },
    include: modelInclude,
  });

  if (!swap) {
    return next(new AppError("This swap does not exist", 400));
  }
  await swap.update({ status: status.IN_REVIEW });
  notifySwapAccepted(swap);
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
    include: modelInclude,
  });

  if (!swap) {
    return next(new AppError("This swap does not exist", 400));
  }
  await swap.update({ status: status.DECLINED });
  notifySwapDeclined(swap);
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
  if (swap.status == status.ACCEPTED || swap.status == status.ACCEPTED) {
    return next(
      new AppError("This swap has been processed and cannot be deleted", 400)
    );
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
  const { swapId } = req.params;
  const statusval = req.body.status;
  if (statusval != status.ACCEPTED && statusval != status.DECLINED) {
    return next(
      new AppError(
        "you can either pass ACCEPTED  or DECLINED to the status",
        400
      )
    );
  }

  const swap = await Swap.findOne({
    where: { companyId: company.id, status: status.IN_REVIEW, id: swapId },
    include: modelInclude,
  });
  if (!swap) {
    return next(new AppError("This swap is no longer in review", 400));
  }

  if (statusval == status.ACCEPTED) {
    // swap.staffId. with claimershiftid, swap.claimerId with shiftId
    await Promise.all([
      Shift.update(
        { staffId: swap.claimerId },
        { where: { id: swap.shiftId } }
      ),
      Shift.update(
        { staffId: swap.staffId },
        { where: { id: swap.claimerShiftId } }
      ),
    ]);
  }

  await swap.update({ status: statusval });
  notifySwapAcceptedByCompany(swap, statusval);
  return res.status(200).json({
    status: "success",
    data: swap,
  });
});
