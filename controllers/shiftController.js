const xlsx = require("xlsx");
const catchError = require("../util/catchError");
const logger = require("../util/logger");
const AppError = require("../util/appError");
const { formatShitdata } = require("../util/formatData");
const { Staff, Shift, ShiftType, Offer, Swap } = require("../models");

// so I return the company type details here
exports.getAllShifts = catchError(async (req, res, next) => {
  const shifts = await Shift.findAll({
    where: { companyId: req.user.companyId },
  });
  // find all shifttype belonging to company id, order in terms of start date
  const shiftTypes = await ShiftType.findAll({
    where: { companyId: req.user.companyId },
    order: [["startTime", "ASC"]],
  });
  return res.status(200).json({
    status: "success",
    data: shifts,
    shiftTypes: shiftTypes,
  });
});

exports.getOneShift = catchError(async (req, res, next) => {
  const { shiftId } = req.params;
  const shift = await Shift.findOne({
    where: { companyId: req.user.companyId, id: shiftId },
    include: [
      {
        model: Offer,
        attributes: ["id", "status"],
      },
      {
        model: Swap,
        attributes: ["id", "status"],
      },
    ],
  });
  const shiftTypes = await ShiftType.findAll({
    where: { companyId: req.user.companyId },
    order: [["startTime", "ASC"]],
  });
  if (!shift) {
    return next(
      new AppError("This shift for this company does not exist", 400)
    );
  }
  return res.status(200).json({
    status: "success",
    data: shift,
    shiftTypes: shiftTypes,
  });
});

exports.getAllStaffShift = catchError(async (req, res, next) => {
  const { staffId } = req.params;
  let shifts = await Shift.findAll({
    where: { companyId: req.user.companyId, staffId: staffId },
  });
  const shiftTypes = await ShiftType.findAll({
    where: { companyId: req.user.companyId },
    order: [["startTime", "ASC"]],
  });

  if (req.query.format == "true") {
    shifts = formatShitdata(shifts, shiftTypes);
  }

  return res.status(200).json({
    status: "success",
    data: shifts,
    shiftTypes: shiftTypes,
  });
});

exports.addBulkShift = catchError(async (req, res, next) => {
  const company = req.user;
  if (!req.file) {
    return next(
      new AppError("Please upload an excel file containing the shift", 400)
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
    let month = date.split(".")[1] - 1;
    dates[key] = new Date(currentYear, month, day);
  }
  for (let key in shiftdata[1]) {
    time = shiftdata[1][key];
    isShiftMorning[key] = time.toLowerCase();
  }

  const existingstaff = new Set();
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
        shift.type = isShiftMorning[key];
        if (key in dates) {
          shift.date = dates[key];
        } else {
          shift.date = dates[mapper[key]];
        }
      }
      if (!shift.date) continue;
      if (!existingstaff.has(shift.date)) {
        const newstaff = await Staff.findOne({ where: { id: staffId } });
        if (!newstaff) continue;
        existingstaff.add(newstaff.id);
      }
      shift.staffId = staffId;
      shift.companyId = company.id;
      shifts.push(shift);
    }
  }

  // delete all offers and swaps with company
  await Offer.destroy({ where: { companyId: company.id } });
  await Swap.destroy({ where: { companyId: company.id } });
  await Shift.destroy({ where: { companyId: company.id } });
  await Shift.bulkCreate(shifts);

  return res.status(200).json({
    status: "success",
    data: null,
  });
});
