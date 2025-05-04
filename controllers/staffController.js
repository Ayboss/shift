const sequelize = require("../database/database");
const AppError = require("../util/appError");
const catchError = require("../util/catchError");
const { storeImageInCLoud } = require("../util/cloudinary");
const createJWTToken = require("../util/createJWTToken");
const { formatShitdata } = require("../util/formatData");
const { formatStats } = require("../util/formatStats");
const logger = require("../util/logger");
const { hashPassword, comparePassword } = require("../util/passwordFunc");
const { Op, where } = require("sequelize");
const { Swap, Staff, Shift, Offer, ShiftType, Company } = require("../models");

async function calculateTheStatistic(staffId) {
  try {
    const offerStats = await Offer.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("status")), "count"],
      ],
      where: { staffId: staffId }, // Offers created by the user
      group: ["status"],
      raw: true,
    });

    const swapStats = await Swap.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("status")), "count"],
      ],
      where: { staffId: staffId }, // Swaps created by the user
      group: ["status"],
      raw: true,
    });
    const claimedOfferStats = await Offer.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("status")), "count"],
      ],
      where: { claimerId: staffId }, // Offers claimed by the user
      group: ["status"],
      raw: true,
    });

    const claimedSwapStats = await Swap.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("status")), "count"],
      ],
      where: { claimerId: staffId }, // Swaps claimed by the user
      group: ["status"],
      raw: true,
    });
    return {
      offerStats: formatStats(offerStats),
      swapStats: formatStats(swapStats),
      claimedOfferStats: formatStats(claimedOfferStats),
      claimedSwapStats: formatStats(claimedSwapStats),
    };
  } catch (err) {
    console.log(err);
    return {
      offerStats: null,
      swapStats: null,
      claimedOfferStats: null,
      claimedSwapStats: null,
    };
  }
}

function confirmPasswordResetValididty(staff, code, next) {
  if (staff.passwordResetToken != code) {
    return next(
      new AppError(
        "Incorrect code, please request a forget password, and try again",
        400
      )
    );
  }
  if (!staff.passwordResetExpires || Date.now() > staff.passwordResetExpires) {
    return next(
      new AppError(
        "password expiring time over, please try the forgot password route again",
        400
      )
    );
  }
  return true;
}

exports.signup = catchError(async (req, res, next) => {
  // return res.send("hiii ");
  const { email, fullName, shiftId } = req.body;
  if (!email || !fullName || !shiftId) {
    return next(new AppError("email, shiftid and fullname  is required", 400));
  }
  const staff = await Staff.findOne({
    where: { id: shiftId },
    include: { model: Company, as: "company" },
  });

  if (!staff) {
    return next(
      new AppError(
        "Account does not exist, Please contact your company to add you it's account",
        400
      )
    );
  }
  if (staff.verified) {
    return next(new AppError("Account exist, please go to login", 400));
  }

  await staff.update({ fullName });
  // send user the shift code to his email
  const token = createJWTToken(staff.id);
  return res.status(200).json({
    status: "success",
    token: token,
    data: { company: staff.company },
  });
});

exports.setPassword = catchError(async (req, res, next) => {
  const user = req.user;
  const { password } = req.body;
  if (password && password.length < 8) {
    return next(new AppError("Please input a stronger password", "401"));
  }
  const hashed = await hashPassword(req.body.password);

  const staff = await Staff.findOne({
    where: { id: user.id, verified: false },
  });
  if (!staff) {
    return next(
      new AppError("This account already exist, please go to signin", "401")
    );
  }
  await staff.update({ verified: true, password: hashed });
  staff.password = null;
  const token = createJWTToken(staff.id);
  return res.status(200).json({
    status: "success",
    token: token,
    data: staff,
  });
});

exports.login = catchError(async (req, res, next) => {
  const { shiftId, password } = req.body;
  if (!shiftId || !password) {
    return next(new AppError("shiftid and password are required", "401"));
  }
  const staff = await Staff.scope("withPassword").findOne({
    where: { id: shiftId, verified: true },
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["id", "companyName", "companyEmail"],
      },
    ],
  });

  if (!staff) {
    return next(new AppError("staff does not exist", 404));
  }

  if (!(await comparePassword(password, staff.password))) {
    return next(new AppError("incorrect shiftid or password", 400));
  }

  staff.password = undefined;
  const token = createJWTToken(staff.id);
  const shiftTypes = await ShiftType.findAll({
    where: { companyId: staff.companyId },
    order: [["startTime", "ASC"]],
  });

  let upcomingshift = await Shift.findAll({
    where: {
      staffId: staff.id,
      date: {
        [Op.gt]: new Date(),
      },
    },
    order: [
      ["date", "ASC"],
      ["type", "DESC"],
    ],
    limit: 20,
  });
  const mostRecentShift = upcomingshift.length > 0 ? upcomingshift[0] : {};
  const { offerStats, swapStats, claimedOfferStats, claimedSwapStats } =
    await calculateTheStatistic(staff.id);
  if (req.query.format == "true") {
    upcomingshift = formatShitdata(upcomingshift, shiftTypes);
  }
  return res.status(200).json({
    status: "success",
    token: token,
    data: {
      staff,
      offerStats,
      swapStats,
      claimedOfferStats,
      claimedSwapStats,
      upcomingshift,
      mostRecentShift,
      shiftTypes,
    },
  });
});

exports.getCurrentUserWithDashboard = catchError(async (req, res, next) => {
  const staff = await Staff.findOne({
    where: { id: req.user.id, verified: true },
    include: [
      {
        model: Company,
        as: "company",
        attributes: ["id", "companyName", "companyEmail"],
      },
    ],
  });
  let upcomingshift = await Shift.findAll({
    where: {
      staffId: staff.id,
      date: {
        [Op.gt]: new Date(),
      },
    },
    order: [
      ["date", "ASC"],
      ["type", "DESC"],
    ],
    limit: 20,
  });
  const shiftTypes = await ShiftType.findAll({
    where: { companyId: req.user.companyId },
    order: [["startTime", "ASC"]],
  });
  const mostRecentShift = upcomingshift.length > 0 ? upcomingshift[0] : {};
  const { offerStats, swapStats, claimedOfferStats, claimedSwapStats } =
    await calculateTheStatistic(staff.id);
  if (req.query.format == "true") {
    upcomingshift = formatShitdata(upcomingshift, shiftTypes);
  }
  return res.status(200).json({
    status: "success",
    data: {
      staff,
      offerStats,
      swapStats,
      claimedOfferStats,
      claimedSwapStats,
      upcomingshift,
      mostRecentShift,
      shiftTypes,
    },
  });
});

exports.forgotPassword = catchError(async (req, res, next) => {
  // generate a code, and send it to mail
  // confirm the code and allow for the user to send a email
  const staffId = req.body.staffId;
  const staff = await Staff.findOne({ where: { id: staffId } });
  if (!staff) {
    return next(new AppError("this staff does not exist", 404));
  }
  // create code
  code = "1111";
  staff.passwordResetToken = code;
  staff.passwordResetExpires = Date.now() + 1000 * 60 * 10;
  await staff.save();
  staff.passwordResetExpires = undefined;
  staff.passwordResetToken = undefined;
  // send token to the mail
  const token = createJWTToken(staff.id);
  return res.status(200).json({
    status: "success",
    message: "token sent to staff mail",
    token: token,
    data: staff,
  });
});

exports.confirmCode = catchError(async (req, res, next) => {
  const code = req.body.code;
  const staff = req.user;
  // check the time duration and the code
  if (!confirmPasswordResetValididty(staff, code, next)) return;
  staff.password = undefined;
  staff.passwordResetExpires = undefined;
  staff.passwordResetToken = undefined;
  return res.status(200).json({
    status: "success",
    data: staff,
  });
});

exports.resetpassword = catchError(async (req, res, next) => {
  const code = req.body.code;
  const password = req.body.password;
  const staff = req.user;
  // check the time duration and the code
  if (!confirmPasswordResetValididty(staff, code, next)) return;
  if (password && password.length < 8) {
    return next(new AppError("Please input a stronger password", "401"));
  }
  const hashed = await hashPassword(req.body.password);
  staff.password = hashed;
  staff.passwordResetExpires = null;
  staff.passwordResetToken = null;
  staff.passwordChangedAt = Date.now() + 1000;
  await staff.save();
  staff.password = undefined;
  return res.status(200).json({
    status: "success",
    data: staff,
  });
});

exports.workingAtSameTime = catchError(async (req, res, next) => {
  const { shiftId } = req.params;
  const user = req.user;
  // get the shift id , date and time ,  get others the shift with same time and same period

  const shift = await Shift.findOne({ where: { id: shiftId } });
  const shifts = await Shift.findAll({
    where: { date: shift.date, type: shift.type },
    include: [
      {
        model: Staff,
        as: "staff",
        attributes: ["id", "fullName", "image", "email"],
      },
    ],
  });
  console.log(shifts[0].staff, "🚀");
  const staffs = [];
  shifts.forEach((sh) => {
    if (sh.staff.id != user.id || sh.staff.verified) {
      staffs.push(sh.staff);
    }
  });

  return res.status(200).json({
    status: "success",
    data: staffs,
  });
});

exports.getStaffs = catchError(async (req, res, next) => {
  const staff = req.user;
  const staffs = await Staff.findAll({
    where: { companyId: staff.companyId, id: { [Op.not]: staff.id } },
  });

  return res.status(200).json({
    status: "success",
    data: staffs,
  });
});

exports.getOneStaff = catchError(async (req, res, next) => {
  const staffId = req.params.staffId;
  const staff = await Staff.findOne({
    where: { companyId: req.user.companyId, id: staffId },
  });
  if (!staff) {
    return next(new AppError("this staff does not exist", 404));
  }
  return res.status(200).json({
    status: "success",
    data: staff,
  });
});

exports.updateStaff = catchError(async (req, res, next) => {
  const staff = req.user;
  if (req.body.fullName) staff.fullName = req.body.fullName;
  if (req.body.phoneNumber) staff.phoneNumber = req.body.phoneNumber;
  await staff.save();
  return res.status(200).json({
    status: "sucess",
    data: staff,
  });
});

exports.uploadStaffImage = catchError(async (req, res, next) => {
  const staff = req.user;
  let imageurl = req.body.emojinumber;
  let isImageMemoji = true;
  if (req.body.isMemoji === false || req.body.isMemoji === "false") {
    isImageMemoji = false;
    imageurl = await storeImageInCLoud(req.file);
  }

  staff.image = imageurl;
  staff.isImageMemoji = isImageMemoji;
  await staff.save();
  res.status(200).json({
    status: "success",
    data: staff,
  });
});

exports.verifyStaffCompany = catchError(async (req, res, next) => {
  const staff = await Staff.findOne({
    where: { id: req.params.staffId },
    include: { model: Company, as: "company" },
  });
  if (!staff) {
    return next(new AppError("staff not found", 404));
  }
  return res.status(200).json({
    status: "success",
    message: "staff information require",
    data: staff.company,
  });
});

exports.getOffersAndSwaps = catchError(async (req, res, next) => {
  const user = req.user;
  const { status } = req.query;
  const whereClause = {
    companyId: user.companyId,
  };
  const whereClauseswap = {
    companyId: user.companyId,
    [Op.or]: [{ staffId: user.id }, { claimerId: user.id }],
  };
  if (status) {
    whereClause.status = status;
    whereClauseswap.status = status;
  }
  const offers = await Offer.findAll({
    where: whereClause,
    raw: true,
  });
  const swaps = await Swap.findAll({
    where: whereClauseswap,
    raw: true,
  });

  // 🔥 Tag each with a type so you know which is which
  const offersWithType = offers.map((offer) => ({
    ...offer,
    type: "OFFER",
  }));

  const swapsWithType = swaps.map((swap) => ({
    ...swap,
    type: "SWAP",
  }));

  // 🔥 Combine and sort by createdAt
  const combined = [...offersWithType, ...swapsWithType].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt) // descending order (newest first)
  );
  res.status(200).json({
    status: "success",
    data: combined,
  });
});
