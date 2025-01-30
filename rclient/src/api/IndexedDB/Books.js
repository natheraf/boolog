import config from "./config";
import { openDatabase } from "./common";
import { handleSimpleRequest } from "../Axios";

const getUserDB = () => `user${localStorage.getItem("userId")}`;
const userDataDBVersion = config.userDBVersion;

/**
 *
 * @param {Array<Object>} actions
 */
const clientActions = (actions) =>
  new Promise((resolve, reject) =>
    Promise.all(
      actions.map(
        (obj) =>
          new Promise((resolve, reject) => {
            if (obj.action === "delete") {
              deleteBook({ id: obj.entryId }, "id").then(resolve);
            } else if (obj.action === "update") {
              getBook("id", obj.entryId).then((res) => {
                res.cloud = {
                  lastSynced: obj.lastSynced,
                  id: obj.cloudId,
                };
                setBook(res, true).then(resolve);
              });
            }
          })
      )
    ).then(() => {
      console.log("gone through all client actions");
      resolve();
    })
  );

const syncMultipleToCloud = (data) =>
  new Promise((resolve, reject) => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      return resolve();
    }
    handleSimpleRequest(
      "POST",
      {
        data: data.map((entry) => {
          if (
            entry.hasOwnProperty("cloud") === false ||
            typeof entry.cloud !== "object"
          ) {
            entry.cloud = { shelf: "books" };
          } else {
            entry.cloud.shelf = "books";
          }
          return entry;
        }),
      },
      "lists/put/multiple"
    )
      .then((res) => {
        console.log(res.data);
        clientActions(res.data.clientActions).then(resolve);
      })
      .catch((error) => reject(new Error(error)));
  });

const addBook = (obj) => {
  return openDatabase(getUserDB(), userDataDBVersion, (db) =>
    addBookHelper(db, obj)
  );
};

const addBookHelper = (db, obj) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("books", "readwrite");
    const objectStore = transaction.objectStore("books");
    const request = objectStore.add(obj);
    request.onsuccess = (event) => {
      obj.id = event.target.result;
      syncMultipleToCloud([obj])
        .then(() => {
          console.log("book add request completed successfully");
          resolve(event.target.result);
        })
        .catch((error) => console.log(error));
    };
    request.onerror = () => {
      console.log("Request Error", request.error);
      reject(new Error(`Request Error: ${request.error}`));
    };
  });

/**
 * Get all books that match key value pairs
 * @param {String} [key] leave blank to get all books
 * @param {String} [value]
 * @returns {Promise<Array>}
 */
export const getAllBooks = (key, value) => {
  return openDatabase(getUserDB(), userDataDBVersion, (db) =>
    getAllBooksHelper(db, key, value)
  );
};

const getAllBooksHelper = (db, key, value) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("books", "readonly");
    transaction.oncomplete = (event) => {
      console.log("got all books successfully");
    };
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore("books");
    if (key === undefined) {
      objectStore.getAll().onsuccess = (event) => {
        resolve(event.target.result);
      };
    } else if (value === undefined) {
      reject(new Error("if key is defined, value cannot be undefined"));
    } else {
      objectStore.index(key).getAll(value).onsuccess = (res) => resolve(res);
    }
  });

export const setBook = (data, localOnly) =>
  new Promise((resolve, reject) => {
    if (data.isbn !== undefined) {
      Promise.all(data.isbn.map((isbn) => isISBNDuplicate(data.id, isbn))).then(
        (arrayOfResults) => {
          const duplicateISBNs = data.isbn.filter(
            (isbn, index) => arrayOfResults[index]
          );
          if (duplicateISBNs.length > 0) {
            reject(new Error(`Duplicate ISBNs found: ${duplicateISBNs}`));
          } else {
            openDatabase(getUserDB(), userDataDBVersion, (db) =>
              setBookHelper(db, data, localOnly)
            ).then((res) => resolve(res));
          }
        }
      );
    } else {
      openDatabase(getUserDB(), userDataDBVersion, (db) =>
        setBookHelper(db, data, localOnly)
      ).then((res) => resolve(res));
    }
  });

/**
 *
 * @todo refactor so fallback from id to alternative identifications is not unreadable
 * @param {IDBDatabase} db
 * @param {Object} data
 * @param {boolean=} localOnly if true,
 * @returns {Number} id of book
 */
const setBookHelper = (db, data, localOnly) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("books", "readwrite");
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const updatedBook = (event) => {
      console.log("updated book");
      if (localOnly !== true) {
        syncMultipleToCloud([data]);
      }
      resolve(event.target.result); // returns id of book
    };
    const objectStore = transaction.objectStore("books");
    data.id = data.id ?? -1;
    const request = objectStore.get(data.id);
    request.onsuccess = (event) => {
      const result = event.target.result;
      if (result !== undefined) {
        data.id = result.id;
        const requestUpdate = objectStore.put(data);
        requestUpdate.onsuccess = updatedBook;
      } else {
        const index = objectStore.index("xId");
        const request = index.get(IDBKeyRange.only(data.xId ?? "-1"));
        request.onsuccess = (event) => {
          const result = event.target.result;
          if (result !== undefined) {
            data.id = result.id;
            const requestUpdate = objectStore.put(data);
            requestUpdate.onsuccess = updatedBook;
          } else {
            console.log("no book found to update, adding book...");
            delete data.id;
            addBook(data).then((data) => resolve(data)); // returns id of book
          }
        };
      }
    };
  });

/**
 * Get a single book that have the key and value given
 * @param {String} key id or isbn
 * @param {String} value
 * @returns {Object}
 */
export const getBook = (key, value) =>
  openDatabase(getUserDB(), userDataDBVersion, (db) =>
    getBookHelper(db, key, value)
  );

/**
 *
 * @todo refactor so fallback from id to alternative identifications is not unreadable
 * @param {IDBDatabase} db
 * @param {string} key
 * @param {string} value
 * @returns {Number} id of book
 */
const getBookHelper = (db, key, value) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("books", "readwrite");
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore("books");
    if (value === undefined) {
      reject(new Error("value cannot be empty or undefined if key isn't"));
    } else if (key === "id") {
      objectStore.get(value).onsuccess = (event) => {
        const data = event.target.result;
        resolve(data);
      };
    } else {
      const index = objectStore.index(key);
      const request = index.get(IDBKeyRange.only(value));
      request.onsuccess = (event) => {
        const data = event.target.result;
        resolve(data);
      };
    }
  });

export const deleteBook = (obj, uid) => {
  return openDatabase(getUserDB(), userDataDBVersion, (db) =>
    deleteBookHelper(db, obj, uid)
  );
};

const deleteBookHelper = (db, obj, uid) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("books", "readwrite");
    const objectStore = transaction.objectStore("books");
    let request;
    if (uid === "isbn") {
      const index = objectStore.index("isbn");
      const isbn = obj.isbn[0];
      request = index.get(isbn);
    } else {
      request = objectStore.get(obj.id);
    }
    request.onsuccess = (event) => {
      const data = event.target.result;
      if (data !== undefined) {
        objectStore.delete(data.id);
      }
    };
    resolve();
  });

/**
 *
 * @param {String} id
 * @param {String} ISBN
 * @returns {Boolean} Is duplicate?
 */
const isISBNDuplicate = (id, ISBN) =>
  openDatabase(getUserDB(), userDataDBVersion, (db) =>
    isISBNDuplicateHelper(db, id, ISBN)
  );

const isISBNDuplicateHelper = (db, id, ISBN) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("books", "readwrite");
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore("books");
    const index = objectStore.index("isbn");
    index.get(ISBN).onsuccess = (event) => {
      const data = event.target.result;
      resolve(data === undefined ? false : data.id !== id);
    };
  });

export const indexedDBBooksInterface = {
  getBook,
  getAllBooks,
  setBook,
  deleteBook,
};
