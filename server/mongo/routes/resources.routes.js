const controller = require("../controller/resources.controller");

module.exports = function (app) {
  app.get("/api/resources/get", [], controller.get);
};
