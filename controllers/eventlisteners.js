const EventListener = require("node:events");
const Notification = require("../models/notificationModel");

const eventListener = new EventListener();

eventListener.on("notificationEvent", async (data) => {
  // would be to insert into the notification db.
  try {
    await Notification.create(data);
  } catch (err) {
    eventListener.emit("notificationEvent", data);
  }
});

exports.notifyShiftDocumentUploaded = (data) => {
  // do some computation and add to the data
  eventListener.emit(Notification, {
    title: "New Shift has been uploaded",
    description:
      "This is a new shift, please check your shift and if you have any issue , let your admin know please",
    notifType: "GENERAL",
    companyId: data.id,
  });
};
exports.notifySpecialCondition = (data) => {
  // do some computation and add to the data
  eventListener.emit(Notification, {
    title: "New Shift has been updated",
    description: data.description,
    notifType: "SPECIAL",
    companyId: data.id,
  });
};
exports.notifySwapMade = (data) => {
  // do some computation and add to the data
  eventListener.emit(Notification, {
    title: "New Shift has been updated",
    description: data.description,
    notifType: "SPECIAL",
    companyId: data.id,
  });
};
exports.notifySwapAccepted = (data) => {
  // do some computation and add to the data
  eventListener.emit(Notification, {
    title: "New Shift has been updated",
    description: data.description,
    notifType: "SPECIAL",
    companyId: data.id,
  });
};
exports.notifySwapDeclined = (data) => {
  // do some computation and add to the data
  eventListener.emit(Notification, {
    title: "New Shift has been updated",
    description: data.description,
    notifType: "SPECIAL",
    companyId: data.id,
  });
};

exports.notifySwapAdminAcepted = (data) => {
  // do some computation and add to the data
  eventListener.emit(Notification, {
    title: "New Shift has been updated",
    description: data.description,
    notifType: "SPECIAL",
    companyId: data.id,
  });
};
exports.notifySwapAdminDeclined = (data) => {
  // do some computation and add to the data
  eventListener.emit(Notification, {
    title: "New Shift has been updated",
    description: data.description,
    notifType: "SPECIAL",
    companyId: data.id,
  });
};

exports.notifyOfferToCircle = (data) => {
  // do some computation and add to the data
  eventListener.emit(Notification, {
    title: "New Shift has been updated",
    description: data.description,
    notifType: "SPECIAL",
    companyId: data.id,
  });
};
