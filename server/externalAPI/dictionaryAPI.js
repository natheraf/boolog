const { mwDictionaryApiKey, mwThesaurusApiKey } = require("./config");

exports.lookupMWDictionary = (query) => {
  const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(query)}?key=${mwDictionaryApiKey}`;
  const options = {
    method: "GET",
  };
  return new Promise((resolve, reject) =>
    fetch(url, options)
      .then((response) => resolve(response.json()))
      .catch(console.error)
  );
};

exports.lookupMWThesaurus = (query) => {
  const url = `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${query}?key=${mwThesaurusApiKey}`;
  const options = {
    method: "GET",
  };
  return new Promise((resolve, reject) =>
    fetch(url, options)
      .then((response) => resolve(response.json()))
      .catch(console.error)
  );
};
