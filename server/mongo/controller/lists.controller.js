const { ObjectId } = require("mongodb");
const { getDatabase } = require("../database");
const {
  bodyMissingRequiredFields,
  urlParamsMissingRequiredFields,
  arrayToComplexListString,
} = require("../middleware/utils");

/**
 * Creates, updates, or deletes entries
 * @param {Object} req
 * @param {Object} res
 */
exports.updateMultiple = (req, res) => {
  const userRequiredBody = ["data"];
  const missing = bodyMissingRequiredFields(req, userRequiredBody);
  if (missing) {
    return res?.status(400).send(missing);
  }
  const entries = req.body.data;
  if (Array.isArray(entries) === false) {
    return res?.status(400).send({ message: "data is not array" });
  }
  const log = [];
  const clientActions = [];
  const resolves = [...Array(entries.length)];
  const promises = [...Array(entries.length)].map(
    (_, index) =>
      new Promise((resolve, reject) => {
        resolves[index] = resolve;
      })
  );
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (
      entry.hasOwnProperty("shelf") === false ||
      typeof entry.shelf !== "string"
    ) {
      log.push({
        entryId: entry.id,
        message: "missing shelf property or is not a string",
      });
      continue;
    }
    const data = entry;
    getDatabase("userLists").then((db) => {
      if (entry.hasOwnProperty("cloudId") && entry.deleted === true) {
        db.collection("v1")
          .deleteOne(ObjectId.createFromHexString(entry.cloudId))
          .catch((error) =>
            log.push({
              entryId: entry.id,
              message: "cloudId is missing",
              log: error,
            })
          );
        clientActions.push({ entryId: entry.id, action: "delete" });
        resolves[index]();
      } else {
        db.collection("v1")
          .findOne(
            ObjectId.createFromHexString(entry.cloudId ?? "0".repeat(24))
          )
          .then((databaseEntry) => {
            const localId = entry.id;
            delete entry.id;
            const lastSynced = Date.now();
            if (databaseEntry === null) {
              db.collection("v1")
                .insertOne({
                  userId: req.userId,
                  lastSynced,
                  shelf: entry.shelf,
                  data,
                })
                .then((insertRes) => {
                  clientActions.push({
                    entryId: localId,
                    lastSynced,
                    cloudId: insertRes.insertedId,
                  });
                  resolves[index]();
                });
              log.push({
                entryId: localId,
                message: "Missing cloud entry. Created one.",
              });
            } else if (databaseEntry.lastSynced !== entry.lastSynced) {
              db.collection("v1")
                .replaceOne(
                  { _id: entry._id },
                  {
                    userId: req.userId,
                    lastSynced,
                    data,
                  }
                )
                .then((insertRes) => {
                  clientActions.push({
                    entryId: localId,
                    lastSynced,
                    cloudId: insertRes.insertedId,
                  });
                  resolves[index]();
                });
            } else {
              resolves[index]();
            }
          });
      }
    });
  }
  Promise.all(promises).then(() => {
    res.status(201).send({
      log: log,
      clientActions,
      message: `Successfully updated multiple`,
    });
  });
};

exports.getAll = (req, res) => {
  const response = { shelves: {} };

  getDatabase("userLists").then(async (db) => {
    const entryCursor = db.collection("v1").find({ userId: req.userId });
    for await (const entry of entryCursor) {
      delete entry.userId;
      if (response.shelves.hasOwnProperty(entry.shelf) === false) {
        response.shelves[entry.shelf] = [];
      }
      response.shelves[entry.shelf].push(entry);
    }
    response.message = "Successfully retrieved all entries";
    res.status(200).send({ response });
  });
};

exports.getMultiple = (req, res) => {
  const userRequiredBody = ["shelves"];
  const missing = urlParamsMissingRequiredFields(req, userRequiredBody);
  if (missing) {
    return res?.status(400).send(missing);
  }
  const shelves = JSON.parse(req.params.shelves);

  const response = { shelves: {} };
  getDatabase("userLists").then(async (db) => {
    for (const shelf of shelves) {
      response.shelves[shelf] = await db
        .collection("v1")
        .find({ userId: req.userId, shelf: shelf })
        .toArray();
      response.shelves[shelf].map((entry) => delete entry.userId);
    }
    response.message = `Successfully retrieved entries from ${arrayToComplexListString(
      shelves
    )}`;
    res.status(200).send(response);
  });
};
