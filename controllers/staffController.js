const sequelize = require("../database/database");
const Company = require("../models/companyModel");
const Offer = require("../models/offerModel");
const Shift = require("../models/shiftModel");
const Staff = require("../models/staffModel");
const Swap = require("../models/swapModel");
const AppError = require("../util/appError");
const catchError = require("../util/catchError");
const { storeImageInCLoud } = require("../util/cloudinary");
const createJWTToken = require("../util/createJWTToken");
const { formatStats } = require("../util/formatStats");
const logger = require("../util/logger");
const { hashPassword, comparePassword } = require("../util/passwordFunc");
const { Op, where } = require("sequelize");

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
    console.log(
      offerStats,
      swapStats,
      claimedOfferStats,
      claimedSwapStats,
      "here too"
    );
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

exports.signup = catchError(async (req, res, next) => {
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

exports.confirmCode = catchError(async (req, res, next) => {
  const user = req.user;
  const shiftId = req.body.code;

  return res.send("do we really need this endpoint");
  // if (shiftId != user.id){
  //     return next(
  //         new AppError(
  //           "Incorrect shiftid provided, please check your mail for your shift id",
  //           401
  //         )
  //       );
  // }
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
        attributes: [
          "id",
          "companyName",
          // "morningShiftStart",
          // "morningShiftEnd",
          // "eveningShiftStart",
          // "eveningShiftEnd",
        ],
      },
    ],
  });
  if (!staff) {
    return next(new AppError("staff does not exist", 404));
  }

  if (!comparePassword(password, staff.password)) {
    return next(new AppError("incorrect shiftid or password", 400));
  }

  staff.password = undefined;
  const token = createJWTToken(staff.id);

  const upcomingshift = await Shift.findAll({
    where: {
      staffId: staff.id,
      date: {
        [Op.gt]: new Date(),
      },
    },
    order: [
      ["date", "ASC"],
      ["isMorning", "DESC"],
    ],
    limit: 20,
  });
  const mostRecentShift = upcomingshift.length > 0 ? upcomingshift[0] : {};
  const { offerStats, swapStats, claimedOfferStats, claimedSwapStats } =
    await calculateTheStatistic(staff.id);

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
    },
  });
});

exports.workingAtSameTime = catchError(async (req, res, next) => {
  const { shiftId } = req.params;
  const user = req.user;
  // get the shift id , date and time ,  get others the shift with same time and same period

  const shift = await Shift.findOne({ where: { id: shiftId } });
  const shifts = await Shift.findAll({
    where: { date: shift.date, isMorning: shift.isMorning },
    include: [
      {
        model: Staff,
        as: "staff",
        attributes: ["id", "fullName", "image", "email"],
      },
    ],
  });

  const staffs = [];
  shifts.forEach((sh) => {
    if (sh.staff.id != user.id || sh.staff.verified) {
      staffs.push(sh._model.staff);
    }
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
