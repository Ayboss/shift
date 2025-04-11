const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const generateUniqueEntityId = require("../util/generateUniqueEntityId");

class Admin extends Model {}

Admin.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "admins",
    timestamps: true,
    hooks: {
      beforeCreate: async (admin) => {
        admin.id = await generateUniqueEntityId("ADMIN", Admin);
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

module.exports = Admin;
