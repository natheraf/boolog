const googleWare = require("../../externalAPI/google/google.middle");
const googleMid = require("../middleware/google");
const { authJwt } = require("../middleware");
const authController = require("../controller/auth.controller");
const googleController = require("../../externalAPI/google/drive.controller");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: Math.pow(2, 30) }, // 1 GB,
});

const googleDriveScope = "https://www.googleapis.com/auth/drive.file";

module.exports = function (app) {
  /**
   * Required "files" object array in body.
   * Each file is an object with
   *  blob: being the file itself
   *  _id: the file id
   *
   * This format is achieved by deleting epubObject client side
   */
  app.post(
    "/api/drive/put/one",
    [
      upload.single("file"),
      authJwt.verifyToken,
      authController.checkUserIdExists,
      authController.updateLastWritten,
      authJwt.attachUserToRequest,
      googleWare.hasGoogleSignInAndScopes([googleDriveScope]),
      googleWare.getGoogleOAuth2Client,
      googleMid.storeNewGoogleTokens,
      googleWare.getDriveAppdataFolderId,
    ],
    googleController.putOne
  );

  app.get(
    "/api/drive/list/all",
    [
      authJwt.verifyToken,
      authController.checkUserIdExists,
      authJwt.attachUserToRequest,
      googleWare.hasGoogleSignInAndScopes([googleDriveScope]),
      googleWare.getGoogleOAuth2Client,
      googleMid.storeNewGoogleTokens,
      googleWare.getDriveAppdataFolderId,
    ],
    googleController.listAll
  );

  /**
   * Required "fileDriveId" string array in body.
   */
  app.get(
    "/api/drive/get/one",
    [
      authJwt.verifyToken,
      authController.checkUserIdExists,
      authJwt.attachUserToRequest,
      googleWare.hasGoogleSignInAndScopes([googleDriveScope]),
      googleWare.getGoogleOAuth2Client,
      googleMid.storeNewGoogleTokens,
      googleWare.getDriveAppdataFolderId,
    ],
    googleController.getOne
  );

  /**
   * Required "fileDriveId" string array in body.
   */
  app.post(
    "/api/drive/delete/one",
    [
      authJwt.verifyToken,
      authController.checkUserIdExists,
      authJwt.attachUserToRequest,
      googleWare.hasGoogleSignInAndScopes([googleDriveScope]),
      googleWare.getGoogleOAuth2Client,
      googleMid.storeNewGoogleTokens,
    ],
    googleController.deleteOne
  );
};
