import { openDatabase } from "./common";
import { appDataDBVersion } from "./config";

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

export const renameUser = (userId, newName) =>
  openDatabase("appData", appDataDBVersion, (db) =>
    renameUserHelper(db, userId, newName)
  );

const renameUserHelper = (db, userId, newName) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readwrite");
    transaction.oncomplete = (event) => {
      console.log("renamed user successfully");
    };
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore("users");
    const request = objectStore.get(userId);
    request.onsuccess = (event) => {
      const result = event.target.result;
      if (result === undefined) {
        console.log("No user found, missing id");
        return;
      }
      result.name = newName;
      const requestUpdate = objectStore.put(result);
      requestUpdate.onsuccess = () => {
        console.log("updated name");
        resolve(result.id); // returns id of user
      };
    };
  });

export const addUser = (name) =>
  openDatabase("appData", appDataDBVersion, (db) => addUserHelper(db, name));

const addUserHelper = (db, name) =>
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
    const requestUpdate = objectStore.put({
      name,
    });
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
