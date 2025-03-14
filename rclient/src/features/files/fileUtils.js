import { BlobReader, BlobWriter, TextWriter, ZipReader } from "@zip.js/zip.js";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { processEpub } from "../epub/epubUtils";
import { addFile } from "../../api/IndexedDB/Files";

export const convertZipFileToObjectDirectory = (data) =>
  new Promise((resolve, reject) => {
    const zipFileReader = new BlobReader(data.blob);
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
              type: isXML || isTOC ? "xml" : "css",
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

export const convertZipFileToObjectResource = (file) =>
  new Promise((resolve, reject) => {
    const zipFileReader = new BlobReader(file);
    const zipReader = new ZipReader(zipFileReader);
    zipReader
      .getEntries()
      .then(async (res) => {
        const objectResource = { html: {}, images: {}, css: {} };
        for (const entry of res) {
          const isOPF =
            entry.filename.indexOf(".opf") === entry.filename.length - 4;

          const isHTML =
            entry.filename.indexOf(".htm") === entry.filename.length - 4 ||
            entry.filename.indexOf(".html") === entry.filename.length - 5 ||
            entry.filename.indexOf(".xhtml") === entry.filename.length - 6;

          const isTOC =
            entry.filename.indexOf(".ncx") === entry.filename.length - 4;

          const isCSS =
            entry.filename.indexOf(".css") === entry.filename.length - 4;

          const isImage =
            entry.filename.indexOf(".jpeg") === entry.filename.length - 5 ||
            entry.filename.indexOf(".jpg") === entry.filename.length - 4 ||
            entry.filename.indexOf(".png") === entry.filename.length - 4 ||
            entry.filename.indexOf(".gif") === entry.filename.length - 4;

          const fileName = entry.filename.toUpperCase().startsWith("OEBPS/")
            ? entry.filename.substring(6)
            : entry.filename;

          if (isHTML) {
            objectResource.html[fileName] = await convertFileToString(entry);
          }
          if (isCSS) {
            objectResource.css[fileName] = await convertFileToString(entry);
          }
          if (isOPF || isTOC) {
            objectResource[fileName.substring(fileName.lastIndexOf(".") + 1)] =
              await convertXMLFileToObject(entry);
          }
          if (isImage) {
            objectResource.images[fileName] = await convertFileToBlob(entry);
          }
        }
        resolve(objectResource);
      })
      .finally(() => zipReader.close());
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

export const convertObjectToXML = (object) => {
  const options = {
    ignoreAttributes: false,
  };
  const builder = new XMLBuilder(options);
  const xmlDataStr = builder.build(object);
  return xmlDataStr;
};

export const addEpub = (file) =>
  new Promise((resolve, reject) => {
    if (!file || file?.type !== "application/epub+zip") {
      console.log(`Cannot add file: Missing file or not an epub`);
      return reject(new Error("File is falsy or not an epub"));
    }
    convertZipFileToObjectResource(file).then((object) => {
      const epubObject = processEpub(object);
      const data = { blob: file, epubObject };
      addFile(data).then(resolve);
    });
  });
