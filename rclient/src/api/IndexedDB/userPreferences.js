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

/**
 * Will update the key and values present in data object
 * @param {object} data
 * @returns
 */
export const updatePreference = (data) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    updatePreferenceHelper(db, data)
  );

const updatePreferenceHelper = (db, data) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(userPreferencesObjectStore, "readonly");
    const objectStore = transaction.objectStore(userPreferencesObjectStore);
    const request = objectStore.get(data.key);
    const handleError = (error) => reject(new Error(error));
    request.onsuccess = (event) => {
      const oldData = event.target.result;
      const transaction = db.transaction(
        userPreferencesObjectStore,
        "readwrite"
      );
      const objectStore = transaction.objectStore(userPreferencesObjectStore);
      const request = objectStore.put({ ...oldData, ...data });
      request.onsuccess = resolve;
      request.onerror = handleError;
    };
    request.onerror = handleError;
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
        request.onsuccess = () => resolve(data);
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
