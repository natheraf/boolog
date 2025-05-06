const {
  urlQueryMissingRequiredFields,
  bodyMissingRequiredFields,
} = require("./utils");

const allowedGenericAPIAccess = { userAppData: ["epubData", "settings"] };

const checkDatabaseAndCollection = (req, res, next) => {
  if (req.method === "GET") {
    const userRequiredBody = ["database", "collection"];
    const missing = urlQueryMissingRequiredFields(req, userRequiredBody);
    if (missing) {
      return res?.status(400).send(missing);
    }
    req.database = req.query.database;
    delete req.query.database;
    req.collection = req.query.collection;
    delete req.query.collection;
  } else {
    const userRequiredBody = ["database", "collection"];
    const missing = bodyMissingRequiredFields(req, userRequiredBody);
    if (missing) {
      return res?.status(400).send(missing);
    }
    req.database = req.body.database;
    delete req.body.database;
    req.collection = req.body.collection;
    delete req.body.collection;
  }

  if (
    allowedGenericAPIAccess.hasOwnProperty(req.database) === false ||
    allowedGenericAPIAccess[req.database].includes(req.collection) === false
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
