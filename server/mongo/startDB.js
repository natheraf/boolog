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
      collections.forEach((collection) => db.collection(collection).drop());
      console.log("Dropped authentication db collections");
      db.collection("loginEmailCodes").createIndex(
        { email: 1 },
        { unique: true }
      );
      db.collection("loginInfo").createIndex({ email: 1 }, { unique: true });
      console.log("successfully dropped all collections in authentication");
    }
  }

  const initialize = () => {
    dropAuthenticationCollections().catch(console.error);
    createSuperAdmin();
  };

  if (drop) {
    initialize();
  }
};
