const { where } = require("sequelize");
const { Company, Subscription } = require("../models");
const catchError = require("../util/catchError");
const axios = require("axios");
const subscriptionState = require("../util/subscriptionState");
const AppError = require("../util/appError");
const {
  subscriptionType,
  subscriptionTypePrice,
} = require("../util/subscriptionType");

const PAYPAL_BASE =
  process.env.ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const PAYPAL_CLIENT_ID =
  process.env.ENV === "production"
    ? process.env.PAYPAL_CLIENT_ID_LIVE
    : process.env.PAYPAL_CLIENT_ID;

const PAYPAL_SECRET_LIVE =
  process.env.ENV === "production"
    ? process.env.PAYPAL_SECRET_LIVE
    : process.env.PAYPAL_SECRET;

// 1️⃣ Get access token
async function getAccessToken() {
  const { data } = await axios.post(
    `${PAYPAL_BASE}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      auth: {
        username: PAYPAL_CLIENT_ID,
        password: PAYPAL_SECRET_LIVE,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );
  return data.access_token;
}

const addOneMonth = (date) => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + 1);
  return newDate;
};

exports.createOrder = catchError(async (req, res, next) => {
  try {
    let subType = req.body.subscriptionType;
    const company = req.user;
    if (!subType) {
      return next(new AppError("Please privide a subcription type"));
    }
    subType = subType.toUpperCase();
    if (!(subType in subscriptionType)) {
      return next(
        new AppError(
          "Please privide a valid subcription type, STARTER, GROWTH, SCALE, ENTERPRISE",
          400,
        ),
      );
    }

    const existingActive = await Subscription.findOne({
      where: {
        companyId: company.id,
        status: subscriptionState.ACTIVE,
      },
    });

    if (existingActive) {
      return next(
        new AppError("This company already has an active subscription", 400),
      );
    }

    const token = await getAccessToken();

    const { data } = await axios.post(
      `${PAYPAL_BASE}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: subscriptionTypePrice[subType].price,
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const subscription = await Subscription.create({
      companyId: company.id,
      plan: subType,
      price: subscriptionTypePrice[subType].price,
      paypalOrderId: data.id,
      status: subscriptionState.PENDING,
    });
    res.json({ orderID: data.id, subscriptionId: subscription.id });
  } catch (err) {
    console.log(err);
    return res.status(400).send("ERROR");
  }
});

exports.captureOrder = catchError(async (req, res, next) => {
  try {
    const company = req.user;
    const { orderId } = req.params;
    const token = await getAccessToken();

    const { data } = await axios.post(
      `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const subscription = await Subscription.findOne({
      where: {
        companyId: company.id,
        paypalOrderId: orderId,
        status: subscriptionState.PENDING,
      },
    });
    if (!subscription) {
      return next(
        new AppError("Subscription not found or already processed", 404),
      );
    }

    // 🔹 Expire any currently ACTIVE subscription
    await Subscription.update(
      { status: subscriptionState.EXPIRED },
      {
        where: {
          companyId: company.id,
          status: subscriptionState.ACTIVE,
        },
      },
    );

    // 🔹 Activate new subscription
    await subscription.update({
      status: subscriptionState.ACTIVE,
      paypalCaptureId: data.purchase_units[0].payments.captures[0].id,
      startDate: new Date(),
      endDate: addOneMonth(new Date()),
    });

    res.json(data);
  } catch (err) {
    console.log(err);
    return res.status("400").send("ERROR");
  }
});
exports.captureWebhook = catchError(async (req, res, next) => {
  try {
    const token = await getAccessToken();
    const { orderId } = req.params;

    const { data } = await axios.post(
      `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    res.json(data);
  } catch (err) {
    console.log(err.response.data);
    return res.status("400").send("ERROR");
  }
});
