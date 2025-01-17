const { authJwt } = require("../middleware");
const controller = require("../controller/settings.controller");
const authController = require("../controller/auth.controller");

module.exports = function (app) {
  app.post(
    "/api/settings/set/multiple",
    [authJwt.verifyToken, authController.checkUserIdExists],
    controller.updateMultiple
  );

  app.get(
    "/api/settings/get/all",
    [authJwt.verifyToken, authController.checkUserIdExists],
    controller.getAll
  );
};
