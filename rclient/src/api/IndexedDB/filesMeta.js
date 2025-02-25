import { filesMetaObjectStore, userDBVersion } from "./config";
import { openDatabase, getUserDB, getNewId } from "./common";
import {
  addFile as importFile,
  getFile as getFileBlob,
  exportFile as exportBlob,
} from "./Files";

export const addFile = (file, localOnly) =>
  openDatabase(getUserDB(), userDBVersion, (db) =>
    addFileHelper(db, file, localOnly)
  );

const addFileHelper = (db, file, localOnly) =>
  new Promise((resolve, reject) => {
    importFile(file)
      .then((res) => {
        const fileId = res.target.result;
        const transaction = db.transaction(filesMetaObjectStore, "readwrite");
        const objectStore = transaction.objectStore(filesMetaObjectStore);
        const object = { fileId, _id: getNewId() };
        const request = objectStore.add(object);
        request.onsuccess = (event) => {
          console.log("Added file's metadata!");
          resolve(event);
        };
        request.onerror = () => {
          console.log("Request Error", request.error);
          reject(new Error(`Request Error: ${request.error}`));
        };
      })
      .catch((error) => {
        console.log("Request Error", error);
        reject(new Error(`Request Error: ${error}`));
      });
  });

const getBlobId = (id) =>
  openDatabase(getUserDB(), userDBVersion, (db) => getBlobIdHelper(db, id));

const getBlobIdHelper = (db, id) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(filesMetaObjectStore, "readonly");
    const objectStore = transaction.objectStore(filesMetaObjectStore);
    const request = objectStore.get(id);

    request.onsuccess = (event) => {
      const fileMeta = event.target.result;
      resolve(fileMeta.fileId);
    };
    request.onerror = () => {
      console.log("Request Error", request.error);
      reject(new Error(`Request Error: ${request.error}`));
    };
  });

export const getFile = (id) =>
  new Promise((resolve, reject) => {
    getBlobId(id)
      .then((blobId) => {
        getFileBlob(blobId).then((data) => resolve(data));
      })
      .catch((error) => {
        console.log(error);
        reject(new Error(`Request Error: ${error}`));
      });
  });

export const exportFile = (id) => {
  getBlobId(id).then((blobId) => exportBlob(blobId));
};
