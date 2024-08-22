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

const test = () => {
  addBook({
    title: "testTitle15",
    author: "testAuthor15",
    publisher: "testPublisher15",
    year: "testYear15",
    isbn: "testISBN15",
    cover_url: "testCover_url15",
    createdAt: "testCreatedAt15",
    updatedAt: "testUpdatedAt15",
    deleted: "testDeleted15",
    apiSource: "testApiSource15",
    apiEntry: { test: "testApiEntry15" },
    interesting: true,
  });
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

export const addBook = (obj) => {
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

export const getAllBooks = () => {
  return openDatabase(userDataDB, userDataDBVersion, (db) =>
    getAllBooksHelper(db)
  );
};

const getAllBooksHelper = (db) =>
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
    objectStore.getAll().onsuccess = (event) => {
      resolve(event.target.result);
    };
  });

export const setBookStatus = (obj) => {
  return openDatabase(userDataDB, userDataDBVersion, (db) =>
    setBookStatusHelper(db, obj)
  );
};

const setBookStatusHelper = (db, obj) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("books", "readwrite");
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore("books");
    const index = objectStore.index("isbn");
    const isbn = obj.isbn[0];
    const request = index.get(isbn);
    request.onsuccess = (event) => {
      const data = event.target.result;
      if (data !== undefined) {
        data.status = obj.status;
        const requestUpdate = objectStore.put(data);
        requestUpdate.onsuccess = () => console.log("updated book status");
        requestUpdate.onerror = () =>
          console.log("update book status error", requestUpdate.error);
      } else {
        addBook(obj);
      }
    };
  });

export const getBookStatus = (obj) => {
  return openDatabase(userDataDB, userDataDBVersion, (db) =>
    getBookStatusHelper(db, obj)
  );
};

const getBookStatusHelper = (db, obj) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("books", "readwrite");
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore("books");
    const index = objectStore.index("isbn");
    if (obj.isbn !== undefined) {
      obj.isbn.forEach((isbn) => {
        const request = index.get(isbn);
        request.onsuccess = (event) => {
          const data = event.target.result;
          if (data !== undefined) {
            resolve(data.status);
          }
        };
      });
    } else {
      // isbn not found
    }
  });

export const deleteBook = (obj) => {
  return openDatabase(userDataDB, userDataDBVersion, (db) =>
    deleteBookHelper(db, obj)
  );
};

const deleteBookHelper = (db, obj) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("books", "readwrite");
    const objectStore = transaction.objectStore("books");
    const index = objectStore.index("isbn");
    if (obj.isbn !== undefined) {
      obj.isbn.forEach((isbn) => {
        const request = index.get(isbn);
        request.onsuccess = (event) => {
          const data = event.target.result;
          if (data !== undefined) {
            objectStore.delete(data.id);
          }
        };
      });
    } else {
      // isbn not found
    }
  });

export const indexedDBBooksInterface = {
  addBook,
  getAllBooks,
  setBookStatus,
  getBookStatus,
  deleteBook,
};
