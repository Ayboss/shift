const { Notification } = require("../models");
const catchError = require("../util/catchError");
const { notifyOfferToCircle } = require("./eventlisteners");

exports.getNotifications = catchError(async (req, res, next) => {
  const user = req.user;
  const { limit, offset, page } = req.pagination;
  const { count, rows: notifications } = await Notification.findAndCountAll({
    where: { staffId: user.id },
    limit,
    offset,
  });
  res.status(200).json({
    status: "success",
    data: notifications,
    meta: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  });
});

exports.getCompanyNotifications = catchError(async (req, res, next) => {
  const user = req.user;
  const { limit, offset, page } = req.pagination;
  const { count, rows: notifications } = await Notification.findAndCountAll({
    where: { companyId: user.id },
    limit,
    offset,
  });
  res.status(200).json({
    status: "success",
    data: notifications,
    meta: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  });
});

exports.createNotification = catchError(async (req, res, next) => {
  const user = req.user;
  notifyOfferToCircle(user, "b8e06307-126f-49a8-bfb8-785b1b9ed663");
  return res.status(200).json({
    status: "success",
    data: null,
  });
  const { staffId, title, description, notifType } = req.body;
  const notification = await Notification.create({
    staffId,
    title,
    description,
    notifType,
  });
  res.status(200).json({
    status: "success",
    data: notification,
  });
});
