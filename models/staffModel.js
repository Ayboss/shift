const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
const Company = require("./companyModel"); // Import Company model
const generateUniqueEntityId = require("../util/generateUniqueEntityId");
class Staff extends Model {}

Staff.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    companyId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: Company,
        key: "id",
      },
      onDelete: "SET NULL",
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    blocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "staffs",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["email", "companyId"],
        name: "unique_email_per_company",
      },
    ],
    hooks: {
      beforeCreate: async (staff) => {
        staff.id = await generateUniqueEntityId("SHFT", Staff);
        const existingStaff = await Staff.findOne({
          where: { email: staff.email, companyId: staff.companyId },
        });
        if (existingStaff) {
          throw new Error(
            "A staff member with this email already exists in the company."
          );
        }
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

Company.hasMany(Staff, { foreignKey: "companyId", as: "staff" });
Staff.belongsTo(Company, { foreignKey: "companyId", as: "company" });

module.exports = Staff;
