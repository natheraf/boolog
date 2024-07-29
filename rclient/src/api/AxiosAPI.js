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
 * @returns {Promise} http request promise
 */
export const handleSimpleRequest = (httpMethod, object, route) => {
  return new Promise((resolve, reject) =>
    httpMethodFunctions
      .get(httpMethod.toUpperCase())(`${api}/${route}`, object)
      .then((res) => resolve(res))
      .catch((error) => {
        return reject(Error(error?.response?.data?.message));
      })
  );
};

export const handleSignOut = () => {};
