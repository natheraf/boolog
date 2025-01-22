const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controller/auth.controller");

module.exports = function (app) {
  app.post(
    "/api/auth/signup",
    [
      authJwt.creatingAccountVerifyToken,
      verifySignUp.checkRolesExist,
      authJwt.authorizedToCreateUser,
      verifySignUp.checkDuplicateEmail,
    ],
    controller.sendSignUpCode
  );

  app.post(
    "/api/auth/signup/checkcode",
    [controller.checkSignUpCode, controller.signUp],
    controller.signIn
  );

  app.post(
    "/api/auth/signin",
    [authJwt.checkIfAlreadySignedIn],
    controller.signIn
  );

  app.post("/api/auth/signout", controller.signOut);

  app.post(
    "/api/auth/passwordless/sendcode",
    [
      authJwt.checkIfAlreadySignedIn,
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
    [controller.checkPasswordlessCode, controller.signUp],
    controller.signInPasswordless
  );
};
