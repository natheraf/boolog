const { ObjectId } = require("mongodb");
const { getDatabase } = require("../database");
const {
  bodyMissingRequiredFields,
  urlQueryMissingRequiredFields,
} = require("../middleware/utils");

exports.updateMultiple = (req, res) => {
  const userRequiredBody = ["data"];
  const missing = bodyMissingRequiredFields(req, userRequiredBody);
  if (missing) {
    return res?.status(400).send(missing);
  }
  const dataObject = req.body.data;

  getDatabase(req.database).then(async (db) => {
    const dbObject = await db
      .collection(req.collection)
      .findOne({ userId: req.userId });
    if (dbObject === null) {
      await db
        .collection(req.collection)
        .insertOne({ userId: req.userId, ...dataObject });
    } else {
      for (const [key, value] of Object.entries(dataObject)) {
        dbObject[key] = value;
      }
      await db
        .collection(req.collection)
        .replaceOne(
          { _id: ObjectId.createFromHexString(dbObject._id) },
          dbObject
        );
      delete dbObject._id;
      delete dbObject.userId;
    }
    res.status(200).send({
      message: `updated object in ${req.collection}`,
      data: dbObject ?? dataObject,
    });
  });
};

exports.getOne = (req, res) => {
  const missing = urlQueryMissingRequiredFields(req, [
    "key",
    "database",
    "collection",
  ]);
  if (missing) {
    return res?.status(400).send(missing);
  }

  getDatabase(req.database).then((db) => {
    db.collection(req.collection)
      .findOne({ userId: req.userId, _id: getCloudId(req.query.key) })
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

exports.getAll = (req, res) => {
  getDatabase(req.database).then((db) => {
    const data = db
      .collection(req.collection)
      .find({ userId: req.userId })
      .toArray();
    data.forEach((entry) => {
      delete entry._userId;
      entry._id = entry._id.substring(25);
    });
  });
};
