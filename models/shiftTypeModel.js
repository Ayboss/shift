// models/ShiftType.js
const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const Company = require("./companyModel");

class ShiftType extends Model {}

ShiftType.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Company,
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // e.g., "Morning", "Afternoon"
    },
    startTime: {
      type: DataTypes.TIME, // Just the time part
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "shift_types",
    timestamps: true,
  }
);

// Optional: association
Company.hasMany(ShiftType, { foreignKey: "companyId", as: "shiftTypes" });
ShiftType.belongsTo(Company, { foreignKey: "companyId", as: "company" });

module.exports = ShiftType;
