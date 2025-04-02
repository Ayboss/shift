const xlsx = require("xlsx");
const Shift = require("../models/shiftModel");
const catchError = require("../util/catchError");
const logger = require("../util/logger");
const AppError = require("../util/appError");

exports.getAllShifts = catchError(async (req, res, next) => {
  const shifts = await Shift.findAll({
    where: { companyId: req.user.companyId },
  });
  return res.status(200).json({
    status: "success",
    data: shifts,
  });
});

exports.getOneShift = catchError(async (req, res, next) => {
  const { shiftId } = req.params;
  const shift = await Shift.findOne({
    where: { companyId: req.user.companyId, id: shiftId },
  });

  if (!shift) {
    return next(
      new AppError("This shift for this company does not exist", 400)
    );
  }
  return res.status(200).json({
    status: "success",
    data: shift,
  });
});

exports.getAllStaffShift = catchError(async (req, res, next) => {
  const { staffId } = req.params;
  const shifts = await Shift.findAll({
    where: { companyId: req.user.companyId, staffId: staffId },
  });

  return res.status(200).json({
    status: "success",
    data: shifts,
  });
});

exports.addBulkShift = catchError(async (req, res, next) => {
  const company = req.user;
  if (!req.file) {
    return new AppError(
      "Please upload an excel file containing the shift",
      400
    );
  }

  const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0]; // Read the first sheet
  const shiftdata = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const mapper = {
    __EMPTY_1: "Mon",
    __EMPTY_2: "Tue",
    __EMPTY_3: "Wed",
    __EMPTY_4: "Thur",
    __EMPTY_5: "Fri",
    __EMPTY_6: "Sat",
    __EMPTY_7: "Sun",
    __EMPTY_9: "Mon_1",
    __EMPTY_10: "Tue_1",
    __EMPTY_11: "Wed_1",
    __EMPTY_12: "Thur_1",
    __EMPTY_13: "Fri_1",
    __EMPTY_14: "Sat_1",
    __EMPTY_15: "Sun_1",
  };

  //   logger.info(shiftdata);
  const shifts = [];
  const dates = {};
  const isShiftMorning = [];
  const currentYear = new Date().getFullYear();
  for (let key in shiftdata[0]) {
    let date = `${shiftdata[0][key]}`;
    let day = date.split(".")[0];
    let month = date.split(".")[1];
    dates[key] = new Date(currentYear, month, day);
  }
  for (let key in shiftdata[1]) {
    time = shiftdata[1][key];
    isShiftMorning[key] = time.toLowerCase() == "glo";
  }

  for (let i = 2; i < shiftdata.length; i++) {
    // logger.info(shiftdata[i]);

    let staffId = "";
    for (let key in shiftdata[i]) {
      const shift = {};
      const data = shiftdata[i][key];
      if (key == "__EMPTY") {
        staffId = data;
        continue;
      }
      if (data == "1") {
        shift.isMorning = isShiftMorning[key];
        if (key in dates) {
          shift.date = dates[key];
        } else {
          shift.date = dates[mapper[key]];
        }
      }
      if (!shift.date) continue;
      shift.staffId = staffId;
      shift.companyId = company.id;
      shifts.push(shift);
    }
  }

  await Shift.bulkCreate(shifts);

  return res.status(200).json({
    status: "success",
    data: null,
  });
});
