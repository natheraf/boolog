import * as React from "react";
import { UserInfoContext } from "./UserInfo";
import { handleSimpleRequest } from "../api/Axios";
import {
  deleteBook,
  getAllBooks,
  setBook,
  syncMultipleToCloud,
} from "../api/IndexedDB/Books";
import { getCurrentUser } from "../api/IndexedDB/State";
import { updateLastSynced } from "../api/IndexedDB/Users";

export const Sync = ({ children }) => {
  const userInfoContext = React.useContext(UserInfoContext);
  const [isLoading, setIsLoading] = React.useState(
    userInfoContext.isLoggedIn()
  );

  React.useEffect(() => {
    if (userInfoContext.isLoggedIn()) {
      handleSimpleRequest("GET", {}, "lists/get/all").then(async (res) => {
        console.log("starting sync");
        const remoteShelves = res.data.response.shelves;
        const lastSync = (await getCurrentUser()).lastSynced;
        const lastCloudWritten = res.data.response.lastWritten;
        for (const [shelf, items] of Object.entries(remoteShelves)) {
          const obj = {};
          for (const item of items) {
            obj[item._id] = item;
          }
          remoteShelves[shelf] = obj;
        }
        const remoteBooks = remoteShelves.books ?? {};
        console.log("getting all books");
        const books = await getAllBooks();
        const entriesNeedCloudUpdate = [];
        for (const book of books) {
          if (
            remoteBooks.hasOwnProperty(book._id) === false &&
            lastCloudWritten >= book._lastUpdated
          ) {
            await deleteBook(book, "id", true);
          } else if (
            remoteBooks.hasOwnProperty(book._id) === false ||
            remoteBooks[book._id]._lastUpdated < book._lastUpdated
          ) {
            entriesNeedCloudUpdate.push(book);
          } else if (remoteBooks[book._id]._lastUpdated > book._lastUpdated) {
            await setBook(remoteBooks[book._id], "id", true);
          }
          delete remoteBooks[book._id];
        }
        for (const book of Object.values(remoteBooks)) {
          console.log("setting book ", book._id);
          await setBook(book, "id", true);
        }
        console.log("updating cloud");
        if (entriesNeedCloudUpdate.length > 0) {
          await syncMultipleToCloud(entriesNeedCloudUpdate);
        }
        console.log("finished sync");
        await updateLastSynced(Date.now());
        setIsLoading(false);
      });
    }
  }, []);

  if (isLoading) {
    return;
  }

  return children;
};
