import { getUserDB, openDatabase } from "./common";
import { appDataDBVersion, epubDataObjectStore } from "./config";

export const getEpubData = (key) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    getEpubDataHelper(db, key)
  );

const getEpubDataHelper = (db, key) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(epubDataObjectStore, "readonly");
    const objectStore = transaction.objectStore(epubDataObjectStore);
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
export const putEpubData = (data) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    putEpubDataHelper(db, data)
  );

const putEpubDataHelper = (db, data) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(epubDataObjectStore, "readwrite");
    const objectStore = transaction.objectStore(epubDataObjectStore);
    const request = objectStore.put(data);
    request.onsuccess = (event) => resolve(event);
    request.onerror = (error) => reject(new Error(error));
  });

/**
 * Will update the key and values present in data object
 * @param {object} data
 * @returns
 */
export const updateEpubData = (data) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    updateEpubDataHelper(db, data)
  );

const updateEpubDataHelper = (db, data) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(epubDataObjectStore, "readonly");
    const objectStore = transaction.objectStore(epubDataObjectStore);
    const request = objectStore.get(data.key);
    const handleError = (error) => reject(new Error(error));
    request.onsuccess = (event) => {
      const oldData = event.target.result;
      const transaction = db.transaction(epubDataObjectStore, "readwrite");
      const objectStore = transaction.objectStore(epubDataObjectStore);
      const request = objectStore.put({ ...oldData, ...data });
      request.onsuccess = resolve;
      request.onerror = handleError;
    };
    request.onerror = handleError;
  });

export const getEpubDataWithDefault = (data) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    getEpubDataWithDefaultHelper(db, data)
  );

const getEpubDataWithDefaultHelper = (db, data) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(epubDataObjectStore, "readonly");
    const objectStore = transaction.objectStore(epubDataObjectStore);
    const request = objectStore.get(data.key);
    request.onsuccess = (event) => {
      const value = event.target.result;
      if (value === undefined) {
        const transaction = db.transaction(epubDataObjectStore, "readwrite");
        const objectStore = transaction.objectStore(epubDataObjectStore);
        const request = objectStore.add(data);
        request.onsuccess = () => resolve(data);
        request.onerror = (error) => reject(new Error(error));
      } else {
        resolve(value);
      }
    };
    request.onerror = (error) => reject(new Error(error));
  });

export const deleteEpubData = (id) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    deleteEpubDataHelper(db, id)
  );

const deleteEpubDataHelper = (db, id) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(epubDataObjectStore, "readwrite");
    const objectStore = transaction.objectStore(epubDataObjectStore);
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
