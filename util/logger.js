const info = (data) => {
  console.info("⚠️", data);
};

const error = (data) => {
  console.error("‼️", data);
};

const logger = { info, error };

module.exports = logger;
