import { getUserDB, openDatabase } from "./common";
import { appDataDBVersion, metadataObjectStore } from "./config";

export const getMetadata = (key) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    getMetadataHelper(db, key)
  );

const getMetadataHelper = (db, key) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(metadataObjectStore, "readonly");
    const objectStore = transaction.objectStore(metadataObjectStore);
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
export const putMetadata = (data) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    putMetadataHelper(db, data)
  );

const putMetadataHelper = (db, data) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(metadataObjectStore, "readwrite");
    const objectStore = transaction.objectStore(metadataObjectStore);
    const request = objectStore.put(data);
    request.onsuccess = (event) => resolve(event);
    request.onerror = (error) => reject(new Error(error));
  });

/**
 * Will update the key and values present in data object
 * @param {object} data
 * @returns
 */
export const updateMetadata = (data) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    updateMetadataHelper(db, data)
  );

const updateMetadataHelper = (db, data) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(metadataObjectStore, "readonly");
    const objectStore = transaction.objectStore(metadataObjectStore);
    const request = objectStore.get(data.key);
    const handleError = (error) => reject(new Error(error));
    request.onsuccess = (event) => {
      const oldData = event.target.result;
      const transaction = db.transaction(metadataObjectStore, "readwrite");
      const objectStore = transaction.objectStore(metadataObjectStore);
      const request = objectStore.put({ ...oldData, ...data });
      request.onsuccess = resolve;
      request.onerror = handleError;
    };
    request.onerror = handleError;
  });

export const getMetadataWithDefault = (data) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    getMetadataWithDefaultHelper(db, data)
  );

const getMetadataWithDefaultHelper = (db, data) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(metadataObjectStore, "readonly");
    const objectStore = transaction.objectStore(metadataObjectStore);
    const request = objectStore.get(data.key);
    request.onsuccess = (event) => {
      const value = event.target.result;
      if (value === undefined) {
        const transaction = db.transaction(metadataObjectStore, "readwrite");
        const objectStore = transaction.objectStore(metadataObjectStore);
        const request = objectStore.add(data);
        request.onsuccess = () => resolve(data);
        request.onerror = (error) => reject(new Error(error));
      } else {
        resolve(value);
      }
    };
    request.onerror = (error) => reject(new Error(error));
  });

export const deleteMetadata = (id) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    deleteMetadataHelper(db, id)
  );

const deleteMetadataHelper = (db, id) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(metadataObjectStore, "readwrite");
    const objectStore = transaction.objectStore(metadataObjectStore);
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
