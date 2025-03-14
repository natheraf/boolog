import { handleSimpleRequest } from "./Axios";

export const searchGoogleBooks = (query, pageLimit = 5, page = 1) =>
  new Promise((resolve, reject) =>
    handleSimpleRequest("GET", {}, "resources/get", {
      key: "googleBooks",
      query,
      pageLimit,
      page,
    })
      .then((res) => resolve(res.data.searchResults))
      .catch((error) => reject(Error(error)))
  );

export const getGoogleFonts = () =>
  new Promise((resolve, reject) =>
    handleSimpleRequest("GET", {}, "resources/get", { key: "googleFonts" })
      .then((res) => resolve(res.data.fonts))
      .catch((error) => reject(Error(error)))
  );
