import * as React from "react";
import {
  addEpub,
  convertZipFileToObjectDirectory as getObjectFromEpub,
} from "../features/files/fileUtils";
import { Button, Divider, Stack, TextField, Typography } from "@mui/material";
import { EpubReader } from "../components/EpubReader";
import { exportFile, getFile } from "../api/IndexedDB/Files";
import { deleteFile, getOne, listFiles, sendOne } from "../api/drive";

export const Upload = () => {
  const [file, setFile] = React.useState(null);
  const [storageEstimate, setStorageEstimate] = React.useState(null);
  const [itemId, setItemId] = React.useState(null);

  const [openReader, setOpenReader] = React.useState(false);
  const [epubObject, setEpubObject] = React.useState(null);

  const handleFileChange = (event) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSend = () => {
    if (file === null) {
      return;
    }
    console.log("Uploading file...");
    addEpub(file)
      .then((res) => setItemId(res.target.result))
      .catch((error) => console.log(error)); // throw alert
  };

  const handleOpenBook = (obj) => {
    setEpubObject(obj);
    setOpenReader(true);
  };

  const handleSendBookToDrive = (fileId) => {
    getFile(fileId).then((res) => {
      delete res.epubObject;
      sendOne(res);
    });
  };

  const handleDeleteBookFromDrive = (fileDriveId) => {
    deleteFile(fileDriveId);
  };

  const handleGetDriveFilesList = () => {
    listFiles();
  };

  const handleGetDriveFile = (fileId) => {
    getOne(fileId);
  };

  React.useEffect(() => {
    navigator.storage.estimate().then((res) => setStorageEstimate(res));
  }, []);

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <Typography variant="h6">Drive API Test</Typography>
        <TextField
          onKeyDown={(event) =>
            event.key === "Enter"
              ? handleSendBookToDrive(event.target.value)
              : null
          }
          label="send book to drive"
        />
        <TextField
          onKeyDown={(event) =>
            event.key === "Enter"
              ? handleDeleteBookFromDrive(event.target.value)
              : null
          }
          label="delete book from drive"
        />
        <TextField
          onKeyDown={(event) =>
            event.key === "Enter"
              ? handleGetDriveFile(event.target.value)
              : null
          }
          label="download file from drive"
        />
        <Button onClick={handleGetDriveFilesList}>
          get list of drive files
        </Button>
      </Stack>
      <Divider />
      <div>
        <Typography variant="h6">IndexedDB Test</Typography>
        {epubObject === null ? null : (
          <EpubReader
            open={openReader}
            setOpen={setOpenReader}
            epubObject={epubObject}
            key={
              epubObject?.opf?.package?.metadata?.["dc:identifier"]?.["#text"]
            }
          />
        )}
        <div className="input-group">
          <input id="file" type="file" onChange={handleFileChange} />
        </div>
        {file && (
          <section>
            File details:
            <ul>
              <li>Name: {file.name}</li>
              <li>Type: {file.type}</li>
              <li>Size: {file.size} bytes</li>
            </ul>
          </section>
        )}

        {storageEstimate && (
          <section>
            Storage Estimate:
            <ul>
              <li>Quota: {storageEstimate.quota / Math.pow(1024, 3)} GB</li>
              <li>Usage: {storageEstimate.usage / Math.pow(1024, 3)} GB</li>
              <li>
                Details in KB: {JSON.stringify(storageEstimate.usageDetails)}
              </li>
            </ul>
          </section>
        )}

        {file && (
          <button onClick={handleSend} className="submit">
            Send to IndexedDB
          </button>
        )}

        <br />

        <TextField
          onKeyDown={(event) =>
            event.key === "Enter"
              ? setItemId(parseInt(event.target.value))
              : null
          }
          label="change file id"
        />
        <br />
        {itemId && (
          <button
            onClick={() => {
              getFile(itemId).then((res) => console.log(res));
            }}
            className="submit"
          >
            get item from database
          </button>
        )}

        <br />

        {itemId && (
          <button onClick={() => exportFile(itemId)} className="submit">
            download item
          </button>
        )}

        {itemId && (
          <button onClick={() => getObjectFromEpub(itemId)} className="submit">
            get Object From Epub
          </button>
        )}

        <br />
        <br />

        <TextField
          onKeyDown={(event) =>
            event.key === "Enter"
              ? getObjectFromEpub(event.target.value).then(handleOpenBook)
              : null
          }
          label="open book"
        />
      </div>
    </Stack>
  );
};
