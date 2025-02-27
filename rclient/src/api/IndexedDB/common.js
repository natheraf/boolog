import { userTemplates } from "../Local";
import { filesObjectStore, shelvesObjectStore } from "./config";

const connect = (name, version) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    if (name === "appData") {
      request.onupgradeneeded = appDataDBOnUpgradeNeeded;
    } else {
      // some user's data
      request.onupgradeneeded = userDataDBOnupgradeNeeded;
    }
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      alert("Database is outdated, please reload the page.");
  });
};

const userDataDBOnupgradeNeeded = function (event) {
  const db = event.target.result;
  switch (event.oldVersion) {
    case 0:
      const shelves = db.createObjectStore(shelvesObjectStore, {
        keyPath: "_id",
      });
      shelves.createIndex("title", "title");
      shelves.createIndex("author", "author");
      shelves.createIndex("publisher", "publisher");
      shelves.createIndex("year", "year");
      shelves.createIndex("isbn", "isbn", { multiEntry: true });
      shelves.createIndex("xId", "xId");
      shelves.createIndex("deleted", "deleted");
      shelves.createIndex("status", "status");
      shelves.createIndex("shelf", "shelf");

      const files = db.createObjectStore(filesObjectStore, {
        keyPath: "_id",
      });
  }
};

const appDataDBOnUpgradeNeeded = function (event) {
  const db = event.target.result;
  switch (event.oldVersion) {
    case 0:
      const users = db.createObjectStore("users", {
        keyPath: "id",
        autoIncrement: true,
      });
      users.put({ ...userTemplates[0], lastSynced: -1 });

      const state = db.createObjectStore("state", {
        keyPath: "id",
        autoIncrement: true,
      });
      state.createIndex("key", "key");
      state.put({ key: "userId", userId: 1 });
  }
};

export const openDatabase = async (name, version, crudFn) => {
  let db;
  try {
    db = await connect(name, version);
    return await crudFn(db);
  } finally {
    if (db) {
      db.close();
    }
  }
};

export const getNewId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export const getUserDB = () => `user${localStorage.getItem("userId")}`;
