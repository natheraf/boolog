import { filesObjectStore, userDBVersion } from "./config";
import { openDatabase, getUserDB } from "./common";
import { BlobReader, BlobWriter, TextWriter, ZipReader } from "@zip.js/zip.js";
import { XMLBuilder, XMLParser } from "fast-xml-parser";

export const addFile = (file) =>
  openDatabase(getUserDB(), userDBVersion, (db) => addFileHelper(db, file));

const addFileHelper = (db, file) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(filesObjectStore, "readwrite");
    const objectStore = transaction.objectStore(filesObjectStore);
    const request = objectStore.add(file);
    request.onsuccess = (event) => {
      console.log("added file!");
      resolve(event);
    };
    request.onerror = () => {
      console.log("Request Error", request.error);
      reject(new Error(`Request Error: ${request.error}`));
    };
  });

export const getFile = (id) =>
  openDatabase(getUserDB(), userDBVersion, (db) => getFileHelper(db, id));

const getFileHelper = (db, id) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(filesObjectStore, "readonly");
    transaction.onerror = (event) => {
      console.error("Transaction Error", event);
      reject(new Error(event));
    };
    const objectStore = transaction.objectStore(filesObjectStore);
    const request = objectStore.get(id);
    request.onsuccess = (event) => {
      const data = event.target.result;
      resolve(data);
    };
  });

export const exportFile = (id) =>
  getFile(id).then((res) => {
    const url = window.URL.createObjectURL(res);
    const tempLink = document.createElement("a");
    tempLink.href = url;
    tempLink.setAttribute("download", res.name);
    tempLink.click();
  });

const convertZipFileToObjectDirectory = (id) =>
  new Promise((resolve, reject) => {
    getFile(id).then((res) => {
      const zipFileReader = new BlobReader(res);
      const zipReader = new ZipReader(zipFileReader);
      zipReader
        .getEntries()
        .then(async (res) => {
          const objectDirectory = {};
          for (const entry of res) {
            const path = entry.filename.split("/");
            let currentDir = objectDirectory;
            for (let index = 0; index < path.length - 1; index += 1) {
              if (currentDir.hasOwnProperty(path[index]) === false) {
                currentDir[path[index]] = {};
              }
              currentDir = currentDir[path[index]];
            }

            const isOPF =
              entry.filename.indexOf(".opf") === entry.filename.length - 4;

            const isXML =
              entry.filename.indexOf(".xml") === entry.filename.length - 4 ||
              entry.filename.indexOf(".html") === entry.filename.length - 5 ||
              entry.filename.indexOf(".xhtml") === entry.filename.length - 6;

            const isTOC =
              entry.filename.indexOf(".ncx") === entry.filename.length - 4;

            const isCSS =
              entry.filename.indexOf(".css") === entry.filename.length - 4;

            if (isXML || isCSS || isTOC) {
              // convert to string
              const string = await convertFileToString(entry);
              currentDir[path.pop()] = {
                type: isXML ? "xml" : "css",
                text: string,
                name: entry.filename,
              };
            }
            if (isOPF || isTOC) {
              const object = await convertXMLFileToObject(entry);
              objectDirectory[
                entry.filename.substring(entry.filename.lastIndexOf(".") + 1)
              ] = object;
            }
            if (!(isOPF || isXML || isTOC || isCSS)) {
              currentDir[path.pop()] = entry;
            }
          }
          resolve(objectDirectory);
        })
        .finally(() => zipReader.close());
    });
  });

export const convertFileToString = (entry) =>
  new Promise((resolve, reject) => {
    const textWriter = new TextWriter();
    entry.getData(textWriter).then(resolve);
  });

export const convertFileToBlob = (entry) =>
  new Promise((resolve, reject) => {
    const blobWriter = new BlobWriter();
    entry.getData(blobWriter).then(resolve);
  });

const convertXMLFileToObject = (file) =>
  new Promise((resolve, reject) => {
    convertFileToString(file).then((res) => {
      const parser = new XMLParser({ ignoreAttributes: false });
      const obj = parser.parse(res, true);
      resolve(obj);
    });
  });

export const getObjectFromEpub = (id) =>
  new Promise((resolve, reject) => {
    convertZipFileToObjectDirectory(id).then(resolve);
  });

export const convertObjectToXML = (object) => {
  const options = {
    ignoreAttributes: false,
  };
  const builder = new XMLBuilder(options);
  const xmlDataStr = builder.build(object);
  return xmlDataStr;
};
