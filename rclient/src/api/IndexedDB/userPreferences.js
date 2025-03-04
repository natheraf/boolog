import { getUserDB, openDatabase } from "./common";
import { appDataDBVersion, userPreferencesObjectStore } from "./config";

export const getPreference = (key) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    getPreferenceHelper(db, key)
  );

const getPreferenceHelper = (db, key) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(userPreferencesObjectStore, "readonly");
    const objectStore = transaction.objectStore(userPreferencesObjectStore);
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
export const putPreference = (data) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    putPreferenceHelper(db, data)
  );

const putPreferenceHelper = (db, data) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(userPreferencesObjectStore, "readwrite");
    const objectStore = transaction.objectStore(userPreferencesObjectStore);
    const request = objectStore.put(data);
    request.onsuccess = (event) => resolve(event);
    request.onerror = (error) => reject(new Error(error));
  });

export const getPreferenceWithDefault = (data) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    getPreferenceWithDefaultHelper(db, data)
  );

const getPreferenceWithDefaultHelper = (db, data) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(userPreferencesObjectStore, "readonly");
    const objectStore = transaction.objectStore(userPreferencesObjectStore);
    const request = objectStore.get(data.key);
    request.onsuccess = (event) => {
      const value = event.target.result;
      if (value === undefined) {
        const transaction = db.transaction(
          userPreferencesObjectStore,
          "readwrite"
        );
        const objectStore = transaction.objectStore(userPreferencesObjectStore);
        const request = objectStore.add(data);
        request.onsuccess = resolve(data);
        request.onerror = (error) => reject(new Error(error));
      } else {
        resolve(value);
      }
    };
    request.onerror = (error) => reject(new Error(error));
  });

export const deletePreference = (id) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    deletePreferenceHelper(db, id)
  );

const deletePreferenceHelper = (db, id) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(userPreferencesObjectStore, "readwrite");
    const objectStore = transaction.objectStore(userPreferencesObjectStore);
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
