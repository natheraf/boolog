const { generateAuthURL } = require("../../externalAPI/googleAuth");

exports.sendGoogleAuthLink = (req, res) =>
  res.status(200).send({ url: generateAuthURL(req) });
