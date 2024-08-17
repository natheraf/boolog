const userDataDB = indexedDB.open("userData", 8);

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
      userBooks.createIndex("isbn", "isbn");
      userBooks.createIndex("deleted", "deleted");
    case 7:
      var userBooks = db.objectStore("books");
      userBooks.createIndex("test", "test");
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
  transaction.oncomplete = (event) => {
    console.log("book added successfully");
  };
  transaction.onerror = (event) => {
    console.error("Transaction Error", event);
  };
  const objectStore = transaction.objectStore("books");
  const request = objectStore.add(obj);
  request.onsuccess = () =>
    console.log("book add request completed successfully");
  request.onerror = () => console.log("Request Error", request.error);
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
