const {
  googleBooksAPIKey,
  googleFontsAPIKey,
} = require("../../externalAPI/google/config");

exports.searchGoogleBooks = (query, pageLimit = 5, page = 1) => {
  const url = `https://www.googleapis.com/books/v1/volumes?${query}&maxResults=${pageLimit}&startIndex=${
    page - 1
  }&key=${googleBooksAPIKey}`;
  const options = {
    method: "GET",
  };
  return new Promise((resolve, reject) =>
    fetch(url, options)
      .then((response) => resolve(response.json()))
      .catch((error) => reject(Error(error)))
  );
};

/**
 *
 * @param {('alpha'|'date'|'popularity'|'style'|'trending')=} [sort=popularity]
 */
exports.fetchGoogleFonts = (sort = "popularity") => {
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
