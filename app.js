const express = require("express");
const cors = require("cors");
const errorController = require("./controllers/errorController");
const routers = require("./router/index");
// adding all event listener
require("./controllers/eventlisteners");

app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/test", (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: {
      name: "ayobami",
      email: "bamiayo90@gmail.com",
    },
  });
});
app.use("/api/v1/admin", routers.adminRouter);
app.use("/api/v1/company", routers.companyRouter);
app.use("/api/v1/staff", routers.staffRouter);
app.use("/api/v1/shift", routers.shiftRouter);
app.use("/api/v1/offer", routers.offerRouter);
app.use("/api/v1/swap", routers.swapRouter);
app.use("/api/v1/circle", routers.circleRouter);
app.use("/api/v1/notification", routers.notificationRouter);
app.use("/api/v1/shifttype", routers.shiftTypeRouter);

app.use(errorController);

module.exports = app;
