const associateModels = require("./association");
const Circle = require("./circleModel");
const Company = require("./companyModel");
const Offer = require("./offerModel");
const Shift = require("./shiftModel");
const ShiftType = require("./shiftTypeModel");
const Staff = require("./staffModel");
const Swap = require("./swapModel");
const Notification = require("./notificationModel");
const Admin = require("./adminModel");
const WaitList = require("./waitListModel");
const Attendance = require("./attendanceModel");
const models = {
  Circle,
  Company,
  Offer,
  Shift,
  ShiftType,
  Staff,
  Swap,
  Notification,
  Admin,
  WaitList,
  Attendance,
};
associateModels(models);

module.exports = models;
