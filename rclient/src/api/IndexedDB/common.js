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
