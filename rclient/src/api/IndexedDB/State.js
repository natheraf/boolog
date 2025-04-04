import { openDatabase } from "./common";
import { appDataDBVersion } from "./config";
import { addUser, getAllUsers, getUser } from "./Users";
import { getGoogleFonts as downloadGoogleFonts } from "../GoogleAPI";

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
    const request = objectStore.get("userId");
    const getUserFromId = async (event) => {
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
    request.onsuccess = getUserFromId;
    request.onerror = getUserFromId;
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
        console.log("changed user successfully");
      };
      transaction.onerror = (event) => {
        console.error("Transaction Error", event);
        reject(new Error(event));
      };
      const objectStore = transaction.objectStore("state");
      const request = objectStore.get("userId");
      request.onsuccess = (event) => {
        const data = event.target.result;
        data.userId = result.id;
        const updateRequest = objectStore.put(data);
        updateRequest.onsuccess = (event) => {
          resolve(result.id);
        };
      };
    });
  });

export const getGoogleFonts = () =>
  openDatabase("appData", appDataDBVersion, (db) => getGoogleFontsHelper(db));

const getGoogleFontsHelper = (db) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction("state", "readonly");
    const objectStore = transaction.objectStore("state");
    const request = objectStore.get("googleFonts");
    request.onsuccess = (event) => {
      const result = event.target.result;
      if (result === undefined) {
        downloadGoogleFonts()
          .then((res) => {
            const transaction = db.transaction("state", "readwrite");
            const objectStore = transaction.objectStore("state");
            const request = objectStore.put({ key: "googleFonts", value: res });
            request.onsuccess = () => resolve(res);
            request.onerror = (error) => reject(new Error(error));
          })
          .catch((error) => reject(new Error(error)));
      } else {
        resolve(result.value);
      }
    };
    request.onerror = (error) => reject(new Error(error));
  });
