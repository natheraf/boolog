import * as React from "react";
import { UserInfoContext } from "./UserInfo";
import { handleSimpleRequest } from "../api/Axios";
import {
  getAllBooks,
  setBook,
  syncMultipleToCloud,
} from "../api/IndexedDB/Books";

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
            book.hasOwnProperty("_lastSynced") === false ||
            remoteBooks.hasOwnProperty(book._id) === false ||
            remoteBooks[book._id]._lastSynced < book._lastSynced
          ) {
            entriesNeedCloudUpdate.push(book);
          } else if (remoteBooks[book._id]._lastSynced > book._lastSynced) {
            await setBook(remoteBooks[book._id], "id", true);
          }
          delete remoteBooks[book._id];
        }
        for (const book of Object.values(remoteBooks)) {
          console.log("setting book ", book._id);
          await setBook(book, "id", true);
        }
        console.log("updating cloud");
        await syncMultipleToCloud(entriesNeedCloudUpdate);
        console.log("finished sync");
        setIsLoading(false);
      });
    }
  }, []);

  if (isLoading) {
    return;
  }

  return children;
};
