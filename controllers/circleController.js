const Circle = require("../models/circleModel");
const Staff = require("../models/staffModel");
const AppError = require("../util/appError");
const catchError = require("../util/catchError");

exports.getUserCircle = catchError(async (req, res, next) => {
  // check if the user is in the same company
  const user = req.user;

  const circles = await Circle.findAll({
    where: { staffId: user.id },
    include: [
      {
        model: Staff,
        as: "member",
        attributes: ["id", "fullName", "email"],
      },
    ],
  });

  return res.status(200).json({
    status: "success",
    data: circles,
  });
});

exports.createCircle = catchError(async (req, res, next) => {
  // check if the user is in the same company
  const user = req.user;
  const { memberId } = req.body;
  const staff = await Staff.findOne({ where: { id: memberId } });

  if (!staff || staff.companyId !== user.companyId) {
    return next(new AppError("You can't add this staff to your circle", 400));
  }
  const circle = await Circle.create({
    staffId: user.id,
    memberId: memberId,
  });
  return res.status(200).json({
    status: "success",
    data: circle,
  });
});

exports.remmoveFromCircle = catchError(async (req, res, next) => {
  // find the circle that has the memberid and userid , and delete
  const user = req.user;
  const { memberId } = req.body;
  const circle = await Circle.findOne({
    where: {
      staffId: user.id,
      memberId: memberId,
    },
  });
  if (!circle) {
    return next(new AppError("this circle does not exist", 400));
  }
  await circle.destroy();
  return res.status(200).json({
    status: "success",
    data: circle,
  });
});
