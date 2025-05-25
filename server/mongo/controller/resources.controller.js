const {
  searchGoogleBooks,
  fetchGoogleFonts,
} = require("../../externalAPI/google/googleAPI");
const { getDatabase } = require("../database");
const { sampleEpubPath } = require("../config/resources.config");

const getGoogleFonts = () =>
  new Promise((resolve, reject) => {
    getDatabase("server").then((db) => {
      db.collection("resources")
        .findOne({ key: "googleFonts" })
        .then((res) => {
          if (res === null) {
            fetchGoogleFonts().then((value) =>
              db
                .collection("resources")
                .insertOne({ key: "googleFonts", value })
                .then(resolve(value))
            );
          } else {
            resolve(res.value);
          }
        });
    });
  });

exports.get = (req, res) => {
  const key = req.query.key;
  if (key === "googleFonts") {
    getGoogleFonts().then((fonts) => res.status(200).send({ fonts }));
  } else if (key === "googleBooks") {
    const query = req.query.query;
    const pageLimit = req.query.pageLimit;
    const page = req.query.page;
    searchGoogleBooks(query, pageLimit, page).then((searchResults) =>
      res.status(200).send({ searchResults })
    );
  } else if (key === "sampleEpub") {
    const fs = require("fs");
    const readStream = fs.createReadStream(sampleEpubPath);
    res.writeHead(200, {
      "Content-Type": "application/epub+zip",
    });
    readStream.pipe(res);
  } else {
    res.status(500).send({ message: "no key found" });
  }
};
