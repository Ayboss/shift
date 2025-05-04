const associateModels = (models) => {
  const {
    Circle,
    Company,
    Offer,
    Shift,
    ShiftType,
    Staff,
    Swap,
    Notification,
  } = models;
  // Define relationships
  // COMPANIES
  Company.hasMany(ShiftType, { foreignKey: "companyId", as: "shiftTypes" });
  Company.hasMany(Notification, {
    foreignKey: "companyId",
    as: "notifications",
  });
  Company.hasMany(Staff, { foreignKey: "companyId", as: "staff" });

  //   STAFFS
  Staff.hasMany(Circle, { foreignKey: "staffId", as: "circles" });
  Staff.hasMany(Circle, { foreignKey: "memberId", as: "memberCircles" });
  Staff.hasMany(Shift, { foreignKey: "staffId", as: "shifts" });
  Staff.hasMany(Notification, { foreignKey: "staffId", as: "notifications" });
  Staff.belongsTo(Company, { foreignKey: "companyId", as: "company" });
  Staff.hasMany(Swap, { as: "swaps", foreignKey: "staffId" });
  Staff.hasMany(Offer, { as: "offers", foreignKey: "staffId" });

  // SHIFTS
  Shift.belongsTo(Staff, { foreignKey: "staffId", as: "staff" });
  Shift.hasMany(Offer, { foreignKey: "shiftId" });
  Shift.hasMany(Swap, { foreignKey: "shiftId" });

  // CIRCLE
  Circle.belongsTo(Staff, { foreignKey: "staffId", as: "staff" });
  Circle.belongsTo(Staff, { foreignKey: "memberId", as: "member" });

  //   OFFER
  Offer.belongsTo(Staff, { as: "staff", foreignKey: "staffId" });
  Offer.belongsTo(Staff, { as: "claimer", foreignKey: "claimerId" });
  Offer.belongsTo(Shift, { as: "shift", foreignKey: "shiftId" });

  // SWAPS
  Swap.belongsTo(Staff, { as: "staff", foreignKey: "staffId" });
  Swap.belongsTo(Staff, { as: "claimer", foreignKey: "claimerId" });
  Swap.belongsTo(Shift, { as: "staffShift", foreignKey: "shiftId" });
  Swap.belongsTo(Shift, { as: "claimerShift", foreignKey: "claimerShiftId" });
  Swap.belongsTo(Shift, { foreignKey: "shiftId" });

  // SHIFTTYPE
  ShiftType.belongsTo(Company, { foreignKey: "companyId", as: "company" });

  // NOTIFICATION
  Notification.belongsTo(Staff, { foreignKey: "staffId", as: "staff" });
  Notification.belongsTo(Company, { foreignKey: "companyId", as: "company" });
};

module.exports = associateModels;
