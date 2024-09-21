const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controller/auth.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      authJwt.creatingAccountVerifyToken,
      verifySignUp.checkRolesExist,
      authJwt.authorizedToCreateUser,
      verifySignUp.checkDuplicateEmail,
      controller.signUp,
    ],
    controller.signIn
  );

  app.post("/api/auth/signin", controller.signIn);

  app.post("/api/auth/signout", controller.signOut);

  app.post(
    "/api/auth/passwordless/sendcode",
    [
      controller.checkPasswordless,
      authJwt.creatingAccountVerifyToken,
      verifySignUp.checkRolesExist,
      authJwt.authorizedToCreateUser,
      verifySignUp.checkDuplicateEmail,
    ],
    controller.signUpPasswordless
  );

  app.post(
    "/api/auth/passwordless/checkcode",
    [controller.checkPasswordlessCode],
    controller.signInPasswordless
  );
};
