const Notification = require("../models/notificationModel");
const catchError = require("../util/catchError");

exports.getNotifications = catchError(async (req, res, next) => {
  const user = req.user;
  const notifications = await Notification.findAll({
    where: { staffId: user.id },
  });
  res.status(200).json({
    status: "success",
    data: notifications,
  });
});

exports.createNotification = catchError(async (req, res, next) => {
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
