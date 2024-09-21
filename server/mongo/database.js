const ROLES = ["super_admin", "admin", "user"];

const getDatabase = (dbName) =>
  new Promise((resolve, reject) => {
    const { MongoClient } = require("mongodb");

    const url = "mongodb://localhost:27017";
    const client = new MongoClient(url);

    client
      .connect()
      .then((res) => resolve(res.db(dbName)))
      .catch((error) => reject(error));
  });

module.exports = { getDatabase, ROLES };
