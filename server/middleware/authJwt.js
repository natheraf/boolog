const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const Role = db.role;

const verifyToken = (req, res, next) => {
  const token = req.signedCookies["accessToken"];

  if (!token) {
    return res.status(403).send({
      message: token === false ? "Cookie tampered" : "No Token provided",
    });
  }

  jwt.verify(token, config.secret, (error, decoded) => {
    if (error) {
      return res.status(401).send({
        message: "Unauthorized",
      });
    }
    req.userId = decoded.userId.toString();
    req.userRoleId = decoded.userRoleId;
    next();
  });
};

const hasRole = (requiredRoleName) => (req, res, next) => {
  Role.findOne(req.userRoleId).then((role) => {
    role.name === requiredRoleName
      ? next()
      : res.status(403).send({
          message: `Require ${requiredRoleName} role`,
        });
  });
};

const authorizedToCreateUser = (req, res, next) => {
  if (!req.body.role) {
    res.status(400).send({
      message: "Missing role for creating user",
    });
    return;
  }
  if (req.body.role === "admin") {
    hasRole("super_admin")(req, res, next);
  } else if (req.body.role === "user") {
    next();
  } else {
    res.status(400).send({
      message: "Incorrect role for creating user",
    });
    return;
  }
};

const authJwt = {
  verifyToken,
  authorizedToCreateUser,
};

module.exports = authJwt;
