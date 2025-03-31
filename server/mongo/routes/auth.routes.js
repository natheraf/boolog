const { authJwt, verifySignUp } = require("../middleware");
const controller = require("../controller/auth.controller");
const googleMid = require("../middleware/google");
const googleAuth = require("../../externalAPI/google/googleAuth");

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

  app.get("/api/auth/google/get-signin-link", googleAuth.sendGoogleAuthLink);

  app.post(
    "/api/auth/google/signin",
    [
      googleMid.retrieveAccessToken,
      googleMid.getUserInfo,
      authJwt.checkIfAlreadySignedIn,
      authJwt.creatingAccountVerifyToken,
      googleMid.setFoundUserFlagAndNewRefreshToken,
      controller.signUp,
    ],
    controller.signInPasswordless
  );
};
