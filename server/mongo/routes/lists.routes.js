const { authJwt } = require("../middleware");
const controller = require("../controller/lists.controller");
const authController = require("../controller/auth.controller");

module.exports = function (app) {
  app.post(
    "/api/lists/add/multiple",
    [authJwt.verifyToken, authController.checkUserIdExists],
    controller.updateMultiple
  );

  app.get(
    "/api/lists/get/allShelves",
    [authJwt.verifyToken, authController.checkUserIdExists],
    controller.getAllShelves
  );

  app.get(
    "/api/lists/get/oneShelf",
    [authJwt.verifyToken, authController.checkUserIdExists],
    controller.getOneShelf
  );
};
