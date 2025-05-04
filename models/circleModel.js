const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const Company = require("./companyModel");
const Staff = require("./staffModel");

class Circle extends Model {}

Circle.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    staffId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Staff,
        key: "id",
      },
    },
    memberId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Staff,
        key: "id",
      },
    },
  },
  { sequelize, tableName: "circles", timestamps: true }
);

module.exports = Circle;
