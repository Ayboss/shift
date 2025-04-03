const Sequelize = require("sequelize");

// Initialize Sequelize (Modify credentials as needed)

const DB_name = process.env.ENV == "production" ? process.env.DB_NAME : "shft";
const DB_host =
  process.env.ENV == "production" ? process.env.DB_HOST : "localhost";
const DB_user =
  process.env.ENV == "production" ? process.env.DB_USERNAME : "root";
const DB_password =
  process.env.ENV == "production"
    ? process.env.DB_PASSWORD
    : "dudeYouHaveNoIdea";

const sequelize = new Sequelize(DB_name, DB_user, DB_password, {
  host: DB_host,
  dialect: "mysql",
  logging: false, // Set to true if you want to see SQL queries in the console
});

console.log(DB_host, "HOST ⚠️⚠️");
sequelize
  .authenticate()
  .then(() => console.log("Connected to MySQL database! 🚀", DB_host))
  .catch((err) => console.error("Connection failed:", err));

module.exports = sequelize;
