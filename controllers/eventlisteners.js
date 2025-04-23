const EventListener = require("node:events");
const Notification = require("../models/notificationModel");
const Circle = require("../models/circleModel");
const status = require("../util/statusType");

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

exports.notifyShiftDocumentUploaded = (data) => {
  // do some computation and add to the data
  eventListener.emit(notificationEvent, {
    title: "New Shift has been uploaded",
    description:
      "This is a new shift, please check your shift and if you have any issue , let your admin know please",
    notifType: "GENERAL",
    companyId: data.id,
  });
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
  // notify user has created offer
  eventListener.emit(notificationEvent, {
    notifType: "OFFER",
    title: "New Offer has been created",
    description: `You Just created an offer`,
    staffId: staff.id,
    companyId: staff.companyId,
    redirectId: offerid,
  });

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
    description: `Your Offer has been claimed by ${staff.fullName}`,
    staffId: offer.staffId,
    companyId: staff.companyId,
    redirectId: offer.id,
  });
  eventListener.emit(notificationEvent, {
    notifType: "OFFER",
    title: "Offer claimed",
    description: `You just claimed an Offer`,
    staffId: staff.id,
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
      ? "Your offer has been successfully transfered"
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

exports.notifySwapCreated = (data) => {
  // do some computation and add to the data
  console.log("notify that swap has been created");
};

exports.notifySwapAccepted = (data) => {
  // do some computation and add to the data
  console.log("notify  swap has been accepted");
};

exports.notifySwapDeclined = (data) => {
  // do some computation and add to the data
  console.log("notify  swap has been declined");
};

exports.notifySwapDeleted = (data) => {
  // do some computation and add to the data
  console.log("notify  swap has been deleted");
};
