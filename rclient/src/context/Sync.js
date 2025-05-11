import * as React from "react";
import { UserInfoContext } from "./UserInfo";
import { handleSimpleRequest } from "../api/Axios";
import {
  deleteBook,
  getAllBooks,
  setBook,
  syncMultipleToCloud as syncMultipleBooksToCloud,
} from "../api/IndexedDB/Books";
import { getCurrentUser } from "../api/IndexedDB/State";
import { updateLastSynced } from "../api/IndexedDB/Users";
import {
  deleteAllEpubDataOfKey,
  getAllEpubDataWithLastUpdated,
  getWholeEpubData,
  localizeCloudEpubData,
  putCloudEpubData,
  syncMultipleToCloud as syncMultipleEpubDataToCloud,
} from "../api/IndexedDB/epubData";
import { arrayToMap } from "../api/utils";
import { getAllFiles } from "../api/IndexedDB/Files";
import {
  getOne as getOneFromDrive,
  sendOne as sendOneToDrive,
} from "../api/drive";
import { Loading } from "../features/loading/Loading";
import { Box } from "@mui/material";

export const Sync = ({ children }) => {
  const userInfoContext = React.useContext(UserInfoContext);
  const [isLoading, setIsLoading] = React.useState(
    userInfoContext.isLoggedIn()
  );

  React.useEffect(() => {
    if (userInfoContext.isLoggedIn()) {
      const resolves = [...Array(3)];
      const promises = [...Array(3)].map(
        (_e, index) =>
          new Promise((resolve, _reject) => (resolves[index] = resolve))
      );
      handleSimpleRequest("GET", {}, "drive/list/all")
        .then(async (driveList) => {
          driveList = driveList.data.list.files;
          const driveFileIds = new Map(
            driveList.map((driveFile) => [
              driveFile.appProperties.boologId,
              driveFile.id,
            ])
          );
          const localFiles = await getAllFiles();
          for (const localFile of localFiles) {
            if (driveFileIds.has(localFile._id) === false) {
              await sendOneToDrive(localFile);
              driveFileIds.delete(localFile._id);
            }
          }
          for (const [fileId, driveFileId] of driveFileIds.entries()) {
            await getOneFromDrive(driveFileId, fileId);
          }
        })
        .catch((error) => {
          if (
            error.status === 409 &&
            error.response.data.message === "Not signed in to Google"
          ) {
            console.error(error);
          } else {
            throw error;
          }
        })
        .finally(() => resolves[0]());

      handleSimpleRequest("GET", {}, "generic/get/all", {
        database: "userAppData",
        collection: "epubData",
      })
        .then(async (epubData) => {
          const lastCloudWritten = epubData.data.lastWritten;
          const remoteEpubData = arrayToMap(
            epubData.data.epubData.map(localizeCloudEpubData),
            "key"
          );
          const lastUpdatedTimestamps = await getAllEpubDataWithLastUpdated();
          const entriesNeedCloudUpdate = [];
          for (const localEntry of lastUpdatedTimestamps) {
            const key = localEntry.entryId ?? localEntry.key;
            if (
              remoteEpubData.has(key) === false &&
              lastCloudWritten >= localEntry._lastUpdated
            ) {
              console.log(localEntry, lastCloudWritten);
              await deleteAllEpubDataOfKey(localEntry, true);
            } else if (
              remoteEpubData.has(key) === false ||
              remoteEpubData.get(key)._lastUpdated < localEntry._lastUpdated
            ) {
              entriesNeedCloudUpdate.push(localEntry);
            } else if (
              remoteEpubData.get(key)._lastUpdated > localEntry._lastUpdated
            ) {
              await putCloudEpubData(remoteEpubData.get(key), true);
            }
            remoteEpubData.delete(key);
          }
          for (const remoteEntry of remoteEpubData.values()) {
            console.log("adding remote epub data to local db", remoteEntry);
            await putCloudEpubData(remoteEntry, true);
          }
          const epubDataNeedCloudUpdate = [];
          for (const localEntry of entriesNeedCloudUpdate) {
            const key = localEntry.entryId ?? localEntry.key;
            console.log(`added ${key} cloud update list`);
            epubDataNeedCloudUpdate.push(await getWholeEpubData(key));
          }
          if (epubDataNeedCloudUpdate.length > 0) {
            console.log(
              `updating ${epubDataNeedCloudUpdate.length} epub data to the cloud`
            );
            await syncMultipleEpubDataToCloud(epubDataNeedCloudUpdate);
          }
          console.log("finished epub data sync");
        })
        .catch((error) => console.error(error))
        .finally(() => resolves[1]());

      handleSimpleRequest("GET", {}, "lists/get/all")
        .then(async (shelvesData) => {
          const remoteShelves = shelvesData.data.response.shelves;
          const lastSync = (await getCurrentUser()).lastSynced;
          const lastCloudWritten = shelvesData.data.response.lastWritten;
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
              await deleteBook(book, "_id", true);
            } else if (
              remoteBooks.hasOwnProperty(book._id) === false ||
              remoteBooks[book._id]._lastUpdated < book._lastUpdated
            ) {
              entriesNeedCloudUpdate.push(book);
            } else if (remoteBooks[book._id]._lastUpdated > book._lastUpdated) {
              await setBook(remoteBooks[book._id], "_id", true);
            }
            delete remoteBooks[book._id];
          }
          for (const book of Object.values(remoteBooks)) {
            console.log("adding remote books", book._id);
            await setBook(book, "_id", true);
          }
          if (entriesNeedCloudUpdate.length > 0) {
            console.log("updating books in cloud");
            await syncMultipleBooksToCloud(entriesNeedCloudUpdate);
          }
          console.log("finished books sync");
        })
        .catch((error) => console.error(error))
        .finally(() => resolves[2]());

      Promise.all(promises).then(async () => {
        await updateLastSynced(Date.now());
        setIsLoading(false);
      });
    }
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "90vh",
        }}
      >
        <Loading loadingText={"Syncing"} />
      </Box>
    );
  }

  return children;
};
