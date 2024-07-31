export const searchOpenLib = (query) => {
  const url = `https://openlibrary.org/search.json?${query}&limit=5`;
  const options = {
    method: "GET",
  };
  return new Promise((resolve, reject) =>
    fetch(url, options)
      .then((response) => resolve(response.json()))
      .catch((error) => reject(Error(error)))
  );
};
