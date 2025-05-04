const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database/database");
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
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isImageMemoji: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    companyId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: "companies",
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
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
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
      attributes: {
        exclude: ["password", "passwordResetToken", "passwordResetExpires"],
      },
    },
    scopes: {
      withPassword: {
        attributes: {
          include: ["password", "passwordResetToken", "passwordResetExpires"],
        },
      },
    },
  }
);

module.exports = Staff;
