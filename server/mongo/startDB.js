const { createSuperAdmin } = require("./controller/auth.controller");

module.exports = (drop) => {
  const { MongoClient } = require("mongodb");

  const url = "mongodb://localhost:27017";
  const client = new MongoClient(url);

  async function dropAuthenticationCollections() {
    await client.connect();
    if (drop) {
      const db = client.db("authentication");
      const collections = ["loginEmailCodes", "loginInfo"];
      collections.forEach((collection) =>
        db
          .collection(collection)
          .drop()
          .then(() => {
            db.collection(collection).createIndex(
              { email: 1 },
              { unique: true }
            );
          })
      );
      console.log("successfully dropped all collections in authentication");
    }
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
        })
    );
    console.log("Dropped login email codes");
  }

  const initialize = () => {
    dropAuthenticationCollections().catch(console.error);
    createSuperAdmin();
  };

  if (drop) {
    initialize();
  } else {
    dropLoginEmailCodes();
  }
};
