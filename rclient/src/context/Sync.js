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
            obj[item.cloudId] = item;
          }
          remoteShelves[shelf] = obj;
        }
        const remoteBooks = remoteShelves.books ?? {};
        console.log("getting all books");
        const books = await getAllBooks();
        const entriesNeedCloudUpdate = [];
        for (const book of books) {
          if (
            book.hasOwnProperty("cloudId") === false ||
            remoteBooks.hasOwnProperty(book.cloudId) === false ||
            remoteBooks[book.cloudId].lastSynced < book.lastSynced
          ) {
            entriesNeedCloudUpdate.push(book);
          } else if (remoteBooks[book.cloudId].lastSynced > book.lastSynced) {
            await setBook(remoteBooks[book.cloudId], "cloudId", true);
          }
          delete remoteBooks[book.cloudId];
        }
        console.log(remoteBooks);
        for (const book of Object.values(remoteBooks)) {
          console.log("setting book ", book.cloudId);
          await setBook(book, "cloudId", true);
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
