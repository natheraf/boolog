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
          const isOPF = entry.filename.endsWith(".opf");

          const isHTML =
            entry.filename.endsWith(".htm") ||
            entry.filename.endsWith(".html") ||
            entry.filename.endsWith(".xhtml");

          const isTOC = entry.filename.endsWith(".ncx");

          const isCSS = entry.filename.endsWith(".css");

          const isImage =
            entry.filename.endsWith(".jpeg") ||
            entry.filename.endsWith(".jpg") ||
            entry.filename.endsWith(".png") ||
            entry.filename.endsWith(".svg") ||
            entry.filename.endsWith(".gif");

          const fileName = entry.filename.substring(
            entry.filename.lastIndexOf("/") + 1
          );

          const handleAddEntry = async (type, parser) => {
            if (
              objectResource[type].hasOwnProperty(fileName) &&
              typeof objectResource[type][fileName] !== "object"
            ) {
              objectResource[type][fileName] = {
                [entry.filename]: objectResource[type][fileName],
              };
            }
            const parseResult = await parser(entry);
            if (objectResource[type].hasOwnProperty(fileName)) {
              objectResource[type][fileName][entry.filename] = parseResult;
            } else {
              objectResource[type][fileName] = parseResult;
            }
          };

          if (isHTML) {
            await handleAddEntry("html", convertFileToString);
          }
          if (isCSS) {
            await handleAddEntry("css", convertFileToString);
          }
          if (isOPF || isTOC) {
            objectResource[fileName.substring(fileName.lastIndexOf(".") + 1)] =
              await convertXMLFileToObject(entry);
          }
          if (isImage) {
            await handleAddEntry("images", convertFileToBlob);
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
