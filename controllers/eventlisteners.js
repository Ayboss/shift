const EventListener = require("node:events");
const status = require("../util/statusType");
const { Notification, Circle, Company, Staff } = require("../models");
const notificationType = require("../util/notificationType");

const notificationEvent = "notificationEvent";

const eventListener = new EventListener();

eventListener.on(notificationEvent, async (data) => {
  // would be to insert into the notification db.
  try {
    await Notification.create(data);
  } catch (err) {
    eventListener.emit(notificationEvent, data);
  }
});

exports.notifyShiftDocumentUploaded = async (companyId) => {
  const staffs = await Staff.findAll({ where: { companyId: companyId } });

  for (let staff of staffs) {
    eventListener.emit(notificationEvent, {
      notifType: notificationType.GENERAL,
      title: "New Shift Schedule Uploaded",
      description:
        "Your manager updated the schedule, check your calendar for changes",
      staffId: staff.id,
      companyId: staff.companyId,
      redirectId: null,
    });
  }
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
  circles.forEach((circle) => {
    // do some computation and add to the staff
    eventListener.emit(notificationEvent, {
      notifType: "OFFER",
      title: "New Offer has been created",
      description: `Hey a member of your circle ${staff.fullName}, just created a shift Offer`,
      staffId: circle.staffId,
      companyId: staff.companyId,
      redirectId: offerid,
    });
  });
};

exports.notifyOfferIsClaimed = async (staff, offer) => {
  // offer has been cliamed,
  // you claimed this offer
  eventListener.emit(notificationEvent, {
    notifType: "OFFER",
    title: "Offer claimed",
    description: `${staff.fullName} has claimed your offer for the ${offer.shift.date}`,
    staffId: offer.staffId,
    companyId: staff.companyId,
    redirectId: offer.id,
  });
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
