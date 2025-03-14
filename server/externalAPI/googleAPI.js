const { googleBooksAPIKey } = require("../mongo/config/server.config");

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
