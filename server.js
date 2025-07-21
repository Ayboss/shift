require("dotenv").config();
const logger = require("./util/logger");
const app = require("./app");
require("./database/create_table").init();

const PORT = process.env.PORT || 3333;
const server = app.listen(PORT, () => {
  console.log("server listening on port " + PORT);
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection! Shutting down ❌");
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
