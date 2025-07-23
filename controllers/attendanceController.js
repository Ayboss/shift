const { Attendance, ShiftType, Shift } = require("../models");
const AppError = require("../util/appError");
const catchError = require("../util/catchError");
const {
  createAttendanceToken,
  verifyAttendanceToken,
} = require("../util/createJWTToken");
const QRCode = require("qrcode");

// Helper to turn a "HH:mm:ss" into a Date on the given baseDate
function makeTodayTime(timestr, baseDate) {
  const [h, m, s] = timestr.split(":").map(Number);
  const d = new Date(baseDate);
  d.setHours(h, m, s, 0);
  return d;
}

exports.getCompanyAttendance = catchError(async (req, res, next) => {
  const { limit, offset, page } = req.pagination;
  const company = req.user;
  const where = { companyId: company.id };
  const { date } = req.query;
  if (date) {
    where["date"] = date;
  }
  const { count, rows: attendance } = await Attendance.findAndCountAll({
    limit,
    offset,
    where: where,
    order: [
      ["date", "DESC"],
      ["time", "ASC"],
    ],
  });
  return res.status(200).json({
    status: "success",
    data: attendance,
    meta: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  });
});

exports.getStaffAttendance = catchError(async (req, res, next) => {
  const { limit, offset, page } = req.pagination;
  const staffId = req.params.staffId;
  const company = req.user;
  const { count, rows: attendance } = await Attendance.findAndCountAll({
    limit,
    offset,
    where: { companyId: company.id, staffId: staffId },
  });
  return res.status(200).json({
    status: "success",
    data: attendance,
    meta: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  });
});

exports.getQRAttendaceInformation = catchError(async (req, res, next) => {
  const company = req.user;
  const now = new Date();
  const day = now.toISOString().split("T")[0]; // e.g. "2025-07-21"
  const currentTime = now;

  const shiftTypes = await ShiftType.findAll({
    where: { companyId: company.id },
    raw: true,
  });

  let attendanceShiftType = null;
  let expiresAt = 0;
  for (const st of shiftTypes) {
    const start = makeTodayTime(st.startTime, now);
    const end = makeTodayTime(st.endTime, now);
    start.setMinutes(start.getMinutes() - 30);
    end.setMinutes(end.getMinutes() - 30);
    console.log(start, end, currentTime, "TIME START");
    console.log(st);
    if (currentTime >= start && currentTime <= end) {
      attendanceShiftType = st;
      expiresAt = end;
      break;
    }
  }
  if (!attendanceShiftType) {
    return next(new AppError("It is not work time yet", 400));
  }
  const ttlMs = expiresAt.getTime() - currentTime.getTime();
  const token = createAttendanceToken(
    {
      type: attendanceShiftType.name,
      day,
      companyId: company.id,
    },
    ttlMs
  );

  const qrcodeurl = await QRCode.toDataURL(token);

  return res.status(200).json({
    status: "success",
    message: `Attendance for ${attendanceShiftType.name}`,
    data: { url: qrcodeurl, expiresAt: expiresAt },
  });
});

exports.markAttendace = catchError(async (req, res, next) => {
  // validate token and mark attendance, check if there is a shift at that time, and mark attendance
  const staff = req.user;
  const currentTime = new Date();
  // const day = now.toISOString().split("T")[0]; // e.g. "2025-07-21"

  const attedanceToken = req.body.attedanceToken;
  const payload = await verifyAttendanceToken(attedanceToken);
  // check if the attendance belongs to the  company
  if (payload.companyId !== staff.companyId) {
    return next(new AppError("Staff does not belong to this company", 400));
  }
  // check the time
  if (currentTime > payload.expiresAt) {
    return next(new AppError("Attendance has expired.", 400));
  }
  // verify token
  const shift = await Shift.findOne({
    where: {
      type: payload.type,
      date: payload.day,
      staffId: staff.id,
      companyId: staff.companyId,
    },
  });
  if (!shift) {
    return next(new AppError("No matching shift for this time.", 404));
  }
  const [attendance, created] = await Attendance.findOrCreate({
    where: {
      staffId: staff.id,
      companyId: staff.companyId,
      date: payload.day,
      type: payload.type,
    },
    defaults: {
      time: currentTime,
    },
  });
  if (!created) {
    return next(new AppError("Attendance already recorded.", 400));
  }
  res.status(200).json({ status: "success", data: attendance });
});
