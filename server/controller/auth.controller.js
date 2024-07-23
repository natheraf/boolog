const db = require("../models");
const config = require("../config/auth.config");
const superAdminConfig = require("../config/superAdmin.config");
const User = db.user;
const Role = db.role;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.createSuperAdmin = () => {
  User.create({
    name: "super_admin",
    email: superAdminConfig.email,
    password: bcrypt.hashSync(superAdminConfig.password, 10),
    active: true,
  })
    .then((user) => {
      Role.findOne({ where: { name: "super_admin" } }).then((role) => {
        role.addUser(user).then(() => {
          console.log("Super Admin created successfully");
        });
      });
    })
    .catch((error) => {
      console.log("Super Admin NOT created successfully: " + error.message);
    });
};

exports.signUp = (req, res) => {
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

  const user = User.build({});
  userRequiredBody.forEach((key) => (user[key] = req.body[key]));
  user.password = bcrypt.hashSync(req.body.password, 10);
  user
    .save()
    .then((user) => {
      Role.findOne({ where: { name: req.body.role } }).then((role) => {
        role.addUser(user).then(() => {
          console.log("User created successfully");
        });
      });
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

  Users.findOne({
    where: {
      email: req.body.email,
    },
  }).then((user) => {
    if (!user) {
      return res.status(400).send({ message: "Email not found" });
    }

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Wrong Password",
      });
    }

    const expiresIn = "7d"; // 7 days
    res.cookie(
      "accessToken",
      jwt.sign({ id: user.id }, config.secret, {
        algorithm: "HS256",
        expiresIn: expiresIn,
      }),
      {
        httpOnly: true,
        secure: true,
        signed: true,
        expiresIn: 60 * 60,
        sameSite: "Strict",
      } // expires: 60 * 60 * 24 * 7 // 1 week
    );

    res.status(200).send({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRoleId: user.roleId,
      message: `Successfully Signed In. Expires in ${expiresIn}.`,
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
