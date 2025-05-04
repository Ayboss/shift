const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const status = require("../util/statusType");

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
        model: "shifts",
        key: "id",
      },
    },
    companyId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "companies",
        key: "id",
      },
    },
    staffId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "staffs",
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
        model: "staffs",
        key: "id",
      },
    },
    claimerShiftId: {
      type: DataTypes.UUID,
      allowNull: true,
      unique: false,
      references: {
        model: "shifts",
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

module.exports = Swap;
