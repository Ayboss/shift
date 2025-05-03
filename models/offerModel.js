const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const Staff = require("./staffModel");
const Company = require("./companyModel");
const Shift = require("./shiftModel");
const status = require("../util/statusType");

class Offer extends Model {}

Offer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    shiftId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Shift,
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
    staffId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Staff,
        key: "id",
      },
    },
    details: {
      type: DataTypes.STRING,
    },
    reason: {
      type: DataTypes.STRING,
    },
    status: {
      allowNull: false,
      type: DataTypes.ENUM(
        status.OPEN,
        status.IN_REVIEW,
        status.ACCEPTED,
        status.DECLINED
      ),
      defaultValue: status.OPEN,
    },
    claimerId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Staff,
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "offers",
    timestamps: true,
  }
);

Offer.belongsTo(Staff, { as: "staff", foreignKey: "staffId" });
Offer.belongsTo(Staff, { as: "claimer", foreignKey: "claimerId" });
Staff.hasMany(Offer, { as: "offers", foreignKey: "staffId" });

module.exports = Offer;
