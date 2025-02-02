import { userDBVersion, shelvesObjectStore } from "./config";
import { openDatabase } from "./common";
import { handleSimpleRequest } from "../Axios";

const getUserDB = () => `user${localStorage.getItem("userId")}`;
const userDataDBVersion = userDBVersion;

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
            if (obj.action === "update") {
              getBook("id", obj.entryId).then((res) => {
                res.lastSynced = obj.lastSynced;
                res.cloudId = obj.cloudId;
                setBook(res, "id", true).then(resolve);
              });
            }
          })
      )
    ).then(() => {
      console.log("gone through all client actions");
      resolve();
    })
  );

export const syncMultipleToCloud = (data) =>
  new Promise((resolve, reject) => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      return resolve();
    }
    handleSimpleRequest(
      "POST",
      {
        data,
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
    const transaction = db.transaction(shelvesObjectStore, "readwrite");
    const objectStore = transaction.objectStore(shelvesObjectStore);
    obj.shelf = "books";
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
    const transaction = db.transaction(shelvesObjectStore, "readonly");
    transaction.oncomplete = (event) => {
      console.log("got all books successfully");
    };
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore(shelvesObjectStore);
    if (key === undefined) {
      objectStore.index("shelf").getAll("books").onsuccess = (event) => {
        resolve(event.target.result);
      };
    } else if (value === undefined) {
      reject(new Error("if key is defined, value cannot be undefined"));
    } else {
      objectStore.index(key).getAll(value).onsuccess = (res) => resolve(res);
    }
  });

/**
 *
 * @param {Object} data
 * @param {string} key key to set book by
 * @param {boolean=} localOnly localOnly if true,
 * @returns
 */
export const setBook = (data, key, localOnly) =>
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
              setBookHelper(db, data, key, localOnly)
            ).then((res) => resolve(res));
          }
        }
      );
    } else {
      openDatabase(getUserDB(), userDataDBVersion, (db) =>
        setBookHelper(db, data, key, localOnly)
      ).then((res) => resolve(res));
    }
  });

/**
 *
 * @todo refactor so fallback from id to alternative identifications is not unreadable
 * @param {IDBDatabase} db
 * @param {Object} data
 * @param {string} key key to set book by
 * @param {boolean=} localOnly if true,
 * @returns {Number} id of book
 */
const setBookHelper = (db, data, key, localOnly) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(shelvesObjectStore, "readwrite");
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const updatedBook = (event) => {
      console.log("updated book");
      if (localOnly !== true) {
        syncMultipleToCloud([data]).then(() => {
          resolve(event.target.result); // returns id of book
        });
      } else {
        resolve(event.target.result);
      }
    };
    const objectStore = transaction.objectStore(shelvesObjectStore);
    data.id = data.id ?? -1;
    const request =
      key === "id"
        ? objectStore.get(data.id ?? -1)
        : objectStore.index(key).get(IDBKeyRange.only(data[key] ?? -1));
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
    const transaction = db.transaction(shelvesObjectStore, "readwrite");
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore(shelvesObjectStore);
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
    const transaction = db.transaction(shelvesObjectStore, "readwrite");
    const objectStore = transaction.objectStore(shelvesObjectStore);
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
      objectStore.delete(data.id);
      data.deleted = true;
      syncMultipleToCloud([data]);
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
    const transaction = db.transaction(shelvesObjectStore, "readwrite");
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore(shelvesObjectStore);
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
