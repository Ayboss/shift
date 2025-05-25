const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AppError = require("../util/appError");
const catchError = require("../util/catchError");
const createJWTToken = require("../util/createJWTToken");
const { hashPassword, comparePassword } = require("../util/passwordFunc");
const sequelize = require("../database/database");
const { formatStats } = require("../util/formatStats");
const { fn, col, literal, Op } = require("sequelize");
const {
  Shift,
  Offer,
  Swap,
  Notification,
  Staff,
  Company,
} = require("../models");
const status = require("../util/statusType");

const statDetailsClause = {
  attributes: {
    include: [
      [fn("COUNT", col("shifts.id")), "shiftsCount"],

      [
        fn(
          "SUM",
          literal(`CASE WHEN offers.status = 'OPEN' THEN 1 ELSE 0 END`)
        ),
        "offersOpen",
      ],
      [
        fn(
          "SUM",
          literal(`CASE WHEN offers.status = 'IN_REVIEW' THEN 1 ELSE 0 END`)
        ),
        "offersReview",
      ],
      [
        fn(
          "SUM",
          literal(`CASE WHEN offers.status = 'ACCEPTED' THEN 1 ELSE 0 END`)
        ),
        "offersAccepted",
      ],
      [
        fn(
          "SUM",
          literal(`CASE WHEN offers.status = 'DECLINED' THEN 1 ELSE 0 END`)
        ),
        "offersDeclined",
      ],

      [
        fn("SUM", literal(`CASE WHEN swaps.status = 'OPEN' THEN 1 ELSE 0 END`)),
        "swapsOpen",
      ],
      [
        fn(
          "SUM",
          literal(`CASE WHEN swaps.status = 'IN_REVIEW' THEN 1 ELSE 0 END`)
        ),
        "swapsReview",
      ],
      [
        fn(
          "SUM",
          literal(`CASE WHEN swaps.status = 'ACCEPTED' THEN 1 ELSE 0 END`)
        ),
        "swapsAccepted",
      ],
      [
        fn(
          "SUM",
          literal(`CASE WHEN swaps.status = 'DECLINED' THEN 1 ELSE 0 END`)
        ),
        "swapsDeclined",
      ],
    ],
  },
  include: [
    {
      model: Shift,
      as: "shifts",
      attributes: [],
      required: false, // Make this a LEFT JOIN
    },
    {
      model: Offer,
      as: "offers",
      attributes: [],
      required: false, // Make this a LEFT JOIN
    },
    {
      model: Swap,
      as: "swaps",
      attributes: [],
      required: false, // Make this a LEFT JOIN
    },
  ],
  group: ["Staff.id"],
  subQuery: false, // This is the key change - prevent Sequelize from creating a subquery
};

const getAnalytics = async (company) => {
  const now = new Date();
  const lastPeriod = new Date();
  lastPeriod.setDate(now.getDate() - 30);
  const [
    totalUsers,
    previousUsers,
    totalPendingoffers,
    pendingoffers,
    totalAcceptedoffers,
    acceptedoffers,
    totalPendingswaps,
    pendingoswaps,
    totalAcceptedswaps,
    acceptedswaps,
  ] = await Promise.all([
    Staff.count({ where: { companyId: company.id } }),
    Staff.count({
      where: {
        companyId: company.id,
        createdAt: { [Op.lt]: lastPeriod },
      },
    }),
    Offer.count({
      where: { companyId: company.id, status: status.IN_REVIEW },
    }),
    Offer.count({
      where: {
        companyId: company.id,
        status: status.IN_REVIEW,
        createdAt: { [Op.lt]: lastPeriod },
      },
    }),
    Offer.count({
      where: { companyId: company.id, status: status.ACCEPTED },
    }),
    Offer.count({
      where: {
        companyId: company.id,
        status: status.ACCEPTED,
        createdAt: { [Op.lt]: lastPeriod },
      },
    }),
    Swap.count({
      where: { companyId: company.id, status: status.IN_REVIEW },
    }),
    Swap.count({
      where: {
        companyId: company.id,
        status: status.IN_REVIEW,
        createdAt: { [Op.lt]: lastPeriod },
      },
    }),
    Swap.count({
      where: { companyId: company.id, status: status.ACCEPTED },
    }),
    Swap.count({
      where: {
        companyId: company.id,
        status: status.ACCEPTED,
        createdAt: { [Op.lt]: lastPeriod },
      },
    }),
  ]);

  const growthstaff =
    ((totalUsers - previousUsers) / (previousUsers || 1)) * 100;
  const growthpending =
    ((totalPendingoffers +
      totalPendingswaps -
      (pendingoffers + pendingoswaps)) /
      (pendingoffers + pendingoswaps || 1)) *
    100;
  const growthaccepted =
    ((totalAcceptedoffers +
      totalAcceptedswaps -
      (acceptedoffers + acceptedswaps)) /
      (acceptedoffers + acceptedswaps || 1)) *
    100;

  // console.log("PRINT HERE", growthstaff, growthpending, growthaccepted);
  return { growthstaff, growthpending, growthaccepted };
};
const getDashboardDetails = async (company) => {
  const [staffCount, swapCountByStatus, offerCountByStatus, workerstat] =
    await Promise.all([
      Staff.count({ where: { companyId: company.id } }),
      Swap.findAll({
        attributes: [
          "status",
          [sequelize.fn("COUNT", sequelize.col("status")), "count"],
        ],
        where: { companyId: company.id },
        group: ["status"],
        raw: true,
      }),
      Offer.findAll({
        attributes: [
          "status",
          [sequelize.fn("COUNT", sequelize.col("status")), "count"],
        ],
        where: { companyId: company.id },
        group: ["status"],
        raw: true,
      }),
      Staff.findOne({
        where: {
          companyId: company.id,
        },
        attributes: [
          [
            sequelize.literal(
              `COUNT(CASE WHEN verified = true AND blocked = false THEN 1 END)`
            ),
            "verifiedCount",
          ],
          [
            sequelize.literal(
              `COUNT(CASE WHEN verified = false AND blocked = false THEN 1 END)`
            ),
            "nonVerifiedCount",
          ],
          [
            sequelize.literal(`COUNT(CASE WHEN blocked = true THEN 1 END)`),
            "blockedCount",
          ],
        ],
        raw: true,
      }),
    ]);

  const growth = await getAnalytics(company);

  const formatswaps = formatStats(swapCountByStatus);
  const formatoffer = formatStats(offerCountByStatus);
  return { formatswaps, formatoffer, workerstat, staffCount, growth };
};

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
    return next(new AppError("company does not exist", 404));
  }

  if (!comparePassword(password, company.password)) {
    return next(new AppError("incorrect email or password", 400));
  }

  const token = createJWTToken(company.id);
  company.password = undefined;

  const { formatswaps, formatoffer, workerstat, staffCount, growth } =
    await getDashboardDetails(company);
  return res.status(200).json({
    status: "success",
    token: token,
    data: {
      ...company.dataValues,
      totalStaffs: staffCount,
      swapsByStatus: formatswaps,
      offersByStatus: formatoffer,
      workersStatistic: workerstat,
      growthStatistic: growth,
    },
  });
});

exports.getDashboardDetails = catchError(async (req, res, next) => {
  const company = req.user;
  const { formatswaps, formatoffer, workerstat, staffCount, growth } =
    await getDashboardDetails(company);
  res.status(200).json({
    status: "success",
    data: {
      ...company.dataValues,
      totalStaffs: staffCount,
      swapsByStatus: formatswaps,
      offersByStatus: formatoffer,
      workersStatistic: workerstat,
      growthStatistic: growth,
    },
  });
});

exports.getWorkerDetails = catchError(async (req, res, next) => {
  const company = req.user;
  const workerstat = await Staff.findOne({
    where: {
      companyId: company.id,
    },
    attributes: [
      [
        sequelize.literal(
          `COUNT(CASE WHEN verified = true AND blocked = false THEN 1 END)`
        ),
        "verifiedCount",
      ],
      [
        sequelize.literal(
          `COUNT(CASE WHEN verified = false AND blocked = false THEN 1 END)`
        ),
        "nonVerifiedCount",
      ],
      [
        sequelize.literal(`COUNT(CASE WHEN blocked = true THEN 1 END)`),
        "blockedCount",
      ],
    ],
    raw: true,
  });
  res.status(200).json({
    status: "success",
    data: workerstat,
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
  const { limit, offset, page } = req.pagination;
  const [count, staffs] = await Promise.all([
    Staff.count({
      where: { companyId: company.id },
    }),
    Staff.findAll({
      where: { companyId: company.id },
      ...statDetailsClause,
      limit,
      offset,
    }),
  ]);

  return res.status(200).json({
    status: "success",
    data: staffs,
    meta: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  });
});

exports.getOneStaff = catchError(async (req, res, next) => {
  const company = req.user;
  const staffId = req.params.staffId;
  const staff = await Staff.findOne({
    where: { companyId: company.id, id: staffId },
    ...statDetailsClause,
  });
  if (!staff) {
    return next(new AppError("this staff does not exist", 404));
  }
  return res.status(200).json({
    status: "success",
    data: staff,
  });
});

exports.blockStaff = catchError(async (req, res, next) => {
  const company = req.user;
  const { staffId } = req.params;
  const { block } = req.body;
  if (block == undefined || block == null) {
    return next(new AppError("block body is required", 400));
  }
  const staff = await Staff.findOne({
    where: { companyId: company.id, id: staffId },
  });
  if (!staff) {
    return next(new AppError("this staff does not exist", 400));
  }
  await staff.update({ blocked: !!block });
  return res.status(200).json({
    status: "success",
    data: staff,
    message: `Staff has been ${block ? "blocked" : "unblocked"} successfully`,
  });
});

exports.updateStaff = catchError(async (req, res, next) => {});

exports.deleteStaff = catchError(async (req, res, next) => {});
