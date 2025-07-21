const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");

class Attendance extends Model {}

Attendance.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    staffId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "staffs",
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "morning",
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "attendances",
    timestamps: true,
  }
);

module.exports = Attendance;
