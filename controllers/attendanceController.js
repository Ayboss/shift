const { DateTime } = require("luxon");
const { Attendance, ShiftType, Shift, Staff } = require("../models");
const AppError = require("../util/appError");
const catchError = require("../util/catchError");
const {
  createAttendanceToken,
  verifyAttendanceToken,
} = require("../util/createJWTToken");
const QRCode = require("qrcode");

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
    include: [
      {
        model: Staff,
        as: "staff",
        attributes: [
          "fullName",
          "phoneNumber",
          "image",
          "isImageMemoji",
          "email",
        ],
      },
    ],
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
  const nowInCompanyTZ = DateTime.now().setZone(company.timezone);
  const nowUTC = nowInCompanyTZ.toUTC();
  const day = nowInCompanyTZ.toISODate();

  const shiftTypes = await ShiftType.findAll({
    where: { companyId: company.id },
    raw: true,
  });

  let attendanceShiftType = null;
  let expiresAt = 0;
  for (const st of shiftTypes) {
    let start = DateTime.fromISO(`${day}T${st.startTime}`, {
      zone: company.timezone,
    }).minus({ minutes: 30 });

    let end = DateTime.fromISO(`${day}T${st.endTime}`, {
      zone: company.timezone,
    }).minus({ minutes: 30 });

    start = start.toUTC();
    end = end.toUTC();

    // console.log(start, end, nowUTC, day, "TIME START");
    // console.log(st);
    if (nowUTC >= start && nowUTC <= end) {
      attendanceShiftType = st;
      expiresAt = end;
      break;
    }
  }
  if (!attendanceShiftType) {
    return next(new AppError("It is not work time yet", 400));
  }

  const ttlMs = expiresAt.toMillis() - nowUTC.toMillis();

  const token = createAttendanceToken(
    {
      type: attendanceShiftType.name,
      day,
      companyId: company.id,
    },
    ttlMs,
  );
  // console.log(token);
  const qrcodeurl = await QRCode.toDataURL(token);

  return res.status(200).json({
    status: "success",
    message: `Attendance for ${attendanceShiftType.name}`,
    data: { url: qrcodeurl, expiresAt: expiresAt.toISO() },
  });
});

exports.markAttendace = catchError(async (req, res, next) => {
  // validate token and mark attendance, check if there is a shift at that time, and mark attendance
  const staff = req.user;
  // 1️⃣ Get company timezone
  const companyTimezone = staff.company.timezone;

  // 2️⃣ Current time in company timezone
  const nowInCompanyTZ = DateTime.now().setZone(companyTimezone);

  // Convert to UTC for consistent comparisons / DB storage
  const nowUTC = nowInCompanyTZ.toUTC();

  const attedanceToken = req.body.attedanceToken;
  const payload = await verifyAttendanceToken(attedanceToken);
  // check if the attendance belongs to the  company
  if (payload.companyId !== staff.companyId) {
    return next(new AppError("Staff does not belong to this company", 400));
  }
  // 4️⃣ Check expiration safely
  const expiresAtUTC = DateTime.fromISO(payload.expiresAt, { zone: "utc" });
  // check the time
  if (nowUTC > expiresAtUTC) {
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
      time: nowUTC.toJSDate(),
    },
  });
  if (!created) {
    return next(new AppError("Attendance already recorded.", 400));
  }
  res.status(200).json({ status: "success", data: attendance });
});
