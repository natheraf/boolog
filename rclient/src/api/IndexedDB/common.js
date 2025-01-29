import { userTemplates } from "../Local";

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
      const userBooks = db.createObjectStore("books", {
        keyPath: "id",
        autoIncrement: true,
      });
      userBooks.createIndex("title", "title");
      userBooks.createIndex("author", "author");
      userBooks.createIndex("publisher", "publisher");
      userBooks.createIndex("year", "year");
      userBooks.createIndex("isbn", "isbn", { multiEntry: true });
      userBooks.createIndex("xId", "xId");
      userBooks.createIndex("deleted", "deleted");
      userBooks.createIndex("status", "status");
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
      users.put(userTemplates[0]);
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
