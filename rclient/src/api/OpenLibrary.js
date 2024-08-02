export const searchOpenLib = (query, pageLimit = 5, page = 1) => {
  const url = `https://openlibrary.org/search.json?${query}&limit=${pageLimit}&page=${page}`;
  const options = {
    method: "GET",
  };
  return new Promise((resolve, reject) =>
    fetch(url, options)
      .then((response) => resolve(response.json()))
      .catch((error) => reject(Error(error)))
  );
};
