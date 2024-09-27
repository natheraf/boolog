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

  async function dropAllCollectionsInDatabases(arrayOfDatabases) {
    return new Promise(async (resolve, reject) => {
      await client.connect();
      arrayOfDatabases.forEach((databasesName) => {
        const db = client.db(databasesName);
        db.listCollections()
          .toArray()
          .then((collections) => {
            collections.forEach((obj) => {
              if (obj.name === "loginEmailCodes") {
                return;
              }
              db.collection(obj.name)
                .drop()
                .then(() =>
                  db
                    .collection(obj.name)
                    .createIndex({ email: 1 }, { unique: true })
                    .then(() => {
                      console.log(
                        `Successfully dropped all collections in ${obj.name}`
                      );
                      if (obj.name === "loginInfo") createSuperAdmin();
                    })
                );
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

  const initialize = () => {
    dropAllCollectionsInDatabases(["userLists", "authentication"]);
  };

  if (drop) {
    initialize();
  }
  dropLoginEmailCodes();
};
