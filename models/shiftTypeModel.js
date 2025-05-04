// models/ShiftType.js
const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");

class ShiftType extends Model {}

ShiftType.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "companies",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // e.g., "Morning", "Afternoon",
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
    indexes: [
      {
        unique: true,
        fields: ["name", "companyId"],
        name: "unique_name_per_company",
      },
    ],
  }
);

module.exports = ShiftType;
