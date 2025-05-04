const catchError = require("../util/catchError");
const AppError = require("../util/appError");
const status = require("../util/statusType");
const {
  notifyOfferIsClaimed,
  notifyOfferUpdatedByCompany,
  notifyOfferToCircle,
} = require("./eventlisteners");
const { Staff, Shift, Offer } = require("../models");

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

exports.getAllOffer = catchError(async (req, res, next) => {
  const { status } = req.query;
  const whereClause = {
    companyId: req.user.companyId,
  };
  if (status) {
    whereClause.status = status;
  }
  // filter by status
  const attribute = [
    "id",
    "fullName",
    "phoneNumber",
    "email",
    "image",
    "isImageMemoji",
  ];
  const offers = await Offer.findAll({
    where: whereClause,
    include: [
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
    ],
  });

  return res.status(200).json({
    status: "success",
    data: offers,
  });
});

exports.getOneOffer = catchError(async (req, res, next) => {
  const { offerId } = req.params;
  const offer = await Offer.findOne({
    where: { companyId: req.user.companyId, id: offerId },
    include: [
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
    ],
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
