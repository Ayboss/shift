const { promisify } = require("util");
const jwt = require("jsonwebtoken");

exports.createJWTToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.createAttendanceToken = (data, ttlMs) => {
  const expiresInSeconds = Math.floor(ttlMs / 1000);
  return jwt.sign(
    { ...data, expiresAt: Date.now() + ttlMs },
    process.env.JWT_ATTENDANCE_TOKEN,
    {
      expiresIn: expiresInSeconds,
      // noTimestamp: false,
    }
  );
};

exports.verifyAttendanceToken = (token) => {
  return promisify(jwt.verify)(token, process.env.JWT_ATTENDANCE_TOKEN);
};

// module.exports = createJWTToken;
