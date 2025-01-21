import { openDatabase } from "./common";
import { appDataDBVersion } from "./config";
import { addUser, getAllUsers, getUser } from "./Users";

export const getCurrentUser = () =>
  openDatabase("appData", appDataDBVersion, (db) => getCurrentUserHelper(db));

const getCurrentUserHelper = (db) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("state", "readonly");
    transaction.oncomplete = (event) => {
      console.log("got user successfully");
    };
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore("state");
    const indexKey = objectStore.index("key");
    const request = async (event) => {
      let userIdState = event?.target?.result ?? {
        // if state in appdata is cleared
        key: "userId",
        userId: 1,
      };
      getUser(userIdState.userId).then((result) => {
        // if no user found with state userId
        if (result === undefined) {
          getAllUsers().then((result) => {
            // if there are no users, create our own
            if (result.length === 0) {
              addUser("user1").then((result) => {
                userIdState.userId = result;
                const updateRequest = db
                  .transaction("state", "readwrite")
                  .objectStore("state")
                  .put(userIdState);
                updateRequest.onsuccess = (event) => {
                  resolve({ id: result, name: "user1" });
                  console.log("No users found, created one");
                };
              });
            } else {
              // if there is a user, fallback on the first one
              userIdState.userId = result[0].id;
              const updateRequest = db
                .transaction("state", "readwrite")
                .objectStore("state")
                .put(userIdState);
              updateRequest.onsuccess = (event) => {
                resolve(result[0]);
                console.log("User not found, switched to first one");
              };
            }
          });
          return;
        }
        resolve(result);
      });
    };
    indexKey.get("userId").onsuccess = request;
    indexKey.get("userId").onerror = request;
  });

export const getCurrentUserId = () =>
  new Promise((resolve, reject) =>
    getCurrentUser().then((user) => resolve(user.id))
  );

export const changeUser = (id) =>
  openDatabase("appData", appDataDBVersion, (db) => changeUserHelper(db, id));

const changeUserHelper = (db, id) =>
  new Promise((resolve, reject) => {
    getUser(id).then((result) => {
      if (result === undefined) {
        console.log("user not found, missing id");
        return;
      }
      const transaction = db.transaction("state", "readwrite");
      transaction.oncomplete = (event) => {
        console.log("got all users successfully");
      };
      transaction.onerror = (event) => {
        console.error("Transaction Error", event);
        reject(new Error(event));
      };
      const objectStore = transaction.objectStore("state");
      const index = objectStore.index("key");
      const request = index.get("userId");
      request.onsuccess = (event) => {
        const data = event.target.result;
        data.userId = result.id;
        const updateRequest = objectStore.put(data);
        updateRequest.onsuccess = (event) => {
          if (event.target.result) {
            resolve(event.target.result);
          }
          window.location.reload();
        };
      };
    });
  });
