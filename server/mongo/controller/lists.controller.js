const { ObjectId } = require("mongodb");
const { getDatabase } = require("../database");
const { bodyMissingRequiredFields } = require("../middleware/utils");

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
  const entryErrors = [];
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
      entryErrors.push({
        entryId: entry.id,
        error: "missing shelf property or is not a string",
      });
      continue;
    }
    const data = entry;
    getDatabase("userLists").then((db) => {
      if (entry.hasOwnProperty("cloudId") && entry.deleted === true) {
        db.listCollections({ name: entry.shelf }).next((error, collInfo) => {
          if (collInfo) {
            db.collection(entry.shelf).deleteOne(
              ObjectId.createFromHexString(entry.cloudId)
            );
          }
        });
        clientActions.push({ entryId: entry.id, action: "delete" });
        resolves[index]();
      } else if (entry.shelf === "books") {
        db.collection("books")
          .findOne(
            ObjectId.createFromHexString(entry.cloudId ?? "0".repeat(24))
          )
          .then((databaseEntry) => {
            const localId = entry.id;
            delete entry.id;
            const lastSynced = Date.now();
            if (databaseEntry === null) {
              db.collection("books")
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
              entryErrors.push({
                entryId: localId,
                error: "Missing cloud entry. Created one.",
              });
            } else {
              db.collection("books")
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
            }
          });
      } else {
        db.collection("custom")
          .findOne(
            ObjectId.createFromHexString(entry.cloudId ?? "0".repeat(24))
          )
          .then((databaseEntry) => {
            const localId = entry.id;
            delete entry.id;
            const lastSynced = Date.now();
            if (databaseEntry === null) {
              db.collection("custom")
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
              entryErrors.push({
                entryId: localId,
                error: "Missing cloud entry. Created one.",
              });
            } else {
              db.collection("custom")
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
            }
          });
      }
    });
  }
  Promise.all(promises).then(() => {
    res.status(201).send({
      entryErrors,
      clientActions,
      message: `Successfully updated multiple with ${entryErrors.length} errors`,
    });
  });
};

exports.getAllShelves = (req, res) => {
  const response = { shelves: {} };

  getDatabase("userLists").then(async (db) => {
    response.shelves.books = db
      .collection("books")
      .find({ userId: req.userId, shelf: "books" })
      .toArray()
      .map((entry) => delete entry.userId);
    const entryCursor = db.collection("custom").find({ userId: req.userId });
    for await (const entry of entryCursor) {
      delete entry.userId;
      if (response.shelves.hasOwnProperty(entry.shelf) === false) {
        response.shelves[entry.shelf] = [];
      }
      response.shelves[entry.shelf].push(entry);
    }
  });
  response.message = "Successfully retrieved all entries";
  req.status(200).send({ response });
};

exports.getOneShelf = (req, res) => {
  const userRequiredBody = ["shelf"];
  const missing = bodyMissingRequiredFields(req, userRequiredBody);
  if (missing) {
    return res?.status(400).send(missing);
  }

  const response = { shelves: {} };
  getDatabase("userLists").then((db) => {
    if (req.body.shelf === "books") {
      response.shelves.books = db
        .collection("books")
        .find({ userId: req.userId, shelf: "books" })
        .toArray()
        .map((entry) => delete entry.userId);
    } else {
      response.shelves.books = db
        .collection("custom")
        .find({ userId: req.userId, shelf: req.body.shelf })
        .toArray()
        .map((entry) => delete entry.userId);
    }
  });
  response.message = `Successfully retrieved entries from ${req.body.shelf}`;
  res.status(200).send(response);
};
