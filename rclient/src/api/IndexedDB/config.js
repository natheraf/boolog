const { getCurrentUser } = require("./Users");

module.exports = {
  userDB: getCurrentUser(),
  userDBVersion: 1,
  appDataDBVersion: 1,
};
