module.exports = (drop) => {
  const { MongoClient } = require("mongodb");

  const url = "mongodb://localhost:27017";
  const client = new MongoClient(url);

  async function setUpAuthentication() {
    await client.connect();
    console.log("Connected successfully to server");
    if (drop) {
      const db = client.db("authentication");
      const collections = ["loginEmailCodes", "emailAndPasswords"];
      collections.forEach((collection) => db.collection(collection).drop());
      console.log("Dropped authentication db collections");
    }
  }

  setUpAuthentication().catch(console.error);
};
