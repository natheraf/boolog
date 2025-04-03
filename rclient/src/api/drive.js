import { handleDataFormRequest, handleSimpleRequest } from "./Axios";
import { addBookFromEpub } from "./IndexedDB/Books";

/**
 *
 * @param {object} object
 * @param {string} object._id file id
 * @param {Blob} object.blob blob
 */
export const sendOne = (object) => {
  handleDataFormRequest("POST", object, "drive/put/one")
    .then((res) => console.log(res))
    .catch((error) => console.error(error));
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

export const getOne = (fileDriveId) => {
  handleSimpleRequest("GET", { responseType: "blob" }, "drive/get/one", {
    fileDriveId,
  })
    .then((res) => {
      const file = new File([res.data], "file", {
        type: res.data.type,
      });
      addBookFromEpub(file);
    })
    .catch((error) => console.error(error));
};
