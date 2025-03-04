import { filesObjectStore, userDBVersion } from "./config";
import { openDatabase, getNewId, getUserDB } from "./common";
import { convertZipFileToObjectResource as getObjectFromEpub } from "../../features/files/fileUtils";
import { processEpub } from "../../features/epub/epubUtils";

export const addEpub = (file) =>
  new Promise((resolve, reject) => {
    if (!file || file?.type !== "application/epub+zip") {
      console.log(`Cannot add file: Missing file or not an epub`);
      return reject(new Error("File is falsy or not an epub"));
    }
    getObjectFromEpub(file).then((object) => {
      const epubObject = processEpub(object);
      const data = { blob: file, epubObject };
      addFile(data).then(resolve);
    });
  });

const addFile = (data) =>
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
