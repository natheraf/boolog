const { authJwt } = require("../middleware");
const controller = require("../controller/lists.controller");
const authController = require("../controller/auth.controller");

module.exports = function (app) {
  app.post(
    "/api/lists/put/multiple",
    [
      authJwt.verifyToken,
      authController.checkUserIdExists,
      authController.updateLastWritten,
    ],
    controller.putMultiple
  );

  app.get(
    "/api/lists/get/all",
    [authJwt.verifyToken, authController.checkUserIdExists],
    controller.getAll
  );

  app.get(
    "/api/lists/get/multiple",
    [authJwt.verifyToken, authController.checkUserIdExists],
    controller.getMultiple
  );
};
