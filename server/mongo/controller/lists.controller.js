const { ObjectId } = require("mongodb");
const { getDatabase } = require("../database");
const {
  bodyMissingRequiredFields,
  arrayToComplexListString,
  urlQueryMissingRequiredFields,
} = require("../middleware/utils");

/**
 * Creates, updates, or deletes entries
 * @param {Object} req
 * @param {Object} res
 */
exports.putMultiple = (req, res) => {
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
    if (typeof entry.shelf !== "string") {
      log.push({
        entryId: entry.id,
        type: "error",
        message: "missing shelf property or is not a string",
      });
      continue;
    }
    getDatabase("userLists").then((db) => {
      if (entry.deleted === true) {
        db.collection("v1")
          .deleteOne({
            _id: ObjectId.createFromHexString(entry.cloudId ?? "0".repeat(24)),
          })
          .then((res) => {
            if (res.deleteCount === 1) {
              clientActions.push({ entryId: entry.id, action: "delete" });
            }
          })
          .catch((error) =>
            log.push({
              entryId: entry.id,
              type: "error",
              message: "unable to delete cloud entry, cloudId is missing",
              errorObject: error,
            })
          );
        resolves[index]();
      } else {
        db.collection("v1")
          .findOne(
            ObjectId.createFromHexString(entry.cloudId ?? "0".repeat(24))
          )
          .then((databaseEntry) => {
            entry.userId = req.userId;
            const localId = entry.id;
            delete entry.id;
            const objectLastSynced = entry.lastSynced;
            const lastSynced = Date.now();
            if (databaseEntry === null) {
              db.collection("v1")
                .insertOne(entry)
                .then((insertRes) => {
                  clientActions.push({
                    entryId: localId,
                    action: "update",
                    lastSynced,
                    cloudId: insertRes.insertedId,
                  });
                  resolves[index]();
                });
              log.push({
                entryId: localId,
                type: "warning",
                message: "Missing cloud entry. Created one.",
              });
            } else if (true) {
              db.collection("v1")
                .replaceOne({ _id: databaseEntry._id }, entry)
                .then(() => {
                  clientActions.push({
                    entryId: localId,
                    action: "update",
                    lastSynced,
                    cloudId: databaseEntry._id,
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
      log,
      clientActions,
      message: `Successfully updated multiple with ${
        log.filter((obj) => obj.type === "error").length
      } errors and ${
        log.filter((obj) => obj.type === "warning").length
      } warnings`,
    });
  });
};

exports.getAll = (req, res) => {
  const response = { shelves: {} };

  getDatabase("userLists").then(async (db) => {
    const entryCursor = db.collection("v1").find({ userId: req.userId });
    for await (const entry of entryCursor) {
      delete entry.userId;
      delete entry._id;
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
  const missing = urlQueryMissingRequiredFields(req, userRequiredBody);
  if (missing) {
    return res?.status(400).send(missing);
  }
  const shelves = JSON.parse(req.query.shelves);

  const response = { shelves: {} };
  getDatabase("userLists").then(async (db) => {
    for (const shelf of shelves) {
      response.shelves[shelf] = await db
        .collection("v1")
        .find({ userId: req.userId, shelf })
        .toArray();
      response.shelves[shelf].map((entry) => {
        delete entry.userId;
        delete entry._id;
      });
    }
    response.message = `Successfully retrieved entries from ${arrayToComplexListString(
      shelves
    )}`;
    res.status(200).send(response);
  });
};
