const { where } = require("sequelize");
const { Company } = require("../models");
const catchError = require("../util/catchError");
const axios = require("axios");
const subscriptionType = require("../util/subscriptionType");
const AppError = require("../util/appError");

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
    }
  );
  return data.access_token;
}

exports.createOrder = catchError(async (req, res, next) => {
  try {
    const company = req.user;
    if (company.subscription == subscriptionType.ACTIVE) {
      return next(
        new AppError("This user already has an active subscription", 400)
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
              value: "30.00",
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    await Company.update(
      { subscriptionOrderId: data.id },
      { where: { id: company.id } }
    );

    res.json({ orderID: data.id });
  } catch (err) {
    console.log(err.response.data);
    return res.status(400).send("ERROR");
  }
});

exports.captureOrder = catchError(async (req, res, next) => {
  try {
    const company = req.user;
    const token = await getAccessToken();
    const { orderId } = req.params;

    const { data } = await axios.post(
      `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (company.subscriptionOrderId == orderId) {
      await company.update({
        subscription: subscriptionType.ACTIVE,
      });
    }
    res.json(data);
  } catch (err) {
    console.log(err.response.data);
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
      }
    );

    res.json(data);
  } catch (err) {
    console.log(err.response.data);
    return res.status("400").send("ERROR");
  }
});
