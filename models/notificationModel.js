const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");

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

module.exports = Notification;
