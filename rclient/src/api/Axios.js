import axios from "axios";

axios.defaults.withCredentials = true;
const api = `${window.location.protocol}//${window.location.hostname}:4002/api`;

const httpMethodFunctions = new Map([
  ["POST", axios.post],
  ["GET", axios.get],
]);

/**
 * Streamlines simple http requests
 * @param {String} httpMethod GET, POST, DELETE, etc.
 * @param {Object} object passed onto req.body
 * @param {String} route api route appended to root url
 * @param {Object=} query object map for get url query
 * @returns {Promise} http request promise
 */
export const handleSimpleRequest = (httpMethod, object, route, query = {}) => {
  httpMethod = httpMethod.toUpperCase();
  object.localUserId = localStorage.getItem("userId");
  query.localUserId = localStorage.getItem("userId");
  const queryString = `?${Object.entries(query)
    .map((entry) =>
      entry
        .map((value) =>
          typeof value !== "string" ? JSON.stringify(value) : value
        )
        .join("=")
    )
    .join("&")}`;
  return new Promise((resolve, reject) =>
    httpMethodFunctions
      .get(httpMethod)(`${api}/${route}${queryString}`, object)
      .then((res) => resolve(res))
      .catch((error) => {
        return reject(Error(error?.response?.data?.message));
      })
  );
};

export const getRandomWord = (amount, minLength, maxLength) =>
  new Promise((resolve, reject) =>
    fetch(
      `https://random-word-api.herokuapp.com/word?number=${amount}&length=${
        Math.floor(Math.random() * maxLength) + minLength
      }`,
      {
        method: "GET",
      }
    )
      .then((response) => resolve(response.json()))
      .catch((error) => reject(Error(error)))
  );
