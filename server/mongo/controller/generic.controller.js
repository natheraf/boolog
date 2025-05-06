const { ObjectId } = require("mongodb");
const { getDatabase } = require("../database");
const {
  bodyMissingRequiredFields,
  urlQueryMissingRequiredFields,
  getCloudId,
} = require("../middleware/utils");

exports.updateMultiple = (req, res) => {
  const userRequiredBody = ["data"];
  const missing = bodyMissingRequiredFields(req, userRequiredBody);
  if (missing) {
    return res?.status(400).send(missing);
  }

  const entries = req.body.data;
  getDatabase(req.database).then(async (db) => {
    for (const entry of entries) {
      const id = getCloudId(req.userId, entry.entryId);
      delete entry.entryId;
      const key = entry.key;
      delete entry.key;
      await db.collection(req.collection).updateOne(
        { _id: id },
        {
          $set: {
            [key]: entry,
          },
          $setOnInsert: {
            userId: req.userId,
          },
        },
        { upsert: true }
      );
    }
    res.status(200).send({ message: `updated ${entries.length} objects` });
  });
};

exports.putMultiple = (req, res) => {
  const userRequiredBody = ["data"];
  const missing = bodyMissingRequiredFields(req, userRequiredBody);
  if (missing) {
    return res?.status(400).send(missing);
  }

  const entries = req.body.data;
  getDatabase(req.database).then(async (db) => {
    for (const entry of entries) {
      entry._id = ObjectId.createFromHexString(
        getCloudId(req.userId, entry._id)
      );
      entry.userId = req.userId;
      await db.collection(req.collection).replaceOne(
        {
          _id: entry._id,
        },
        entry,
        { upsert: true }
      );
    }
    res.status(200).send({
      message: `updated ${entries.length} object(s) in ${req.collection}`,
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
          return res.status(404).send({
            message: `Requested item with key ${req.query.key} is not found`,
          });
        }
        delete data._id;
        delete data.userId;
        res.status(200).send({
          message: "item found",
          data,
        });
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
      entry._id = localizeCloudId(entry._id);
    });
    res.status(200).send({
      message: `${data.length} found`,
    });
  });
};
