const userDataDB = indexedDB.open("userData", 1);

userDataDB.onerror = function () {
  console.error("Error", userDataDB.error);
};

userDataDB.onsuccess = function () {
  const db = userDataDB.result;
  db.onversionchange = function () {
    db.close();
    alert("Database is outdated, please reload the page.");
  };
  // continue working with database using db object
};

userDataDB.onblocked = function () {
  alert("Database is outdated, please reload the page.");
};

userDataDB.onupgradeneeded = function (event) {
  const db = userDataDB.result;
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
      userBooks.createIndex("isbn", "isbn", { unique: true, multiEntry: true });
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

export const addBook = (obj) => {
  const db = userDataDB.result;
  const transaction = db.transaction("books", "readwrite");
  const objectStore = transaction.objectStore("books");
  const request = objectStore.add(obj);
  request.onsuccess = () =>
    console.log("book add request completed successfully");
  request.onerror = () => console.log("Request Error", request.error);
};

export const getAllBooks = (obj) => {
  const db = userDataDB.result;
  const transaction = db.transaction("books", "readonly");
  transaction.oncomplete = (event) => {
    console.log("got all books successfully");
  };
  transaction.onerror = (event) => {
    console.error("Transaction Error", event);
  };
  const objectStore = transaction.objectStore("books");
  objectStore.getAll().onsuccess = (event) => {
    return event.target.result;
  };
};

export const setBookStatus = (obj) => {
  const db = userDataDB.result;
  const transaction = db.transaction("books", "readwrite");
  const objectStore = transaction.objectStore("books");
  const index = objectStore.index("isbn");
  obj.isbn.forEach((isbn) => {
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
};

export const getBookStatus = (obj, setStatus) => {
  const db = userDataDB.result;
  const transaction = db.transaction("books", "readwrite");
  const objectStore = transaction.objectStore("books");
  const index = objectStore.index("isbn");
  if (obj.isbn !== undefined) {
    obj.isbn.forEach((isbn) => {
      const request = index.get(isbn);
      request.onsuccess = (event) => {
        const data = event.target.result;
        if (data !== undefined) {
          setStatus(data.status);
        }
      };
    });
  } else {
    // isbn not found
  }
};

export const deleteBook = (obj) => {
  const db = userDataDB.result;
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
};

export const indexedDBBooksInterface = {
  addBook,
  getAllBooks,
  setBookStatus,
  getBookStatus,
  deleteBook,
};

export const getBook = (id) => {
  const db = userDataDB.result;
  const transaction = db.transaction("books", "readonly");
  transaction.oncomplete = (event) => {
    console.log("book get successfully");
  };
  transaction.onerror = (event) => {
    console.error("Transaction Error", event);
  };
  const objectStore = transaction.objectStore("books");
  const request = objectStore.get(id);
  request.onsuccess = () =>
    console.log("book get request completed successfully", request.result);
  request.onerror = () => console.log("Request Error", request.error);
};

export const getTitles = () => {
  const db = userDataDB.result;
  const transaction = db.transaction("books", "readonly");
  transaction.oncomplete = (event) => {
    console.log("book get successfully");
  };
  transaction.onerror = (event) => {
    console.error("Transaction Error", event);
  };
  const objectStore = transaction.objectStore("books");
  // const index = objectStore.index("title");
  // index.openCursor().onsuccess = (event) => {
  //   const cursor = event.target.result;
  //   if (cursor) {
  //     // cursor.key is a name, like "Bill", and cursor.value is the whole object.
  //     console.log(cursor.value);
  //     cursor.continue();
  //   }
  // };
  objectStore.getAll().onsuccess = (event) => {
    console.log(event.target.result);
  };
  // request.onsuccess = () =>
  //   console.log("book get request completed successfully", request.result);
  // request.onerror = () => console.log("Request Error", request.error);
};

export const getInteresting = () => {
  const db = userDataDB.result;
  const transaction = db.transaction("books", "readonly");
  transaction.oncomplete = (event) => {
    console.log("book get successfully");
  };
  transaction.onerror = (event) => {
    console.error("Transaction Error", event);
  };
  const objectStore = transaction.objectStore("books");
  const index = objectStore.index("interesting");
  index.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      // cursor.key is a name, like "Bill", and cursor.value is the whole object.
      console.log(cursor.value);
      cursor.continue();
    }
  };
};
