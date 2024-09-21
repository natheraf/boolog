const { getDatabase, ROLES } = require("../database");
const { bodyMissingRequiredFields } = require("./utils");

const isDuplicateEmail = (email) =>
  new Promise((resolve, reject) =>
    getDatabase("authentication")
      .then((db) => {
        const collection = db.collection("loginInfo");
        collection.findOne({ email }).then((email) => {
          resolve(email !== null);
        });
      })
      .catch(reject)
  );

const checkDuplicateEmail = (req, res, next) => {
  const missing = bodyMissingRequiredFields(req, ["email"]);
  if (missing) {
    return res?.status(400).send(missing);
  }

  isDuplicateEmail(req.body.email).then((isDuplicate) => {
    if (isDuplicate) {
      res.status(400).send({
        message: "Email is already in use!",
      });
      return;
    }
    next();
  });
};

const checkRolesExist = (req, res, next) => {
  if (!req.body.role || !ROLES.includes(req.body.role)) {
    res.status(400).send({
      message: "Blank role or role does not exit",
    });
    return;
  }
  next();
};

const verifySignUp = {
  isDuplicateEmail,
  checkDuplicateEmail,
  checkRolesExist,
};

module.exports = verifySignUp;
