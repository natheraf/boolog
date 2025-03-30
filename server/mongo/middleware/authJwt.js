const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const { ROLES } = require("../database.js");
const { getUserFromEmail } = require("../middleware/verifySignUp");

const verifyToken = (req, res, next) => {
  const token =
    req.signedCookies[req.body.localUserId ?? req.query.localUserId];

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

const authorizedToCreateUser = (req, res, next) => {
  if (!req.body.role) {
    res.status(400).send({
      message: "Missing role for creating user",
    });
    return;
  }
  if (
    req.body.role === "user" ||
    ROLES.indexOf(req.body.role) > req.userRoleId
  ) {
    next();
  } else {
    res.status(400).send({
      message: "Incorrect role for creating user",
    });
    return;
  }
};

const creatingAccountVerifyToken = (req, res, next) => {
  const token = req.signedCookies[req.body.localUserId];

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

/**
 * checks if another profile already has this account signed in
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const checkIfAlreadySignedIn = (req, res, next) => {
  const loggedInUserIds = Object.entries(req.signedCookies)
    .filter(([key, value]) => isNaN(key) === false)
    .map(([cookieName, object]) =>
      jwt.verify(object, config.secret, (error, decoded) => {
        if (error) {
          return res.status(401).send({
            message: "Unauthorized",
          });
        }
        return decoded.userId.toString();
      })
    );
  if (loggedInUserIds.some((element) => typeof element !== "string")) {
    return;
  }
  getUserFromEmail(req.body.email).then((user) => {
    req.user = user;
    if (user !== null) {
      for (const userId of loggedInUserIds) {
        if (userId === user._id.toString()) {
          return res.status(409).send({
            message: `A user is already signed in as ${user.name}`,
          });
        }
      }
    }
    next();
  });
};

const authJwt = {
  verifyToken,
  authorizedToCreateUser,
  creatingAccountVerifyToken,
  checkIfAlreadySignedIn,
};

module.exports = authJwt;
