const { ObjectId } = require("mongodb");
const { getDatabase } = require("../database");
const {
  bodyMissingRequiredFields,
  urlQueryMissingRequiredFields,
  getCloudId,
  localizeCloudId,
} = require("../middleware/utils");

const updateMultiple = (req, res) => {
  const userRequiredBody = ["data"];
  const missing = bodyMissingRequiredFields(req, userRequiredBody);
  if (missing) {
    return res?.status(400).send(missing);
  }

  const entries = req.body.data;
  getDatabase(req.database).then(async (db) => {
    const log = [];
    for (const entry of entries) {
      const id = getCloudId(req.userId, entry.key);
      if (entry.deleted) {
        try {
          await db.collection(req.collection).deleteOne({ _id: id });
        } catch (error) {
          log.push({
            key,
            type: "error",
            message: "unable to delete cloud entry, cloudId is missing",
            errorObject: error,
          });
        }
        continue;
      }
      delete entry.key;
      delete entry.entryId;
      await db.collection(req.collection).updateOne(
        { _id: id },
        {
          $set: entry,
          $setOnInsert: {
            _userId: req.userId,
          },
        },
        { upsert: true }
      );
    }
    res.status(200).send({ message: `updated ${entries.length} objects`, log });
  });
};

const dotNotationMultiple = (req, res) => {
  const userRequiredBody = ["data"];
  const missing = bodyMissingRequiredFields(req, userRequiredBody);
  if (missing) {
    return res?.status(400).send(missing);
  }

  const entries = req.body.data;
  getDatabase(req.database).then(async (db) => {
    const log = [];
    for (const entry of entries) {
      const id = getCloudId(req.userId, entry.entryId);
      delete entry.entryId;
      const key = entry.key;
      delete entry.key;
      if (entry.deleted) {
        await db.collection(req.collection).updateOne(
          { _id: id },
          {
            $unset: {
              [key]: null,
            },
          }
        );
        continue;
      }
      const last = key.substring(key.lastIndexOf(".") + 1);
      await db.collection(req.collection).updateOne(
        { _id: id },
        {
          $set: {
            [key]: entry.hasOwnProperty(last) ? entry[last] : entry,
          },
          $setOnInsert: {
            _userId: req.userId,
          },
        },
        { upsert: true }
      );
    }
    res.status(200).send({ message: `updated ${entries.length} objects`, log });
  });
};

const putMultiple = (req, res) => {
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
      entry._userId = req.userId;
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

const getOne = (req, res) => {
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
        delete data._userId;
        res.status(200).send({
          message: "item found",
          data,
        });
      });
  });
};

const getAll = (req, res) => {
  getDatabase(req.database).then(async (db) => {
    const data = await db
      .collection(req.collection)
      .find({ _userId: req.userId })
      .toArray();
    data.forEach((entry) => {
      delete entry._userId;
      entry._id = localizeCloudId(entry._id);
    });
    res.status(200).send({
      epubData: data,
      message: `${data.length} found`,
    });
  });
};

const generic = {
  getAll,
  getOne,
  putMultiple,
  dotNotationMultiple,
  updateMultiple,
};

module.exports = generic;
