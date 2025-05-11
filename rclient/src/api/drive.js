import { addEpub } from "../features/files/fileUtils";
import { handleDataFormRequest, handleSimpleRequest } from "./Axios";

/**
 *
 * @param {object} object fileObject
 * @return {Promise}
 */
export const sendOne = (object) => {
  delete object.epubObject;
  return handleDataFormRequest("POST", object, "drive/put/one");
};

/**
 *
 * @param {string} localId
 * @param {string} [fileDriveId]
 * @return {Promise}
 */
export const deleteFile = async (localId, fileDriveId) => {
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
        const file = new File([res.data], "file", {
          type: res.data.type,
        });
        addEpub(file, fileId).then(resolve);
      })
      .catch((error) =>
        error instanceof Error ? reject(error) : new Error("unknown error")
      )
  );
