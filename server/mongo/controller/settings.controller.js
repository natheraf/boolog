const { getDatabase } = require("../database");
const { bodyMissingRequiredFields } = require("../middleware/utils");

exports.updateMultiple = (req, res) => {
  const userRequiredBody = ["data"];
  const missing = bodyMissingRequiredFields(req, userRequiredBody);
  if (missing) {
    return res?.status(400).send(missing);
  }
  const dataObject = req.body.data;

  getDatabase("userAppData").then(async (db) => {
    const settings = await db
      .collection("settings")
      .findOne({ userId: req.userId });
    if (settings === null) {
      await db
        .collection("settings")
        .insertOne({ userId: req.userId, ...dataObject });
    } else {
      for (const [key, value] of Object.entries(dataObject)) {
        settings[key] = value;
      }
      await db
        .collection("settings")
        .replaceOne({ _id: settings._id }, settings);
      delete settings._id;
      delete settings.userId;
    }
    res
      .status(200)
      .send({ message: "updated settings", data: settings ?? dataObject });
  });
};

exports.getAll = (req, res) => {
  getDatabase("userAppData").then((db) => {
    db.collection("settings")
      .findOne({ userId: req.userId })
      .then((data) => {
        if (data === null) {
          res.status(200).send({
            message: "Please complete 'Getting started'",
            action: "run getting started",
          });
        } else {
          delete data._id;
          delete data.userId;
          res.status(200).send({
            data,
          });
        }
      });
  });
};
