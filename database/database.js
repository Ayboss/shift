const Sequelize = require("sequelize");

// Initialize Sequelize (Modify credentials as needed)
const sequelize = new Sequelize("shft", "root", "dudeYouHaveNoIdea", {
  host: "localhost",
  dialect: "mysql",
  logging: false, // Set to true if you want to see SQL queries in the console
});

sequelize
  .authenticate()
  .then(() => console.log("Connected to MySQL database! 🚀"))
  .catch((err) => console.error("Connection failed:", err));

module.exports = sequelize;
