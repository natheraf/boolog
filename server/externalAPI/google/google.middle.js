const { google } = require("googleapis");
const { getOAuth2Client } = require("./googleAuth");

const hasGoogleSignInAndScopes = (scopes) => (req, res, next) => {
  if (!req.user) {
    return res.status(404).send({ message: "User not found" });
  }
  const googleCredentials = req.user?.google;
  if (!googleCredentials) {
    return res.status(409).send({ message: "Not signed in to Google" });
  }
  for (const scope of scopes) {
    if (!googleCredentials.scope.includes(scope)) {
      return res.status(407).send({
        message: `Scope ${scope} is not found.`,
      });
    }
  }
  next();
};

const getGoogleOAuth2Client = (req, res, next) => {
  if (!req.user?.google?.refreshToken) {
    return res.status(404).send({ message: "Refresh Token missing" });
  }
  const oauth2Client = getOAuth2Client(req);
  oauth2Client.setCredentials({ refresh_token: req.user.google.refreshToken });
  req.googleOauth2Client = oauth2Client;
  next();
};

const getDriveAppdataFolderId = (req, res, next) => {
  const drive = google.drive({ version: "v3", auth: req.googleOauth2Client });
  req.drive = drive;
  drive.files
    .list({
      q: `mimeType='application/vnd.google-apps.folder' and name='appdata/boolog'`,
      fields: "files(id, name)",
    })
    .then((response) => {
      const files = response.data.files;
      if (files.length === 0) {
        drive.files
          .create({
            requestBody: {
              name: "appdata/boolog",
              mimeType: "application/vnd.google-apps.folder",
            },
          })
          .then((response) => {
            req.driveAppdataFolderId = response.data.id;
            next();
          })
          .catch((error) => res.status(500).send(error));
      } else {
        req.driveAppdataFolderId = files[0].id;
        next();
      }
    })
    .catch((error) => res.status(500).send(error));
};

const googleWare = {
  hasGoogleSignInAndScopes,
  getGoogleOAuth2Client,
  getDriveAppdataFolderId,
};

module.exports = googleWare;
