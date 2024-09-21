const { getDatabase, ROLES } = require("../database");

const checkDuplicateEmail = (req, res, next) => {
  const missing = ["email"].filter((key) => !req.body[key]);
  if (missing.length > 0) {
    res.status(400).send({
      message: "User's " + missing.join(" and ") + " cannot be empty",
    });
    return;
  }

  getDatabase("authentication").then((db) => {
    const collection = db.collection("loginInfo");
    collection.findOne({ email: req.body.email }).then((email) => {
      if (email) {
        res.status(400).send({
          message: "Email is already in use!",
        });
        return;
      }
      next();
    });
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
  checkDuplicateEmail,
  checkRolesExist,
};

module.exports = verifySignUp;
