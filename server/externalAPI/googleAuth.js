const { google } = require("googleapis");
const { bodyMissingRequiredFields } = require("../mongo/middleware/utils");

const getOAuth2Client = (req) => {
  const host = req.get("host");
  const redirectURL = `${req.protocol}://${
    host.startsWith("localhost")
      ? host.substring(0, host.indexOf(":")) + ":3000"
      : host
  }/login/google-auth`;
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectURL
  );
};

exports.generateAuthURL = (req, res) => {
  const oauth2Client = getOAuth2Client(req);
  const SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/userinfo.email",
  ];
  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",
    // If you only need one scope, you can pass it as a string
    scope: SCOPES,
  });
  res.status(200).send({ url });
};

exports.retrieveAccessToken = (req, res) => {
  const missing = bodyMissingRequiredFields(req, ["code"]);
  if (missing) {
    return res?.status(400).send(missing);
  }
  const oauth2Client = getOAuth2Client(req);
  oauth2Client
    .getToken(req.body.code)
    .then((tokens) => {
      oauth2Client.setCredentials(tokens.tokens);
      oauth2Client.on("tokens", (tokens) => {
        if (tokens.refresh_token) {
          // store the refresh_token in my database!
          console.log("refresh token");
        }
        console.log("access token");
      });
      const drive = google.drive({ version: "v3", auth: oauth2Client });
      drive.files
        .list({
          pageSize: 10,
          fields: "nextPageToken, files(id, name)",
        })
        .then((files) => res.status(200).send({ files }));
    })
    .catch((error) => {
      res.status(400).send({
        error,
        message: "Token probably has expired. Please login again.",
      });
    });
};
