const { urlQueryMissingRequiredFields } = require("./utils");

const allowedGenericAPIAccess = { userAppData: ["epubData", "settings"] };

const checkDatabaseAndCollection = (req, res, next) => {
  const userRequiredBody = ["database", "collection"];
  const missing = urlQueryMissingRequiredFields(req, userRequiredBody);
  if (missing) {
    return res?.status(400).send(missing);
  }

  const databaseName = req.query.database;
  const collectionName = req.query.collection;
  if (
    allowedGenericAPIAccess.hasOwnProperty(databaseName) === false ||
    allowedGenericAPIAccess[databaseName].includes(collectionName) === false
  ) {
    return res
      .status(404)
      .send({ message: "Database or collection not found" });
  }
  next();
};

const generic = {
  checkDatabaseAndCollection,
};

module.exports = generic;
