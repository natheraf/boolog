const { getUser } = require("../controller/auth.controller");
const { ROLES } = require("../database");
const { bodyMissingRequiredFields } = require("./utils");

const checkDuplicateEmail = (req, res, next) => {
  const missing = bodyMissingRequiredFields(req, ["email"]);
  if (missing) {
    return res?.status(400).send(missing);
  }

  getUser("email", req.body.email).then((user) => {
    if (user !== null) {
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
  checkDuplicateEmail,
  checkRolesExist,
};

module.exports = verifySignUp;
