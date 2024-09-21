const config = require("../config/auth.config");
const superAdminConfig = require("../config/superAdmin.config");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getDatabase } = require("../database");

exports.createSuperAdmin = () => {
  getDatabase("authentication")
    .then((db) => {
      db.collection("loginInfo").insertOne({
        name: "super_admin",
        email: superAdminConfig.email,
        password: bcrypt.hashSync(superAdminConfig.password, 10),
        active: true,
      });
    })
    .then(() => {
      console.log("Super Admin created successfully");
    })
    .catch((error) => {
      console.log("Super Admin NOT created successfully: " + error.message);
    });
};

exports.signUp = (req, res, next) => {
  const userRequiredBody = ["name", "email", "password", "role", "active"];
  const missing = [];
  userRequiredBody.forEach((key) => {
    if (!req.body[key]) missing.push(key);
  });
  if (missing.length > 0) {
    res?.status(400).send({
      message:
        (missing.length <= 2
          ? missing.join(" and ")
          : missing.slice(0, missing.length - 1).join(", ") +
            ", and " +
            missing[missing.length - 1]) + " cannot be empty",
    });
    return false;
  }

  const user = {};
  userRequiredBody.forEach((key) => (user[key] = req.body[key]));
  user.password = bcrypt.hashSync(req.body.password, 10);
  getDatabase("authentication")
    .then((db) => {
      db.collection("loginInfo")
        .insertOne(user)
        .then(() => next());
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send(error);
    });
};

exports.signIn = (req, res) => {
  const missing = ["email", "password"].filter((key) => !req.body[key]);
  if (missing.length > 0) {
    res.status(400).send({
      message: "User's " + missing.join(" and ") + " cannot be empty",
    });
    return;
  }

  console.log(req.body, req.body.email);
  getDatabase("authentication").then((db) => {
    db.collection("loginInfo")
      .findOne({ email: req.body.email })
      .then((user) => {
        console.log(user);
        if (!user) {
          return res
            .status(401)
            .send({ message: "Email and Password are not found" });
        }

        const passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
        );
        if (!passwordIsValid) {
          return res.status(401).send({
            message: "Email and Password are not found",
          });
        }

        const expiresIn = "7d"; // 7 days
        res.cookie(
          "accessToken",
          jwt.sign(
            { userId: user.id, userRoleId: user.roleId },
            config.secret,
            {
              algorithm: "HS256",
              expiresIn: expiresIn,
            }
          ),
          {
            httpOnly: true,
            secure: true,
            signed: true,
            expiresIn: 60 * 60,
            sameSite: "Strict",
          } // expires: 60 * 60 * 24 * 7 // 1 week
        );
        res.status(200).send({
          userName: user.name,
          userEmail: user.email,
          message: `Successfully Signed In. Expires in ${expiresIn}.`,
        });
      });
  });
};

exports.signOut = (req, res) => {
  // Set token to null and expire after 5 seconds
  res.clearCookie("accessToken");
  res.status(200).send({
    message: "User logged out successfully",
  });
};
