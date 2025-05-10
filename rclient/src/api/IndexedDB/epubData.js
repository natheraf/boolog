import { handleSimpleRequest } from "../Axios";
import { dotNotationArrayToStandard, getLevelDotNotation } from "../utils";
import { getUserDB, openDatabase } from "./common";
import { appDataDBVersion, epubDataObjectStore } from "./config";

export const epubDotNotationDepth = {
  root: 1,
  memos: 1,
  notes: 2,
};

const globalEpubDataKeys = ["epubGlobalFormatting"];

export const syncMultipleToCloud = (data, dotNotation) =>
  new Promise((resolve, reject) => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      return resolve();
    }
    handleSimpleRequest(
      "POST",
      {
        database: "userAppData",
        collection: "epubData",
        data,
      },
      dotNotation ? "generic/dotNotation/multiple" : "generic/update/multiple"
    )
      .then(resolve)
      .catch((error) => reject(new Error(error)));
  });

const syncDotNotationToCloud = (data) =>
  syncMultipleToCloud(
    structuredClone(data).map((entry) => {
      entry.key = entry.key.substring(
        entry.key.indexOf(".", entry.key.indexOf(entry.entryId)) + 1
      );
      return entry;
    }),
    true
  );

const dotNotationEpubObjectsArrayToStandard = (array) => {
  if (array.length === 0) {
    return {};
  }
  const rootKey = array[0].entryId;
  array.forEach((object) => delete object.entryId);
  const res = dotNotationArrayToStandard(array, true);
  res.key = rootKey;
  return res;
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
    const onError = (error) => reject(new Error(error));
    request.onerror = onError;
    request.onsuccess = (event) => {
      const lastUpdatedData = {
        entryId: data.entryId,
        key: `${data.entryId}._lastUpdated`,
        _lastUpdated: Date.now(),
      };
      const request = objectStore.put(lastUpdatedData);
      request.onerror = onError;
      request.onsuccess = () => {
        if (localOnly === true) {
          return resolve();
        }
        data.deleted = true;
        syncDotNotationToCloud([data, lastUpdatedData]).then(resolve);
      };
    };
  });

export const deleteAllEpubDataOfKey = (data, localOnly) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    deleteAllEpubDataOfKeyHelper(db, data, localOnly)
  );

const deleteAllEpubDataOfKeyHelper = (db, data, localOnly) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(epubDataObjectStore, "readwrite");
    const objectStore = transaction.objectStore(epubDataObjectStore);
    let request;
    if (globalEpubDataKeys.includes(data.key)) {
      if (localOnly !== true) {
        syncMultipleToCloud([{ deleted: true, key: data.key }]);
      }
      request = objectStore.openCursor(data.key);
    } else {
      if (localOnly !== true) {
        syncMultipleToCloud([
          { deleted: true, key: data.entryId, entryId: data.entryId },
        ]);
      }
      const index = objectStore.index("entryId");
      request = index.openCursor(data.entryId);
    }
    const onError = (error) => reject(new Error(error));
    request.onerror = onError;
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const deleteRequest = cursor.delete();
        deleteRequest.onerror = onError;
        deleteRequest.onsuccess = () => cursor.continue();
      } else {
        resolve();
      }
    };
  });

export const putCloudEpubData = async (object, localOnly) => {
  if (globalEpubDataKeys.includes(object.key)) {
    await putEpubData(object, true, localOnly);
  } else {
    await deleteAllEpubDataOfKey(object, localOnly);
    await updateEpubDataInDotNotation(object, localOnly);
  }
};

export const updateEpubDataInDotNotation = (object, localOnly) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    updateEpubDataInDotNotationHelper(db, object, localOnly)
  );

const updateEpubDataInDotNotationHelper = (db, object, localOnly) =>
  new Promise((resolve, reject) => {
    if (localOnly !== true) {
      object._lastUpdated = Date.now();
    }
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
    Promise.allSettled(promises).then(() => {
      if (localOnly !== true) {
        syncDotNotationToCloud(values);
      }
      resolve();
    });
  });

export const getEpubDataIndexedDBDotNotation = (object) => {
  const root = object.key;
  delete object.key;
  const dotNotation = getLevelDotNotation(object, epubDotNotationDepth, root);
  for (const [key, value] of Object.entries(dotNotation)) {
    if (typeof value !== "object") {
      dotNotation[key] = { [key.substring(key.lastIndexOf(".") + 1)]: value };
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
 * @param {boolean} globalEpubData
 * @param {boolean} localOnly
 * @returns
 */
export const putEpubData = (data, globalEpubData, localOnly) =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    putEpubDataHelper(db, data, globalEpubData, localOnly)
  );

const putEpubDataHelper = (db, data, globalEpubData, localOnly) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(epubDataObjectStore, "readwrite");
    const objectStore = transaction.objectStore(epubDataObjectStore);
    const onError = (error) => reject(new Error(error));
    if (globalEpubData) {
      data._lastUpdated = Date.now();
    }
    const request = objectStore.put(data);
    request.onerror = onError;
    request.onsuccess = (event) => {
      if (globalEpubData) {
        if (localOnly !== true) {
          syncMultipleToCloud([data], false);
        }
        return;
      }

      const lastUpdatedData = {
        entryId: data.entryId,
        key: `${data.entryId}._lastUpdated`,
        _lastUpdated: Date.now(),
      };
      const request = objectStore.put(lastUpdatedData);
      request.onerror = onError;
      request.onsuccess = () => {
        if (localOnly !== true) {
          syncDotNotationToCloud([data, lastUpdatedData]);
        }
        resolve(event);
      };
    };
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
        data._lastUpdated = Date.now();
        const request = objectStore.add(data);
        request.onsuccess = () => resolve(data);
        request.onerror = (error) => reject(new Error(error));
      } else {
        resolve(value);
      }
    };
    request.onerror = (error) => reject(new Error(error));
  });

/**
 * destructive
 * @param {object} data
 * @returns {object} same object as passed in
 */
export const localizeCloudEpubData = (data) => {
  data.key = data._id;
  delete data._id;
  return data;
};

export const getAllEpubDataWithLastUpdated = () =>
  openDatabase(getUserDB(), appDataDBVersion, (db) =>
    getAllEpubDataWithLastUpdatedHelper(db)
  );

const getAllEpubDataWithLastUpdatedHelper = (db) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(epubDataObjectStore, "readonly");
    const objectStore = transaction.objectStore(epubDataObjectStore);
    const index = objectStore.index("_lastUpdated");
    const request = index.getAll();
    const onError = (error) => reject(new Error(error));
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = onError;
  });

export const getWholeEpubData = async (key) => {
  if (globalEpubDataKeys.includes(key)) {
    return await getEpubData(key);
  } else {
    return dotNotationEpubObjectsArrayToStandard(
      await getIndexedDBDotNotationEpubData(key)
    );
  }
};
