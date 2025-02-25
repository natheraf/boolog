import * as React from "react";
import { getObjectFromEpub } from "../api/IndexedDB/Files";
import { addFile, exportFile, getFile } from "../api/IndexedDB/filesMeta";
import { TextField } from "@mui/material";
import { EpubReader } from "../components/EpubReader";

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
    addFile(file).then((res) => setItemId(res.target.result));
  };

  const handleOpenBook = (obj) => {
    setEpubObject(obj);
    setOpenReader(true);
  };

  React.useEffect(() => {
    navigator.storage.estimate().then((res) => setStorageEstimate(res));
  }, []);

  return (
    <div>
      {epubObject === null ? null : (
        <EpubReader
          open={openReader}
          setOpen={setOpenReader}
          epubObject={epubObject}
          key={epubObject?.opf?.package?.metadata?.["dc:identifier"]?.["#text"]}
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
          event.key === "Enter" ? setItemId(parseInt(event.target.value)) : null
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
        defaultValue="1"
        onKeyDown={(event) =>
          event.key === "Enter"
            ? getObjectFromEpub(event.target.value).then(handleOpenBook)
            : null
        }
        label="open book"
      />
    </div>
  );
};
