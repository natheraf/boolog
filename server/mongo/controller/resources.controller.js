const { searchGoogleBooks } = require("../../externalAPI/googleAPI");
const { googleFontsAPIKey } = require("../config/server.config");
const { getDatabase } = require("../database");

/**
 *
 * @param {('alpha'|'date'|'popularity'|'style'|'trending')=} [sort=popularity]
 */
const fetchGoogleFonts = (sort = "popularity") => {
  const url = `https://www.googleapis.com/webfonts/v1/webfonts?sort=${sort}&key=${googleFontsAPIKey}`;
  const options = {
    method: "GET",
  };
  return new Promise((resolve, reject) =>
    fetch(url, options)
      .then((response) => resolve(response.json()))
      .catch((error) => reject(Error(error)))
  );
};

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
  } else {
    res.status(500).send({ message: "no key found" });
  }
};
