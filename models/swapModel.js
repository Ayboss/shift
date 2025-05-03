const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const Staff = require("./staffModel");
const Company = require("./companyModel");
const status = require("../util/statusType");
const Shift = require("./shiftModel");

class Swap extends Model {}

Swap.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    shiftId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: false,
      references: {
        model: Shift,
        key: "id",
      },
    },
    companyId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Company,
        key: "id",
      },
    },
    staffId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Staff,
        key: "id",
      },
    },
    details: {
      type: DataTypes.STRING,
    },
    reason: {
      type: DataTypes.STRING,
    },
    status: {
      allowNull: false,
      type: DataTypes.ENUM(
        status.OPEN,
        status.IN_REVIEW,
        status.ACCEPTED,
        status.DECLINED
      ),
      defaultValue: status.OPEN,
    },
    claimerId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Staff,
        key: "id",
      },
    },
    claimerShiftId: {
      type: DataTypes.UUID,
      allowNull: true,
      unique: false,
      references: {
        model: Shift,
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "swaps",
    timestamps: true,
  }
);

Swap.belongsTo(Staff, { as: "staff", foreignKey: "staffId" });
Swap.belongsTo(Staff, { as: "claimer", foreignKey: "claimerId" });
Swap.belongsTo(Shift, { as: "staffShift", foreignKey: "shiftId" });
Swap.belongsTo(Shift, { as: "claimerShift", foreignKey: "claimerShiftId" });
Staff.hasMany(Swap, { as: "swaps", foreignKey: "staffId" });

module.exports = Swap;
