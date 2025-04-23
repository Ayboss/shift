const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const Staff = require("./staffModel");
const Company = require("./companyModel");

class Notification extends Model {}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    staffId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Staff,
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
    title: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    notifType: {
      allowNull: false,
      type: DataTypes.ENUM("SWAP", "OFFER", "REMINDER", "GENERAL", "SPECIAL"),
      defaultValue: "GENERAL",
      validate: {
        notEmpty: true,
      },
    },
    redirectId: {
      allowNull: true,
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    sequelize,
    tableName: "notifications",
    timestamps: true,
  }
);

Notification.belongsTo(Staff, { foreignKey: "staffId", as: "staff" });
Notification.belongsTo(Company, { foreignKey: "companyId", as: "company" });
Staff.hasMany(Notification, { foreignKey: "staffId", as: "notifications" });
Company.hasMany(Notification, { foreignKey: "companyId", as: "notifications" });

module.exports = Notification;
