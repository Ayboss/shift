const express = require("express");
const companyRouter = require("./router/companyRoute");
const staffRouter = require("./router/staffRoute");
const shiftRouter = require("./router/shiftRoute");
const offerRouter = require("./router/offerRoute");
const swapRouter = require("./router/swapRoute");
const circleRouter = require("./router/circleRoute");
const notificationRouter = require("./router/notificationRoute");
const errorController = require("./controllers/errorController");
app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/company", companyRouter);
app.use("/api/v1/staff", staffRouter);
app.use("/api/v1/shift", shiftRouter);
app.use("/api/v1/offer", offerRouter);
app.use("/api/v1/swap", swapRouter);
app.use("/api/v1/circle", circleRouter);
app.use("/api/v1/notification", notificationRouter);

app.use(errorController);

module.exports = app;
