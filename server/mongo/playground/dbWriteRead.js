const { getDatabase } = require("../database");

getDatabase("authentication").then((db) => {
  const collection = db.collection("loginEmailCodes");
  collection.drop();
  collection
    .insertMany([
      {
        test: "testDoc1",
        eats: "good",
      },
      {
        test: "testDoc2",
        eats: "bad",
      },
    ])
    .then((insertResult) => {
      console.log("Inserted documents =>", insertResult);
      collection.findOne({ test: "testDoc3" }).then((findResult) => {
        if (findResult) {
          console.log("found testDoc1", findResult);
        } else {
          console.log("missing testDoc1", findResult);
        }
      });
    });
});
