import { fileObjectStore, userDBVersion } from "./config";
import { openDatabase } from "./common";
import { handleSimpleRequest } from "../Axios";

const getUserDB = () => `user${localStorage.getItem("userId")}`;

const getNewId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export const addFile = (file, localOnly) =>
  openDatabase(getUserDB(), userDBVersion, (db) =>
    addFileHelper(db, file, localOnly)
  );

const addFileHelper = (db, file, localOnly) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(fileObjectStore, "readwrite");
    const objectStore = transaction.objectStore(fileObjectStore);
    file._id = getNewId();
    const request = objectStore.add(file);
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
    const transaction = db.transaction(fileObjectStore, "readonly");
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore(fileObjectStore);
    const request = objectStore.get(id);
    request.onsuccess = (event) => {
      const data = event.target.result;
      resolve(data);
    };
  });

export const exportFile = (itemId) =>
  getFile(itemId).then((res) => {
    const url = window.URL.createObjectURL(res);
    const tempLink = document.createElement("a");
    tempLink.href = url;
    tempLink.setAttribute("download", res.name);
    tempLink.click();
  });
