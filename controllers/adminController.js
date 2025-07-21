const catchError = require("../util/catchError");
const { hashPassword, comparePassword } = require("../util/passwordFunc");
const { createJWTToken } = require("../util/createJWTToken");
const AppError = require("../util/appError");
const companyController = require("../controllers/companyController");
const sequelize = require("../database/database");
const { formatStats } = require("../util/formatStats");
const {
  Notification,
  Offer,
  Swap,
  Staff,
  Company,
  Admin,
} = require("../models");
const status = require("../util/statusType");
const { Op } = require("sequelize");
const getAnalytics = async () => {
  const now = new Date();
  const lastPeriod = new Date();
  lastPeriod.setDate(now.getDate() - 30);
  const [
    totalCompanies,
    pendingCompanies,
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
    Company.count({}),
    Company.count({
      where: {
        createdAt: { [Op.lt]: lastPeriod },
      },
    }),
    Staff.count({}),
    Staff.count({
      where: {
        createdAt: { [Op.lt]: lastPeriod },
      },
    }),
    Offer.count({
      where: { status: status.IN_REVIEW },
    }),
    Offer.count({
      where: {
        status: status.IN_REVIEW,
        createdAt: { [Op.lt]: lastPeriod },
      },
    }),
    Offer.count({
      where: { status: status.ACCEPTED },
    }),
    Offer.count({
      where: {
        status: status.ACCEPTED,
        createdAt: { [Op.lt]: lastPeriod },
      },
    }),
    Swap.count({
      where: { status: status.IN_REVIEW },
    }),
    Swap.count({
      where: {
        status: status.IN_REVIEW,
        createdAt: { [Op.lt]: lastPeriod },
      },
    }),
    Swap.count({
      where: { status: status.ACCEPTED },
    }),
    Swap.count({
      where: {
        status: status.ACCEPTED,
        createdAt: { [Op.lt]: lastPeriod },
      },
    }),
  ]);
  const growthcompany =
    ((totalCompanies - pendingCompanies) / (pendingCompanies || 1)) * 100;

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

  return { growthstaff, growthpending, growthaccepted, growthcompany };
};

const getDashboardDetails = async () => {
  const [
    companyCount,
    staffCount,
    swapCountByStatus,
    offerCountByStatus,
    notifications,
  ] = await Promise.all([
    Company.count(),
    Staff.count(),
    Swap.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("status")), "count"],
      ],
      group: ["status"],
      raw: true,
    }),
    Offer.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("status")), "count"],
      ],
      group: ["status"],
      raw: true,
    }),
  ]);

  const growth = await getAnalytics();
  const formatswaps = formatStats(swapCountByStatus);
  const formatoffer = formatStats(offerCountByStatus);
  return {
    formatswaps,
    formatoffer,
    companyCount,
    staffCount,
    notifications,
    growth,
  };
};
exports.login = catchError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("please provide email and password", 400));
  }
  const admin = await Admin.scope("withPassword").findOne({ where: { email } });
  if (!admin) {
    return next(new AppError("Admin does not exist", 404));
  }
  if (!comparePassword(password, admin.password)) {
    return next(new AppError("incorrect email or password", 400));
  }
  const token = createJWTToken(admin.id);
  admin.password = undefined;
  const {
    formatswaps,
    formatoffer,
    companyCount,
    staffCount,

    growth,
  } = await getDashboardDetails();
  return res.status(200).json({
    status: "success",
    token: token,
    data: {
      ...admin.dataValues,
      totalCompanies: companyCount,
      totalStaffs: staffCount,
      swapsByStatus: formatswaps,
      offersByStatus: formatoffer,

      growthStatistic: growth,
    },
  });
});

exports.register = catchError(async (req, res, next) => {
  if (req.body.password && req.body.password.length < 8) {
    return next(new AppError("Please input a stronger password", "401"));
  }
  const hashed = await hashPassword(req.body.password);

  console.log(req.body, "BODY");
  const admin = await Admin.create({
    email: req.body.email,
    password: hashed,
    fullName: req.body.fullName,
  });
  const token = createJWTToken(admin.id);
  return res.status(200).json({
    status: "success",
    token: token,
    data: admin,
  });
});

exports.getDashboardDetails = catchError(async (req, res, next) => {
  const admin = req.user;
  const {
    formatswaps,
    formatoffer,
    companyCount,
    staffCount,

    growth,
  } = await getDashboardDetails();
  res.status(200).json({
    status: "success",
    data: {
      ...admin.dataValues,
      totalCompanies: companyCount,
      totalStaffs: staffCount,
      swapsByStatus: formatswaps,
      offersByStatus: formatoffer,

      growthStatistic: growth,
    },
  });
});

exports.getAllCompanies = catchError(async (req, res, next) => {
  const { limit, offset, page } = req.pagination;
  const { count, rows: companies } = await Company.findAndCountAll({
    limit,
    offset,
  });
  return res.status(200).json({
    status: "success",
    data: companies,
    meta: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  });
});

exports.getOneCompany = catchError(async (req, res, next) => {
  const { companyId } = req.params;
  const company = await Company.findOne({ where: { id: companyId } });
  if (!company) {
    return next(new AppError("company not found", 404));
  }
  return res.status(200).json({
    status: "success",
    data: company,
  });
});
exports.registerCompany = companyController.signup;
