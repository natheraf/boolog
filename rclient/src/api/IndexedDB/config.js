const { getCurrentUser } = require("./Users");

module.exports = {
  user: getCurrentUser(),
  userDBVersion: 1,
  appDataDBVersion: 1,
};
