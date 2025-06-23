const EventListener = require("node:events");
const status = require("../util/statusType");
const { Notification, Circle, Company, Staff } = require("../models");
const notificationType = require("../util/notificationType");
const { createExpoMessage, sendExpoMessage } = require("../util/expoPush");

const notificationEvent = "notificationEvent";

const eventListener = new EventListener();

eventListener.on(notificationEvent, async (data) => {
  // would be to insert into the notification db.
  try {
    await Notification.create(data);
  } catch (err) {
    // eventListener.emit(notificationEvent, data);
  }
});

exports.notifyShiftDocumentUploaded = async (companyId) => {
  const staffs = await Staff.findAll({ where: { companyId: companyId } });
  const title = "New Shift Schedule Uploaded";
  const desc =
    "Your manager updated the schedule, check your calendar for changes";
  const messages = [];
  for (let staff of staffs) {
    eventListener.emit(notificationEvent, {
      notifType: notificationType.GENERAL,
      title: title,
      description: desc,
      staffId: staff.id,
      companyId: staff.companyId,
      redirectId: null,
    });

    const message = createExpoMessage(
      staff.messageToken,
      title,
      desc,
      null,
      null
    );
    if (message) {
      messages.push(message);
    }
  }
  sendExpoMessage(messages);
};

exports.notifySpecialCondition = (data) => {
  // do some computation and add to the data
  eventListener.emit(notificationEvent, {
    title: "New Shift has been updated",
    description: data.description,
    notifType: "SPECIAL",
    companyId: data.id,
  });
};

exports.notifySwapAdminAcepted = (data) => {
  // do some computation and add to the data
  eventListener.emit(notificationEvent, {
    title: "New Shift has been updated",
    description: data.description,
    notifType: "SPECIAL",
    companyId: data.id,
  });
};
exports.notifySwapAdminDeclined = (data) => {
  // do some computation and add to the data
  eventListener.emit(notificationEvent, {
    title: "New Shift has been updated",
    description: data.description,
    notifType: "SPECIAL",
    companyId: data.id,
  });
};

exports.notifyOfferToCircle = async (staff, offerid) => {
  const circles = await Circle.findAll({ where: { memberId: staff.id } });
  const title = "New Offer has been created";
  const body = `Hey a member of your circle ${staff.fullName}, just created a shift Offer`;
  const messages = [];
  circles.forEach((circle) => {
    // do some computation and add to the staff
    eventListener.emit(notificationEvent, {
      notifType: "OFFER",
      title: title,
      description: body,
      staffId: circle.staffId,
      companyId: staff.companyId,
      redirectId: offerid,
    });

    const message = createExpoMessage(
      circle.staff.messageToken,
      title,
      desc,
      null,
      offerid
    );
    if (message) {
      messages.push(message);
    }
  });
  sendExpoMessage(messages);
};

exports.notifyOfferIsClaimed = async (staff, offer) => {
  // offer has been cliamed,
  // you claimed this offer
  const title = "Offer claimed";
  const body = `${staff.fullName} has claimed your offer for the ${offer.shift.date}`;

  eventListener.emit(notificationEvent, {
    notifType: "OFFER",
    title: title,
    description: body,
    staffId: offer.staffId,
    companyId: staff.companyId,
    redirectId: offer.id,
  });

  const message = createExpoMessage(
    staff.messageToken,
    title,
    body,
    null,
    redirectId
  );
  createExpoMessage([message]);
};

exports.notifyOfferUpdatedByCompany = (offer, statusval) => {
  // For the owner of the offer
  const title =
    statusval == status.ACCEPTED
      ? "Offer Accepted by company"
      : "Offer Declined by company";
  const description =
    statusval == status.ACCEPTED
      ? `Admin has succesfully approved your offer for ${offer.shift.date}`
      : "Your request to make an offer has been declined";
  eventListener.emit(notificationEvent, {
    notifType: "OFFER",
    title: title,
    description: description,
    staffId: offer.staffId,
    companyId: offer.companyId,
    redirectId: offer.id,
  });

  // for claimer of the offer
  eventListener.emit(notificationEvent, {
    notifType: "OFFER",
    title: title,
    description: description,
    staffId: offer.claimerId,
    companyId: offer.companyId,
    redirectId: offer.id,
  });

  // const message = createExpoMessage(
  //   offer.staffId.messageToken,
  //   title,
  //   description,
  //   null,
  //   offer.id
  // );
  // const message2 = createExpoMessage(
  //   offer.claimerId.messageToken,
  //   title,
  //   description,
  //   null,
  //   offer.id
  // );
  // createExpoMessage([message, message2]);
};

exports.notifySwapCreated = (swap, staffname) => {
  // do some computation and add to the data
  eventListener.emit(notificationEvent, {
    notifType: notificationType.SWAP,
    title: "Swap Created",
    description: `${staffname} wants to swap your shift with you`,
    staffId: swap.claimerId,
    companyId: swap.companyId,
    redirectId: swap.id,
  });
};

exports.notifySwapAccepted = (swap) => {
  // do some computation and add to the data
  eventListener.emit(notificationEvent, {
    notifType: notificationType.SWAP,
    title: "Swap Accepted",
    description: `${swap.claimer.fullName} offered to swap shift with you for ${swap.claimerShift.date}`,
    staffId: swap.staffId,
    companyId: swap.companyId,
    redirectId: swap.id,
  });
  console.log("notify  swap has been accepted");
};

exports.notifySwapAcceptedByCompany = (swap, statusval) => {
  let message = statusval == status.ACCEPTED ? "approved" : "declined";
  eventListener.emit(notificationEvent, {
    notifType: notificationType.SWAP,
    title: `Swap ${message}`,
    description: `Your company has ${message} your swap shift with ${swap.claimer.fullName} for ${swap.claimerShift.date}`,
    staffId: swap.staffId,
    companyId: swap.companyId,
    redirectId: swap.id,
  });
  eventListener.emit(notificationEvent, {
    notifType: notificationType.SWAP,
    title: "Swap Accepted",
    description: `Your company has ${message} your swap shift with ${swap.staff.fullName} for ${swap.claimerShift.date}`,
    staffId: swap.claimerId,
    companyId: swap.companyId,
    redirectId: swap.id,
  });
  console.log("notify  swap has been accepted bu company");
};

exports.notifySwapDeclined = (swap) => {
  // do some computation and add to the data
  eventListener.emit(notificationEvent, {
    notifType: notificationType.SWAP,
    title: "Swap Declined",
    description: `${swap.claimer.fullName} declined to swap shift with you for ${swap.claimerShift.date}`,
    staffId: swap.staffId,
    companyId: swap.companyId,
    redirectId: swap.id,
  });
  console.log("notify  swap has been declined");
};

exports.notifySwapDeleted = (data) => {
  // do some computation and add to the data
  console.log("notify  swap has been deleted");
};
