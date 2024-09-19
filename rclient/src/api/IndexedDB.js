const userDataDB = "userData";
const userDataDBVersion = 1;

const connect = (name, version) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onupgradeneeded = userDataDBOnupgradeneeded;
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      alert("Database is outdated, please reload the page.");
  });
};

const userDataDBOnupgradeneeded = function (event) {
  const db = event.target.result;
  switch (event.oldVersion) {
    case 0:
      var userBooks = db.createObjectStore("books", {
        keyPath: "id",
        autoIncrement: true,
      });
      userBooks.createIndex("title", "title");
      userBooks.createIndex("author", "author");
      userBooks.createIndex("publisher", "publisher");
      userBooks.createIndex("year", "year");
      userBooks.createIndex("isbn", "isbn", { multiEntry: true });
      userBooks.createIndex("deleted", "deleted");
      userBooks.createIndex("status", "status");
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

const addBook = (obj) => {
  return openDatabase(userDataDB, userDataDBVersion, (db) =>
    addBookHelper(db, obj)
  );
};

const addBookHelper = (db, obj) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("books", "readwrite");
    const objectStore = transaction.objectStore("books");
    const request = objectStore.add(obj);
    request.onsuccess = () => {
      console.log("book add request completed successfully");
      resolve(request.result);
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
  return openDatabase(userDataDB, userDataDBVersion, (db) =>
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

export const setBook = (data) =>
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
            openDatabase(userDataDB, userDataDBVersion, (db) =>
              setBookHelper(db, data)
            ).then((res) => resolve(res));
          }
        }
      );
    } else {
      openDatabase(userDataDB, userDataDBVersion, (db) =>
        setBookHelper(db, data)
      ).then((res) => resolve(res));
    }
  });

const setBookHelper = (db, data) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("books", "readwrite");
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore("books");
    data.id = data.id ?? -1;
    const request = objectStore.get(data.id);
    request.onsuccess = (event) => {
      const result = event.target.result;
      if (result !== undefined) {
        data.id = result.id;
        const requestUpdate = objectStore.put(data);
        requestUpdate.onsuccess = () => console.log("updated book");
      } else {
        console.log("no book found to update, adding book...");
        delete data.id;
        addBook(data);
      }
      resolve(data);
    };
  });

/**
 * Get a single book that have the key and value given
 * @param {String} key Do not pass in id
 * @param {String} value
 * @returns {Promise<object>} Array of books
 */
export const getBook = (key, value) =>
  openDatabase(userDataDB, userDataDBVersion, (db) =>
    getBookHelper(db, key, value)
  );

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
      const request = index.get(value);
      request.onsuccess = (event) => {
        const data = event.target.result;
        resolve(data);
      };
    }
  });

export const deleteBook = (obj, uid) => {
  return openDatabase(userDataDB, userDataDBVersion, (db) =>
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
  openDatabase(userDataDB, userDataDBVersion, (db) =>
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
