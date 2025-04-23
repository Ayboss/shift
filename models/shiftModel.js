const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const Staff = require("./staffModel");
const Company = require("./companyModel");

class Shift extends Model {}

Shift.init(
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
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    details: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "morning",
    },
  },
  {
    sequelize,
    tableName: "shifts",
    timestamps: true,
  }
);

Shift.belongsTo(Staff, { foreignKey: "staffId", as: "staff" });
Staff.hasMany(Shift, { foreignKey: "staffId", as: "shifts" });

module.exports = Shift;
