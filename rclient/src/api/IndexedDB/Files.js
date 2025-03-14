import { filesObjectStore, userDBVersion } from "./config";
import { openDatabase, getNewId, getUserDB } from "./common";

export const addFile = (data) =>
  openDatabase(getUserDB(), userDBVersion, (db) => addFileHelper(db, data));

const addFileHelper = (db, data) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(filesObjectStore, "readwrite");
    const objectStore = transaction.objectStore(filesObjectStore);
    data._id = getNewId();
    const request = objectStore.add(data);
    request.onsuccess = (event) => {
      console.log("added file!");
      resolve(event);
    };
    request.onerror = () => {
      console.log("Request Error", request.error);
      reject(new Error(`Request Error: ${request.error}`));
    };
  });

export const getFile = (id) =>
  openDatabase(getUserDB(), userDBVersion, (db) => getFileHelper(db, id));

const getFileHelper = (db, id) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(filesObjectStore, "readonly");
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore(filesObjectStore);
    const request = objectStore.get(id);
    request.onsuccess = (event) => {
      const data = event.target.result;
      resolve(data);
    };
  });

export const exportFile = (id) =>
  getFile(id).then((res) => {
    const url = window.URL.createObjectURL(res.blob);
    const tempLink = document.createElement("a");
    tempLink.href = url;
    tempLink.setAttribute("download", res.blob.name);
    tempLink.click();
  });

export const deleteFile = (id) =>
  openDatabase(getUserDB(), userDBVersion, (db) => deleteFileHelper(db, id));

const deleteFileHelper = (db, id) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(filesObjectStore, "readwrite");
    const objectStore = transaction.objectStore(filesObjectStore);
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
