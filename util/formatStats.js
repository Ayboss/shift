const status = require("./statusType");

exports.formatStats = (stats) => {
  const statsMap = Object.fromEntries(stats.map((s) => [s.status, s.count]));

  newstat = {};
  Object.values(status).forEach((s) => (newstat[s] = statsMap[s] || 0));
  return newstat;
};
