const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");

class WaitList extends Model {}

WaitList.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "waitlists",
    timestamps: true,
  }
);

module.exports = WaitList;
