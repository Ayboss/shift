const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const generateUniqueEntityId = require("../util/generateUniqueEntityId");
const subscriptionState = require("../util/subscriptionState");
const { subscriptionType } = require("../util/subscriptionType");

class Subscription extends Model {}

Subscription.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },

    companyId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    plan: {
      type: DataTypes.ENUM(
        subscriptionType.STARTER,
        subscriptionType.GROWTH,
        subscriptionType.SCALE,
        subscriptionType.ENTERPRISE,
      ),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        subscriptionState.ACTIVE,
        subscriptionState.INACTIVE,
        subscriptionState.CANCELLED,
        subscriptionState.EXPIRED,
        subscriptionState.PENDING,
      ),
      defaultValue: subscriptionState.PENDING,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    currency: {
      type: DataTypes.STRING,
      defaultValue: "USD",
    },

    paypalOrderId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    paypalCaptureId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    autoRenew: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "subscriptions",
    timestamps: true,
    hooks: {
      beforeCreate: async (subscription) => {
        subscription.id = await generateUniqueEntityId("SUB", Subscription);
      },
    },
  },
);

module.exports = Subscription;
