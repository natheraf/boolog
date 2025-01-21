const { getCurrentUser } = require("./State");

module.exports = {
  user: getCurrentUser(),
  userDBVersion: 1,
  appDataDBVersion: 1,
};
