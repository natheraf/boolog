const { authJwt } = require("../middleware");
const controller = require("../controller/generic.controller");
const authController = require("../controller/auth.controller");
const generic = require("../middleware/generic");

module.exports = function (app) {
  app.post(
    "/api/generic/put/multiple",
    [
      authJwt.verifyToken,
      authController.checkUserIdExists,
      generic.checkDatabaseAndCollection,
    ],
    controller.putMultiple
  );

  app.post(
    "/api/generic/dotNotation/multiple",
    [
      authJwt.verifyToken,
      authController.checkUserIdExists,
      generic.checkDatabaseAndCollection,
    ],
    controller.dotNotationMultiple
  );

  app.post(
    "/api/generic/update/multiple",
    [
      authJwt.verifyToken,
      authController.checkUserIdExists,
      generic.checkDatabaseAndCollection,
    ],
    controller.updateMultiple
  );

  app.get(
    "/api/generic/get/one",
    [
      authJwt.verifyToken,
      authController.checkUserIdExists,
      generic.checkDatabaseAndCollection,
    ],
    controller.getOne
  );

  app.get(
    "/api/generic/get/all",
    [
      authJwt.verifyToken,
      authController.checkUserIdExists,
      generic.checkDatabaseAndCollection,
    ],
    controller.getAll
  );
};
