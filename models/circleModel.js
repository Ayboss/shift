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

// Define relationships
Circle.belongsTo(Staff, { foreignKey: "staffId", as: "staff" });
Circle.belongsTo(Staff, { foreignKey: "memberId", as: "member" });
Staff.hasMany(Circle, { foreignKey: "staffId", as: "circles" });
Staff.hasMany(Circle, { foreignKey: "memberId", as: "memberCircles" });

module.exports = Circle;
