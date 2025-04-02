const bcrypt = require("bcryptjs");

exports.hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 12);
  } catch (err) {
    console.log(err);
  }
};

exports.comparePassword = async (checkPassword, userPassword) => {
  try {
    return await bcrypt.compare(checkPassword, userPassword);
  } catch (err) {
    console.log(err);
  }
};
