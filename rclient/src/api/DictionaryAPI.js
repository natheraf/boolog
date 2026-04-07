import { handleFetch } from "./Axios";

export const merriamWebsterDictionaryLookup = (query = "dictionary") =>
  new Promise((resolve, reject) =>
    handleFetch("GET", {}, "resources/get", {
      key: "mwDictionary",
      query,
    })
      .then((res) => resolve(res.json()))
      .catch((error) => reject(new Error(error)))
  );

export const merriamWebsterThesaurusLookup = (query = "thesaurus") =>
  new Promise((resolve, reject) =>
    handleFetch("GET", {}, "resources/get", {
      key: "mwThesaurus",
      query,
    })
      .then((res) => resolve(res.json()))
      .catch((error) => reject(new Error(error)))
  );
