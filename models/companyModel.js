const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const generateUniqueEntityId = require("../util/generateUniqueEntityId");

class Company extends Model {}

const getTime = (hours, minutes = 0) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0); // Set hours, minutes, seconds, and milliseconds
  return date;
};

Company.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    companyEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
      unique: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numberOfStaffs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 }, // Ensures at least 1 staff member
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    morningShiftStart: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: getTime(8, 0),
    },
    morningShiftEnd: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: getTime(12, 0),
    },
    eveningShiftStart: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: getTime(16, 0),
    },
    eveningShiftEnd: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: getTime(20, 0),
    },
  },
  {
    sequelize,
    tableName: "companies",
    timestamps: true,
    hooks: {
      beforeCreate: async (company) => {
        company.id = await generateUniqueEntityId("CMP", Company);
      },
    },
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    scopes: {
      withPassword: { attributes: { include: ["password"] } },
    },
  }
);

module.exports = Company;
