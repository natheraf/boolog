import {
  dotNotationArrayToStandard,
  getLevelDotNotation,
  fillInObject,
} from "../utils";
import { getUserDB, openDatabase } from "./common";
import { appDataDBVersion, epubDataObjectStore } from "./config";

export const epubDotNotationDepth = {
  root: 1,
  memos: 1,
  notes: 2,
};

export const deleteEpubData = (data, localOnly) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    deleteEpubDataHelper(db, data, localOnly)
  );

const deleteEpubDataHelper = (db, data, localOnly) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(epubDataObjectStore, "readwrite");
    const objectStore = transaction.objectStore(epubDataObjectStore);
    const request = objectStore.delete(data.key);
    request.onerror = (error) => reject(new Error(error));
    request.onsuccess = () => {
      // if (localOnly !== true) {
      //   syncMultipleToCloud([data]);
      // }
      resolve();
    };
  });

export const updateEpubDataInDotNotation = (object) => {
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    updateEpubDataInDotNotationHelper(db, object)
  );
};

const updateEpubDataInDotNotationHelper = (db, object) =>
  new Promise((resolve, reject) => {
    const dotNotation = getEpubDataIndexedDBDotNotation(object);
    const values = Object.values(dotNotation);
    const resolves = [...Array(values.length)];
    const promises = [...Array(values.length)].map(
      (_, index) =>
        new Promise((resolve, reject) => (resolves[index] = resolve))
    );
    const onError = (error) => reject(new Error(error));
    for (let index = 0; index < values.length; index += 1) {
      const value = values[index];
      const transaction = db.transaction(epubDataObjectStore, "readwrite");
      const objectStore = transaction.objectStore(epubDataObjectStore);
      const request = objectStore.put(value);
      resolves[index](value);
      request.onerror = onError;
      request.onsuccess = (event) => resolves[index](event.target.result);
    }
    Promise.allSettled(promises).then(resolve);
  });

export const getEpubDataIndexedDBDotNotation = (object) => {
  const root = object.key;
  delete object.key;
  const dotNotation = getLevelDotNotation(object, epubDotNotationDepth, root);
  for (const [key, value] of Object.entries(dotNotation)) {
    if (typeof value !== "object") {
      dotNotation[key] = { value };
    }
    dotNotation[key].key = key;
    dotNotation[key].entryId = root;
  }
  return dotNotation;
};

/**
 *
 * @param {string} entryId
 * @returns {Promise<Array<{}>>}
 */
const getIndexedDBDotNotationEpubData = (entryId) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    getIndexedDBDotNotationEpubDataHelper(db, entryId)
  );

const getIndexedDBDotNotationEpubDataHelper = (db, entryId) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(epubDataObjectStore, "readonly");
    const objectStore = transaction.objectStore(epubDataObjectStore);
    const index = objectStore.index("entryId");
    const request = index.getAll(entryId);
    const onError = (error) => reject(new Error(error));
    request.onerror = onError;
    request.onsuccess = (event) => {
      const result = event.target.result;
      resolve(result);
    };
  });

export const getEpubDataWithDefaultInDotNotation = (entryId, defaultObject) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    getEpubDataWithDefaultInDotNotationHelper(db, entryId, defaultObject)
  );

const getEpubDataWithDefaultInDotNotationHelper = (
  db,
  entryId,
  defaultObject
) =>
  new Promise((resolve, reject) => {
    getIndexedDBDotNotationEpubData(entryId).then((values) => {
      const res = Object.assign(
        defaultObject,
        dotNotationArrayToStandard(values)
      );
      const memos = res.memos;
      for (const [key, memo] of Object.entries(memos)) {
        delete memos[key];
        memos[memo.selectedText] = memo;
      }
      resolve(res);
    });
  });

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
