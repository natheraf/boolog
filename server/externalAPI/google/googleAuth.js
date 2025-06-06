const { google } = require("googleapis");

exports.getOAuth2Client = (req) => {
  const host = req.get("host");
  const redirectURL = `${req.protocol}://${
    host.startsWith("localhost")
      ? host.substring(0, host.indexOf(":")) + ":3000"
      : host
  }/login/google-auth`;
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectURL
  );
  oauth2Client.on("tokens", (tokens) => {
    if (tokens.refresh_token) {
      req.googleNewRefreshToken = tokens.refresh_token;
    }
  });
  return oauth2Client;
};

exports.generateAuthURL = (req) => {
  const oauth2Client = this.getOAuth2Client(req);
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
  return url;
};

exports.sendGoogleAuthLink = (req, res) =>
  res.status(200).send({ url: this.generateAuthURL(req) });
