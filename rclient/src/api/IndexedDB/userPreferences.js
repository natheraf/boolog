import { getUserDB, openDatabase } from "./common";
import { appDataDBVersion, settingsObjectStore } from "./config";

export const getSettings = (key) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    getSettingsHelper(db, key)
  );

const getSettingsHelper = (db, key) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(settingsObjectStore, "readonly");
    const objectStore = transaction.objectStore(settingsObjectStore);
    const request = objectStore.get(key);
    request.onsuccess = (event) => {
      const value = event.target.result;
      resolve(value);
    };
    request.onerror = (error) => reject(new Error(error));
  });

/**
 *
 * @param {object} data
 * @param {string} data.key
 * @param {any} data.value
 * @returns
 */
export const putSettings = (data) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    putSettingsHelper(db, data)
  );

const putSettingsHelper = (db, data) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(settingsObjectStore, "readwrite");
    const objectStore = transaction.objectStore(settingsObjectStore);
    const request = objectStore.put(data);
    request.onsuccess = (event) => resolve(event);
    request.onerror = (error) => reject(new Error(error));
  });

/**
 * Will update the key and values present in data object
 * @param {object} data
 * @returns
 */
export const updateSettings = (data) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    updateSettingsHelper(db, data)
  );

const updateSettingsHelper = (db, data) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(settingsObjectStore, "readonly");
    const objectStore = transaction.objectStore(settingsObjectStore);
    const request = objectStore.get(data.key);
    const handleError = (error) => reject(new Error(error));
    request.onsuccess = (event) => {
      const oldData = event.target.result;
      const transaction = db.transaction(settingsObjectStore, "readwrite");
      const objectStore = transaction.objectStore(settingsObjectStore);
      const request = objectStore.put({ ...oldData, ...data });
      request.onsuccess = resolve;
      request.onerror = handleError;
    };
    request.onerror = handleError;
  });

export const getSettingsWithDefault = (data) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    getSettingsWithDefaultHelper(db, data)
  );

const getSettingsWithDefaultHelper = (db, data) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(settingsObjectStore, "readonly");
    const objectStore = transaction.objectStore(settingsObjectStore);
    const request = objectStore.get(data.key);
    request.onsuccess = (event) => {
      const value = event.target.result;
      if (value === undefined) {
        const transaction = db.transaction(settingsObjectStore, "readwrite");
        const objectStore = transaction.objectStore(settingsObjectStore);
        const request = objectStore.add(data);
        request.onsuccess = () => resolve(data);
        request.onerror = (error) => reject(new Error(error));
      } else {
        resolve(value);
      }
    };
    request.onerror = (error) => reject(new Error(error));
  });

export const deleteSettings = (id) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    deleteSettingsHelper(db, id)
  );

const deleteSettingsHelper = (db, id) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(settingsObjectStore, "readwrite");
    const objectStore = transaction.objectStore(settingsObjectStore);
    try {
      const request = objectStore.delete(id);
      request.onsuccess = resolve;
      request.onerror = (error) => {
        console.log("Request Error", error);
        reject(new Error(`Request Error: ${error}`));
      };
    } catch (error) {
      if (error.name === "DataError") {
        resolve();
      } else {
        reject(new Error(error));
      }
    }
  });
