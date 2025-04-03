const Circle = require("../models/circleModel");
const Company = require("../models/companyModel");
const Notification = require("../models/notificationModel");
const Offer = require("../models/offerModel");
const Shift = require("../models/shiftModel");
const Staff = require("../models/staffModel");
const Swap = require("../models/swapModel");
const logger = require("../util/logger");
const create_company_table = () => {
  Company.sync({ force: false })
    .then(() => {
      logger.info("company created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("company not created");
    });
};

const create_staff_table = () => {
  Staff.sync({ force: false })
    .then(() => {
      logger.info("staff created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("staff not created");
    });
};

const create_shift_table = () => {
  Shift.sync({ force: false })
    .then(() => {
      logger.info("Shift created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("staff not created");
    });
};

const create_offer_table = () => {
  Offer.sync({ force: false })
    .then(() => {
      logger.info("offers created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("offers not created");
    });
};

const create_swap_table = () => {
  Swap.sync({ force: false })
    .then(() => {
      logger.info("Swap created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("Swap not created");
    });
};
const create_circle_table = () => {
  Circle.sync({ force: false })
    .then(() => {
      logger.info("Circle created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("Circle not created");
    });
};
const create_notification_table = () => {
  Notification.sync({ force: false })
    .then(() => {
      logger.info("Notification created");
    })
    .catch((err) => {
      console.log(err);
      logger.error("Notification not created");
    });
};

exports.init = function () {
  create_company_table();
  create_staff_table();
  create_shift_table();
  create_offer_table();
  create_swap_table();
  create_circle_table();
  create_notification_table();
};
