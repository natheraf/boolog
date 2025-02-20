export const searchOpenLib = (query, pageLimit = 5, page = 1) => {
  const fields = [
    "title",
    "author_name",
    "publisher",
    "first_publish_year",
    "number_of_pages_median",
    "isbn",
    "key",
    "cover_i",
  ];
  const url = `https://openlibrary.org/search.json?${query}&limit=${pageLimit}&page=${page}&fields=${fields.join(
    ","
  )}`;
  const options = {
    method: "GET",
  };
  return new Promise((resolve, reject) =>
    fetch(url, options)
      .then((response) => resolve(response.json()))
      .catch((error) => reject(Error(error)))
  );
};
