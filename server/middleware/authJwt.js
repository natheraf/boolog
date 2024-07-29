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

const creatingAccountVerifyToken = (req, res, next) => {
  const token = req.signedCookies["accessToken"];

  if (!token) {
    req.userRoleId = 3;
    req.body.role = "user";
    next();
    return;
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

const hasRole = (req, res, next) => {
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
  if (
    req.body.role === "user" ||
    (req.body.role === "admin" && req.userRoleId === 0)
  ) {
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
  creatingAccountVerifyToken,
};

module.exports = authJwt;
