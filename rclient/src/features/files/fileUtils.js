import { BlobReader, BlobWriter, TextWriter, ZipReader } from "@zip.js/zip.js";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { getFile } from "../../api/IndexedDB/Files";

export const convertZipFileToObjectDirectory = (id) =>
  new Promise((resolve, reject) => {
    getFile(id).then((res) => {
      const zipFileReader = new BlobReader(res.blob);
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
