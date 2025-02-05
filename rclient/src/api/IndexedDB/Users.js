import { openDatabase } from "./common";
import { appDataDBVersion } from "./config";
import { getCurrentUser } from "./State";

export const updateLastSynced = (value) =>
  new Promise((resolve, reject) => {
    getCurrentUser().then((user) => {
      user.lastSynced = value;
      updateUser(user).then(resolve);
    });
  });

export const getAllUsers = () =>
  openDatabase("appData", appDataDBVersion, (db) => getAllUsersHelper(db));

const getAllUsersHelper = (db) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readonly");
    transaction.oncomplete = (event) => {
      console.log("got all users successfully");
    };
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore("users");
    objectStore.getAll().onsuccess = (event) => {
      resolve(event.target.result);
    };
  });

export const getUser = (id) =>
  openDatabase("appData", appDataDBVersion, (db) => getUserHelper(db, id));

const getUserHelper = (db, id) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readonly");
    transaction.oncomplete = (event) => {
      console.log("got user from id successfully");
    };
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore("users");
    objectStore.get(id).onsuccess = (event) => {
      resolve(event.target.result);
    };
  });

/**
 * update a local user
 * @param {Object} data user's new data to be written with user id
 * @returns {Promise<Number>} updated user's id, -1 if no user found
 */
export const updateUser = (user) =>
  openDatabase("appData", appDataDBVersion, (db) => updateUserHelper(db, user));

const updateUserHelper = (db, user) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readwrite");
    transaction.oncomplete = (event) => {
      console.log("updated user successfully");
    };
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore("users");
    const request = objectStore.get(user.id);
    request.onsuccess = (event) => {
      const result = event.target.result;
      if (result === undefined) {
        console.log("No user found, missing id");
        resolve(-1);
      }
      const requestUpdate = objectStore.put(user);
      requestUpdate.onsuccess = () => {
        console.log("updated name");
        resolve(result.id); // returns id of user
      };
    };
  });

/**
 * adds a local user
 * @param {Object} data user data object for writing to db
 * @returns {Promise<Number>} the created user's id
 */
export const addUser = (data) =>
  openDatabase("appData", appDataDBVersion, (db) => addUserHelper(db, data));

const addUserHelper = (db, data) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readwrite");
    transaction.oncomplete = (event) => {
      console.log("added user successfully");
    };
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore("users");
    const requestUpdate = objectStore.put(data);
    requestUpdate.onsuccess = (event) => resolve(event.target.result);
  });

export const deleteUser = (id) =>
  openDatabase("appData", appDataDBVersion, (db) => deleteUserHelper(db, id));

const deleteUserHelper = (db, id) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readwrite");
    transaction.oncomplete = (event) => {
      console.log("deleted user successfully");
    };
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore("users");
    const requestUpdate = objectStore.delete(id);
    requestUpdate.onsuccess = (event) => resolve(event);
  });
