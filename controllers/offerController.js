const catchError = require("../util/catchError");
const AppError = require("../util/appError");
const status = require("../util/statusType");
const {
  notifyOfferIsClaimed,
  notifyOfferUpdatedByCompany,
  notifyOfferToCircle,
} = require("./eventlisteners");
const { Staff, Shift, Offer } = require("../models");
const { Op } = require("sequelize");

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
    as: "shift",
    attributes: ["date", "type"],
  },
];

exports.createOffer = catchError(async (req, res, next) => {
  const user = req.user;
  const { shiftId, reason } = req.body;

  const shift = await Shift.findOne({
    where: { staffId: user.id, id: shiftId },
  });
  if (!shift) {
    return next(new AppError("This shift does not exist for this user", 400));
  }
  const prevOffer = await Offer.findOne({
    where: {
      shiftId: shiftId,
    },
  });

  if (prevOffer) {
    return next(new AppError("Shift already exist as an offer", 400));
  }
  const offer = await Offer.create({
    companyId: user.companyId,
    staffId: user.id,
    shiftId: shiftId,
    reason: reason,
  });
  notifyOfferToCircle(user, offer.id);
  return res.status(200).json({
    status: "success",
    data: offer,
  });
});

const getAllOffer = catchError(async (whereClause, req, res) => {
  const { limit, offset, page } = req.pagination;
  const { count, rows: offers } = await Offer.findAndCountAll({
    where: whereClause,
    include: modelInclude,
    limit,
    offset,
  });

  return res.status(200).json({
    status: "success",
    data: offers,
    meta: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  });
});
exports.getAllOfferCompany = catchError(async (req, res, next) => {
  const { status: statusquery } = req.query;
  let whereClause = {
    companyId: req.user.id,
    status: status.OPEN,
  };
  if (statusquery) {
    whereClause.status = statusquery;
  }

  getAllOffer(whereClause, req, res);
});

exports.getAllOfferStaff = catchError(async (req, res, next) => {
  const { status: statusquery } = req.query;
  let whereClause = {
    companyId: req.user.companyId,
    status: status.OPEN,
  };
  if (statusquery && statusquery != status.OPEN) {
    whereClause = {
      companyId: req.user.companyId,
      [Op.or]: [{ staffId: req.user.id }, { claimerId: req.user.id }],
    };
  }

  if (statusquery) {
    whereClause.status = statusquery;
  }
  getAllOffer(whereClause, req, res);
});

exports.getOneOffer = catchError(async (req, res, next) => {
  const { offerId } = req.params;
  const offer = await Offer.findOne({
    where: { companyId: req.user.companyId, id: offerId },
    include: modelInclude,
  });
  if (!offer) {
    return next(
      new AppError("This offer for this company does not exist", 400)
    );
  }
  return res.status(200).json({
    status: "success",
    data: offer,
  });
});

exports.getOneOfferCompany = catchError(async (req, res, next) => {
  const { offerId } = req.params;
  const offer = await Offer.findOne({
    where: { companyId: req.user.id, id: offerId },
    include: modelInclude,
  });
  if (!offer) {
    return next(
      new AppError("This offer for this company does not exist", 400)
    );
  }
  return res.status(200).json({
    status: "success",
    data: offer,
  });
});

exports.claimOffer = catchError(async (req, res, next) => {
  const user = req.user;
  const { offerId } = req.params;
  // get the offer first

  const offer = await Offer.findOne({
    where: { companyId: user.companyId, id: offerId, status: "OPEN" },
    include: modelInclude,
  });
  if (!offer || offer.staffId == user.id) {
    return next(new AppError("User cannot claim this offer", 400));
  }

  await offer.update({ status: status.IN_REVIEW, claimerId: user.id });
  notifyOfferIsClaimed(user, offer);
  return res.status(200).json({
    status: "success",
    data: offer,
  });
});

// update by company
exports.updateOfferStatus = catchError(async (req, res, next) => {
  const company = req.user;
  const { offerId } = req.params;
  const statusval = req.body.status;
  if (statusval != status.ACCEPTED && statusval != status.DECLINED) {
    return next(
      new AppError(
        "you can either pass ACCEPTED  or DECLINED to the status",
        400
      )
    );
  }
  const offer = await Offer.findOne({
    where: { companyId: company.id, status: status.IN_REVIEW, id: offerId },
    include: modelInclude,
  });
  if (!offer) {
    return next(new AppError("This offer is no longer in review", 400));
  }
  if (statusval == status.ACCEPTED) {
    await Shift.update(
      { staffId: offer.claimerId },
      { where: { id: offer.shiftId } }
    );
  }
  await offer.update({ status: statusval });
  notifyOfferUpdatedByCompany(offer, statusval);
  return res.status(200).json({
    status: "success",
    data: offer,
  });
});

exports.deleteOffer = catchError(async (req, res, next) => {});
