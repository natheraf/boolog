import { addEpub } from "../features/files/fileUtils";
import { handleDataFormRequest, handleSimpleRequest } from "./Axios";

/**
 *
 * @param {object} object
 * @param {string} object._id file id
 * @param {Blob} object.blob blob
 */
export const sendOne = (object) => {
  delete object.epubObject;
  return handleDataFormRequest("POST", object, "drive/put/one");
};

export const deleteFile = (fileDriveId) => {
  handleSimpleRequest("POST", { fileDriveId }, "drive/delete/one")
    .then((res) => console.log(res))
    .catch((error) => console.error(error));
};

export const listFiles = () => {
  handleSimpleRequest("GET", {}, "drive/list/all")
    .then((res) => console.log(res))
    .catch((error) => console.error(error));
};

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
