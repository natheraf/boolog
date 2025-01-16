const { createSuperAdmin } = require("./controller/auth.controller");

module.exports = (drop) => {
  const { MongoClient } = require("mongodb");

  const url = "mongodb://localhost:27017";
  const client = new MongoClient(url);

  async function canConnect() {
    client
      .connect()
      .then(() => console.log("Successfully connected to MongoDB"))
      .catch((error) => console.log(`Unable to connect to MongoDB: ${error}`));
  }

  canConnect();

  async function dropAllCollectionsInDatabases(databasesToCollections) {
    return new Promise((resolve, reject) => {
      client.connect();
      databasesToCollections.forEach((obj) => {
        const databasesName = obj.database;
        const db = client.db(databasesName);
        obj.collections.forEach((collectionName) => {
          db.collection(collectionName)
            .drop()
            .then(() => {
              if (collectionName === "loginEmailCodes") {
                // handled in dropLoginEmailCodes
                return;
              } else if (collectionName === "loginInfo") {
                db.collection(collectionName).createIndex({ email: 1 });
              } else if (databasesName === "userLists") {
                db.collection(collectionName).createIndex({ shelf: 1 });
                db.collection(collectionName).createIndex({ userId: 1 });
              } else if (databasesName === "userAppData") {
                db.collection(collectionName).createIndex({ userId: 1 });
              }
              console.log(
                `Successfully dropped all collections in ${collectionName}`
              );
              if (collectionName === "loginInfo") createSuperAdmin();
            });
        });
      });
    });
  }

  async function dropLoginEmailCodes() {
    const db = client.db("authentication");
    const collections = ["loginEmailCodes"];
    collections.forEach((collection) =>
      db
        .collection(collection)
        .drop()
        .then(() => {
          db.collection(collection).createIndex({ email: 1 }, { unique: true });
          db.collection(collection).createIndex({ codeId: 1 });
        })
    );
    console.log("Dropped login email codes");
  }

  const databasesToCollections = [
    {
      database: "authentication",
      collections: ["loginEmailCodes", "loginInfo"],
    },
    { database: "userLists", collections: ["v1"] },
    { database: "userAppData", collections: ["settings"] },
  ];

  const createMissingCollections = () =>
    new Promise((resolve, reject) =>
      Promise.all(
        databasesToCollections.map((obj) =>
          Promise.all(
            obj.collections.map((collection) =>
              client.db(obj.database).createCollection(collection)
            )
          ).then(resolve)
        )
      ).then(resolve)
    );

  const initialize = () => {
    dropAllCollectionsInDatabases(databasesToCollections);
  };

  createMissingCollections().then(() => {
    if (drop) {
      initialize();
    }
    dropLoginEmailCodes();
  });
};
