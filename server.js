require("dotenv").config();
// const cron = require("node-cron");
const logger = require("./util/logger");
const app = require("./app");
// const { Company } = require("./models");
require("./database/create_table").init();

const PORT = process.env.PORT || 3333;
const server = app.listen(PORT, () => {
  console.log("server listening on port " + PORT);
});

// async function queryDatabse() {
//   await Company.findOne({});
// }
// cron.schedule("0 0 * * *", () => {
//   queryDatabse();
// });

// cron.schedule("*/14 * * * *", () => {
//   fetch("https://shift-yuw6.onrender.com/test")
//     .then((response) => response.json())
//     .then((res) => {
//       console.log(res);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

process.on("unhandledRejection", (err) => {
  logger.error(err, "Unhandled Rejection! Shutting down ❌");
  server.close(() => {
    process.exit();
  });
});

process.on("SIGTERM", () => {
  logger.error("SIGTERM received. shutting down gracefully");
  server.close(() => {
    console.log("process terminated");
  });
});
