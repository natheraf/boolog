const { google } = require("googleapis");
const { getOAuth2Client } = require("../../externalAPI/google/googleAuth");
const { bodyMissingRequiredFields } = require("./utils");
const { getDatabase } = require("../database");
const { storeNewRefreshToken } = require("../controller/auth.controller");

exports.setPasswordlessFoundUser = (req, res, next) => {
  const missing = bodyMissingRequiredFields(req, ["code"]);
  if (missing) {
    return res?.status(400).send(missing);
  }
};

exports.retrieveAccessToken = (req, res, next) => {
  const missing = bodyMissingRequiredFields(req, ["code"]);
  if (missing) {
    return res?.status(400).send(missing);
  }
  const oauth2Client = getOAuth2Client(req);
  oauth2Client
    .getToken(req.body.code)
    .then((data) => {
      delete req.body.code;
      oauth2Client.setCredentials(data.tokens);
      req.googleOauth2Client = oauth2Client;
      return next();
    })
    .catch((error) => {
      res.status(400).send({
        message: "Token probably has expired. Please login again.",
      });
    });
};

exports.listFiles = (req, res) => {
  const drive = google.drive({ version: "v3", auth: req.googleOauth2Client });
  drive.files
    .list({
      pageSize: 10,
      fields: "nextPageToken, files(id, name)",
    })
    .then((files) => res.status(200).send({ files }));
};

exports.getUserInfo = (req, res, next) => {
  const oauth2 = google.oauth2({ version: "v2", auth: req.googleOauth2Client });
  oauth2.userinfo
    .get()
    .then((response) => {
      const userInfo = response.data;
      req.body = {
        email: userInfo.email,
        password: null,
        active: true,
        name: userInfo.email,
        profilePicture: userInfo.picture,
        google: {
          id: userInfo.id,
          scope: req.googleOauth2Client.credentials.scope,
          refreshToken: req.googleOauth2Client.credentials.refresh_token,
        },
      };
      next();
    })
    .catch((error) => {
      res.status(500).send({ error: error.message });
    });
};

exports.setPasswordlessFoundUserFlag = (req, _res, next) => {
  req.passwordlessFoundUser = req.user !== null;
  next();
};

exports.storeNewGoogleTokens = (req, res, next) => {
  if (
    req.passwordlessFoundUser &&
    req.googleOauth2Client.credentials.refresh_token
  ) {
    getDatabase("authentication")
      .then((db) => {
        db.collection("loginInfo")
          .updateOne(
            { _id: req.user._id },
            {
              $set: {
                google: req.body.google,
              },
            }
          )
          .then(() => next());
      })
      .catch((error) => {
        console.log(error.message);
        res.status(500).send(error);
      });
  } else if (req.user && req.googleNewRefreshToken) {
    storeNewRefreshToken(req.user._id, req.googleNewRefreshToken).then(() =>
      next()
    );
  } else {
    next();
  }
};
