const { WaitList } = require("../models");
const Admin = require("../models/adminModel");
const Attendance = require("../models/attendanceModel");
const Circle = require("../models/circleModel");
const Company = require("../models/companyModel");
const Notification = require("../models/notificationModel");
const Offer = require("../models/offerModel");
const Shift = require("../models/shiftModel");
const ShiftType = require("../models/shiftTypeModel");
const Staff = require("../models/staffModel");
const Swap = require("../models/swapModel");
const logger = require("../util/logger");
const sequelize = require("./database");

const create_waitlist_table = () => {
  WaitList.sync({ alter: true })
    .then(() => {
      logger.info("Waitlist created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("Waitlist not created");
    });
};

const create_admin_table = () => {
  Admin.sync({ alter: true })
    .then(() => {
      logger.info("Admin created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("company not created");
    });
};

const create_company_table = () => {
  Company.sync({ alter: true })
    .then(() => {
      logger.info("company created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("company not created");
    });
};

const create_staff_table = () => {
  Staff.sync({ alter: true })
    .then(() => {
      logger.info("staff created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("staff not created");
    });
};

const create_shift_table = () => {
  Shift.sync({ alter: true })
    .then(() => {
      logger.info("Shift created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("staff not created");
    });
};

const create_offer_table = () => {
  Offer.sync({ alter: true })
    .then(() => {
      logger.info("offers created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("offers not created");
    });
};

const create_swap_table = () => {
  Swap.sync({ alter: true })
    .then(() => {
      logger.info("Swap created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("Swap not created");
    });
};
const create_circle_table = () => {
  Circle.sync({ alter: true })
    .then(() => {
      logger.info("Circle created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("Circle not created");
    });
};
const create_notification_table = () => {
  Notification.sync({ alter: true })
    .then(() => {
      logger.info("Notification created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("Notification not created");
    });
};
const create_shifttype_table = () => {
  ShiftType.sync({ alter: true })
    .then(() => {
      logger.info("shifttype created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("shifttype not created");
    });
};

const create_attendance_table = () => {
  Attendance.sync({ alter: true })
    .then(() => {
      logger.info("attendance created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("attendance not created");
    });
};

const runRawSQLQueries = async () => {
  try {
    await sequelize.query(`ALTER TABLE staffs DROP INDEX email;`);
    console.log("Successfully dropped fullName unique index");
  } catch (error) {
    console.error("Failed to drop fullName unique index:", error);
  }
};

// create_notification_table();
// create_staff_table();
exports.init = function () {
  // create_admin_table();
  // create_company_table();
  // create_staff_table();
  // create_shift_table();
  // create_offer_table();
  // create_swap_table();
  // create_circle_table();
  // create_notification_table();
  // create_shifttype_table();
  // runRawSQLQueries();
  // create_waitlist_table();
  create_attendance_table();
};
