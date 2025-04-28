const { authJwt } = require("../middleware");
const controller = require("../controller/generic.controller");
const authController = require("../controller/auth.controller");
const generic = require("../middleware/generic");

module.exports = function (app) {
  app.post(
    "/api/settings/set/multiple",
    [
      authJwt.verifyToken,
      authController.checkUserIdExists,
      generic.checkDatabaseAndCollection,
    ],
    controller.updateMultiple
  );

  app.get(
    "/api/settings/get/one",
    [
      authJwt.verifyToken,
      authController.checkUserIdExists,
      generic.checkDatabaseAndCollection,
    ],
    controller.getOne
  );

  app.get(
    "/api/settings/get/all",
    [
      authJwt.verifyToken,
      authController.checkUserIdExists,
      generic.checkDatabaseAndCollection,
    ],
    controller.getAll
  );
};
