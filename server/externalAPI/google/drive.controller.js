const { PassThrough } = require("node:stream");
const Busboy = require("busboy");
const { google } = require("googleapis");

const putOneStream = async (req, res) => {
  const busboy = Busboy({ headers: req.headers });
  busboy.on("file", (_fieldname, fileStream, { filename, mimeType }) => {
    const passThrough = new PassThrough();
    fileStream.pipe(passThrough);
    const drive =
      req.drive ??
      google.drive({ version: "v3", auth: req.googleOauth2Client });
    drive.files
      .create({
        requestBody: {
          name: filename,
          parents: [req.driveAppdataFolderId],
          mimeType: mimeType,
          appProperties: {
            boologId: req.query._id,
          },
        },
        media: {
          mimeType: mimeType,
          body: passThrough,
        },
      })
      .then((response) => res.status(200).send())
      .catch((error) => {
        console.error(error);
        res.status(500).send({ message: error.message });
      });
  });
  busboy.on("error", (err) => res.status(500).json({ error: err.message }));
  req.pipe(busboy);
};

/**
 * @deprecated
 * @param {*} req
 * @param {*} res
 * @returns
 */
const putOne = async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "Files missing from request" });
  }
  const drive =
    req.drive ?? google.drive({ version: "v3", auth: req.googleOauth2Client });
  drive.files
    .create({
      requestBody: {
        name: req.file.originalname,
        parents: [req.driveAppdataFolderId],
        mimeType: req.file.mimetype,
        appProperties: {
          boologId: req.body._id,
        },
      },
      media: {
        mimeType: req.file.mimetype,
        body: new PassThrough().end(req.file.buffer),
      },
    })
    .then((response) => res.status(200).send())
    .catch((error) => {
      console.error(error);
      res.status(500).send({ message: error.message });
    });
};

const listAll = (req, res) => {
  const drive =
    req.drive ?? google.drive({ version: "v3", auth: req.googleOauth2Client });
  drive.files
    .list({
      q: `mimeType != 'application/vnd.google-apps.folder'`,
      fields: "files(id, name, appProperties)",
    })
    .then((response) => {
      res.status(200).send({ list: response.data });
    })
    .catch((error) => res.status(500).send({ message: error.message }));
};

const getOne = (req, res) => {
  if (!req.query.fileDriveId) {
    return res
      .status(400)
      .send({ message: "File Drive ID missing from request query" });
  }
  const drive =
    req.drive ?? google.drive({ version: "v3", auth: req.googleOauth2Client });
  drive.files
    .get({
      fileId: req.query.fileDriveId,
      fields: "name, mimeType",
    })
    .then((metadata) => {
      const fileName = metadata.data.name;
      res.header("Content-Type", "application/epub+zip");
      res.header("Content-Disposition", `attachment; filename="${fileName}"`);
      return drive.files.get(
        { fileId: req.query.fileDriveId, alt: "media" },
        { responseType: "stream" }
      );
    })
    .then((response) => {
      response.data
        .on("error", (error) => {
          console.error("error streaming drive file", error);
          res.status(500).send(error);
        })
        .pipe(res);
    })
    .catch((error) => {
      console.error("error getting drive file", error);
      res.status(500).send({ message: error.message });
    });
};

const deleteOne = (req, res) => {
  if (!req.body.fileDriveId) {
    return res
      .status(400)
      .send({ message: "File Drive ID missing from request" });
  }
  const drive =
    req.drive ?? google.drive({ version: "v3", auth: req.googleOauth2Client });
  drive.files
    .delete({
      fileId: req.body.fileDriveId,
    })
    .then((response) => res.status(200).send())
    .catch((error) => {
      console.error("error deleting drive file", error);
      res.status(500).send({ message: error.message });
    });
};

const googleController = {
  listAll,
  putOne,
  putOneStream,
  getOne,
  deleteOne,
};

module.exports = googleController;
