import {
  userDBVersion as userDataDBVersion,
  shelvesObjectStore,
} from "./config";
import { openDatabase, getUserDB, getNewId } from "./common";
import { handleSimpleRequest } from "../Axios";
import { deleteFile, getFile } from "./Files";
import { addEpub } from "../../features/files/fileUtils";
import { deleteEpubData } from "./epubData";
import { getEpubValueFromPath } from "../../features/epub/epubUtils";

/**
 * @deprecated
 * @param {Array<Object>} actions
 */
const clientActions = (actions) =>
  new Promise((resolve, reject) =>
    Promise.all(
      actions.map(
        (obj) =>
          new Promise((resolve, reject) => {
            if (obj.action === "update") {
              getBook("id", obj.entryId)
                .then((res) => {
                  res._lastUpdated = obj.lastUpdated;
                  setBook(res, "id", true).then(resolve);
                })
                .catch((error) => console.log(error));
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
      .then(resolve)
      .catch((error) => reject(new Error(error)));
  });

export const addBookFromEpub = (file) =>
  new Promise((resolve, reject) => {
    addEpub(file).then((res) => {
      const fileId = res.target.result;
      getFile(fileId).then((data) => {
        const metadata = data.epubObject.metadata;
        const bookObj = {
          title: metadata.common.title.value,
          authors: metadata.common.authors.value,
          publisher: metadata.publisher?.value
            ? [metadata.publisher?.value]
            : [],
          words: metadata.common.words.value,
          status: "Reading",
          api_source: "Local",
          xId: metadata.common.uId.value,
          fileId,
          cover_url: metadata.common.cover.value,
        };
        addBook(bookObj).then(resolve);
      });
    });
  });

const addBook = (obj, localOnly) => {
  return openDatabase(getUserDB(), userDataDBVersion, (db) =>
    addBookHelper(db, obj, localOnly)
  );
};

const addBookHelper = (db, obj, localOnly) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(shelvesObjectStore, "readwrite");
    const objectStore = transaction.objectStore(shelvesObjectStore);
    obj.shelf = "books";
    obj._id = obj._id ?? getNewId();
    const request = objectStore.add(obj);
    request.onsuccess = (event) => {
      if (localOnly) {
        console.log("book add request completed successfully");
        return resolve(event.target.result);
      }
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

export const addUrlsToLocalBooks = (books) =>
  new Promise((resolve, reject) =>
    Promise.all(
      books.map(
        (book) =>
          new Promise((resolve, reject) => {
            if (
              book.api_source !== "Local" ||
              book.hasOwnProperty("fileId") === false
            ) {
              return resolve();
            }
            getFile(book.fileId).then((data) => {
              if (
                !data ||
                book.cover_url === null ||
                book.cover_url.length === 0
              ) {
                return resolve();
              }
              const cover = getEpubValueFromPath(
                data.epubObject.images,
                book.cover_url
              );
              book.cover_url = URL.createObjectURL(cover);
              resolve();
            });
          })
      )
    ).then(resolve)
  );

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
      objectStore.index("shelf").getAll("books").onsuccess = (event) =>
        resolve(event.target.result);
    } else if (value === undefined) {
      reject(new Error("if key is defined, value cannot be undefined"));
    } else {
      objectStore.index(key).getAll(value).onsuccess = (books) =>
        resolve(books);
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
      Promise.all(
        data.isbn.map((isbn) => isISBNDuplicate(data._id, isbn))
      ).then((arrayOfResults) => {
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
      });
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
    if (localOnly !== true) {
      data._lastUpdated = Date.now();
    }
    const objectStore = transaction.objectStore(shelvesObjectStore);
    const request =
      key === "_id"
        ? objectStore.get(data._id ?? -1)
        : objectStore.index(key).get(IDBKeyRange.only(data[key] ?? -1));
    request.onsuccess = (event) => {
      const result = event.target.result;
      if (result !== undefined) {
        data._id = result._id;
        const requestUpdate = objectStore.put(data);
        requestUpdate.onsuccess = updatedBook;
      } else {
        const index = objectStore.index("xId");
        const request = index.get(IDBKeyRange.only(data.xId ?? "-1"));
        request.onsuccess = (event) => {
          const result = event.target.result;
          if (result !== undefined) {
            data._id = result._id;
            const requestUpdate = objectStore.put(data);
            requestUpdate.onsuccess = updatedBook;
          } else {
            console.log("no book found to update, adding book...");
            addBook(data, localOnly).then((data) => resolve(data)); // returns id of book
          }
        };
      }
    };
  });

export const setBookWithFile = (entry, file, key, localOnly) => {
  const goSetBook = () => setBook(entry, key, localOnly);
  if (
    file?.hasOwnProperty("blob") ||
    (file === null && entry.hasOwnProperty("fileId") === false)
  ) {
    return goSetBook();
  }
  return new Promise((resolve, reject) => {
    const addFileAndSetBook = () => {
      addEpub(file).then((res) => {
        const insertedId = res.target.result;
        entry.fileId = insertedId;
        goSetBook().then(resolve);
      });
    };
    if (entry.hasOwnProperty("fileId")) {
      deleteFile(entry.fileId).then(() => {
        if (file === null) {
          delete entry.fileId;
          return goSetBook().then(resolve);
        }
        addFileAndSetBook();
      });
    } else {
      addFileAndSetBook();
    }
  });
};

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
    const transaction = db.transaction(shelvesObjectStore, "readonly");
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore(shelvesObjectStore);
    if (value === undefined) {
      reject(new Error("value cannot be empty or undefined if key isn't"));
    } else if (key === "_id") {
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

export const deleteBook = (obj, uid, localOnly) => {
  return openDatabase(getUserDB(), userDataDBVersion, (db) =>
    deleteBookHelper(db, obj, uid, localOnly)
  );
};

const deleteBookHelper = (db, obj, uid, localOnly) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(shelvesObjectStore, "readonly");
    const objectStore = transaction.objectStore(shelvesObjectStore);
    let request;
    if (uid === "isbn") {
      const index = objectStore.index("isbn");
      const isbn = obj.isbn[0];
      request = index.get(isbn);
    } else {
      request = objectStore.get(obj._id);
    }
    request.onsuccess = (event) => {
      const data = event.target.result;
      deleteFile(data.fileId).then(() =>
        deleteEpubData(data._id).then(() => {
          const transaction = db.transaction(shelvesObjectStore, "readwrite");
          const objectStore = transaction.objectStore(shelvesObjectStore);
          const request = objectStore.delete(data._id);
          request.onsuccess = () => {
            if (localOnly !== true) {
              data.deleted = true;
              syncMultipleToCloud([data]);
            }
            resolve();
          };
        })
      );
    };
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
    const transaction = db.transaction(shelvesObjectStore, "readonly");
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore(shelvesObjectStore);
    const index = objectStore.index("isbn");
    index.get(ISBN).onsuccess = (event) => {
      const data = event.target.result;
      resolve(data === undefined ? false : data._id !== id);
    };
  });

export const indexedDBBooksInterface = {
  getBook,
  getAllBooks,
  setBook,
  deleteBook,
};
