import { addEpub } from "../features/files/fileUtils";
import {
  getFilenameFromContentDisposition,
  handleDataFormRequest,
  handleSimpleRequest,
} from "./Axios";
import { getAllBooks } from "./IndexedDB/Books";

/**
 *
 * @param {object} object fileObject
 * @return {Promise}
 */
export const sendOne = (object) => {
  delete object.epubObject;
  return handleDataFormRequest("POST", object, "drive/put/one/stream", {
    _id: object._id,
  });
};

/**
 *
 * @param {string} localId
 * @param {string} [fileDriveId]
 * @return {Promise}
 */
export const deleteOne = async (localId, fileDriveId) => {
  if (fileDriveId === undefined) {
    const driveList = (await listFiles()).data.list.files;
    fileDriveId = driveList.find(
      (driveFile) => localId === driveFile.appProperties.boologId
    )?.id;
  }
  if (fileDriveId === undefined) {
    throw Error("file drive Id not found");
  }
  return handleSimpleRequest("POST", { fileDriveId }, "drive/delete/one");
};

export const listFiles = () => handleSimpleRequest("GET", {}, "drive/list/all");

export const getOne = (fileDriveId, fileId) =>
  new Promise((resolve, reject) =>
    handleSimpleRequest("GET", { responseType: "blob" }, "drive/get/one", {
      fileDriveId,
    })
      .then((res) => {
        const file = new File(
          [res.data],
          getFilenameFromContentDisposition(res),
          {
            type: res.data.type,
          }
        );
        addEpub(file, fileId).then(resolve);
      })
      .catch((error) =>
        error instanceof Error ? reject(error) : new Error("unknown error")
      )
  );

export const trimDriveFiles = async (remoteFilesMap) => {
  remoteFilesMap = new Map(remoteFilesMap);
  const filesToTrim = await getDriveFilesToTrim(remoteFilesMap);
  for (const [fileId, driveId] of filesToTrim) {
    await deleteOne(fileId, driveId);
    remoteFilesMap.delete(fileId);
  }
  return remoteFilesMap;
};

const getDriveFilesToTrim = async (remoteFilesMap) => {
  const fileIdsWithEpubEntries = new Set(
    (await getAllBooks()).map((entry) => entry.fileId)
  );
  const res = [];
  for (const [fileId, driveId] of remoteFilesMap.entries()) {
    if (fileIdsWithEpubEntries.has(fileId) === false) {
      res.push([fileId, driveId]);
    }
  }
  return res;
};
