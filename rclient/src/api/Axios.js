import axios from "axios";

axios.defaults.withCredentials = true;
const api = `${window.location.protocol}//${window.location.hostname}:${process.env.REACT_APP_SERVER_PORT}/api`;

const httpMethodFunctions = new Map([
  ["POST", axios.post],
  ["GET", axios.get],
]);

/**
 * Streamlines simple http requests
 * @param {String} httpMethod GET, POST, DELETE, etc.
 * @param {Object} object post method, object gets passed onto req.body. get method, object is the config object
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

/**
 * Http request that uses data form content type to send ONLY ONE file.
 * The file needs to be in keyed as `blob`. All other value type should be non-objects / primitive types.
 * The methods used should only be POST, probably...
 * @param {String} httpMethod GET, POST, DELETE, etc.
 * @param {Object} object except for the blob, everything needs to be a non-objects / primitive
 * @param {Blob} object.blob blob that is being uploaded
 * @param {String} route api route appended to root url
 * @param {Object=} query object map for get url query
 * @returns {Promise} http request promise
 */
export const handleDataFormRequest = (
  httpMethod,
  object,
  route,
  query = {}
) => {
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
  const formData = new FormData();
  for (const key of Object.keys(object)) {
    if (typeof object[key] !== "object") {
      formData.append(key, object[key]);
    }
  }
  formData.append("file", object.blob);
  return new Promise((resolve, reject) =>
    httpMethodFunctions
      .get(httpMethod)(`${api}/${route}${queryString}`, formData, {
        headers: {
          "Content-Type": `multipart/form-data`,
        },
      })
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
