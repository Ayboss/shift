const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const generateUniqueEntityId = require("../util/generateUniqueEntityId");
const Staff = require("./staffModel");

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
      allowNull: false,
      references: {
        model: Staff,
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
      type: DataTypes.ENUM("SWAP", "OFFER", "REMINDER", "GENERAL"),
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
Staff.hasMany(Notification, { foreignKey: "staffId", as: "notifications" });

module.exports = Notification;
