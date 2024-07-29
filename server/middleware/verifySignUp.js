const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;
const Op = db.Sequelize.Op;

const checkDuplicateNameOrEmail = (req, res, next) => {
  const missing = ["name", "email"].filter((key) => !req.body[key]);
  if (missing.length > 0) {
    res.status(400).send({
      message: "User's " + missing.join(" and ") + " cannot be empty",
    });
    return;
  }

  User.findOne({
    where: {
      [Op.or]: {
        name: req.body.name,
        email: req.body.email,
      },
    },
  }).then((user) => {
    if (user) {
      res.status(400).send({
        message: "Name is already in use!",
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
  checkDuplicateNameOrEmail,
  checkRolesExist,
};

module.exports = verifySignUp;
