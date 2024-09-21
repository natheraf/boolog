const config = require("../config/auth.config");
const superAdminConfig = require("../config/superAdmin.config");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getDatabase } = require("../database");
const { isDuplicateEmail } = require("../middleware/verifySignUp");
const { emailAuthenticationCheck } = require("../middleware/mailer");
const { bodyMissingRequiredFields } = require("../middleware/utils");

exports.createSuperAdmin = () => {
  getDatabase("authentication")
    .then((db) => {
      db.collection("loginInfo").insertOne({
        name: "super_admin",
        email: superAdminConfig.email,
        password: bcrypt.hashSync(superAdminConfig.password, 10),
        active: true,
        role: "super_admin",
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
  const missing = bodyMissingRequiredFields(req, userRequiredBody);
  if (missing) {
    return res?.status(400).send(missing);
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
  const missing = bodyMissingRequiredFields(req, ["email"]);
  if (missing) {
    return res?.status(400).send(missing);
  }

  getDatabase("authentication").then((db) => {
    db.collection("loginInfo")
      .findOne({ email: req.body.email })
      .then((user) => {
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
          jwt.sign({ userId: user._id, userRole: user.role }, config.secret, {
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

exports.checkPasswordless = (req, res, next) => {
  const missing = bodyMissingRequiredFields(req, ["email"]);
  if (missing) {
    return res?.status(400).send(missing);
  }

  isDuplicateEmail(req.body.email).then((isDuplicate) => {
    if (isDuplicate) {
      getDatabase("authentication").then((db) => {
        db.collection("loginInfo")
          .findOne({ email: req.body.email })
          .then((user) => {
            if (!user) {
              return res
                .status(401)
                .send({ message: "Email and Password are not found" });
            }
            emailAuthenticationCheck(
              "Verify Your Identity",
              req.body.email,
              user.name
            ).then(({ code, info }) =>
              db
                .collection("loginEmailCodes")
                .insertOne({ email: req.body.email, code, info })
                .then((insertRes) => {
                  setTimeout(
                    () =>
                      db.collection("loginEmailCodes").deleteOne({
                        _id: insertRes.insertedId,
                        email: req.body.email,
                      }),
                    1000 * 60 * 5 // 5 minutes
                  );
                  res.status.send("Sent verification code");
                })
            );
          });
      });
    } else {
      next();
    }
  });
};

exports.signUpPasswordless = (req, res) => {
  const missing = bodyMissingRequiredFields(req, ["email", "role", "active"]);
  if (missing) {
    return res?.status(400).send(missing);
  }

  const user = {
    email: req.body.email,
    name: req.body.email,
    password: null,
    role: req.body.role,
    active: req.body.active,
  };
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

exports.signInPasswordless = (req, res) => {
  const missing = bodyMissingRequiredFields(req, ["email"]);
  if (missing) {
    return res?.status(400).send(missing);
  }

  getDatabase("authentication").then((db) => {
    db.collection("loginInfo")
      .findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          return res.status(401).send({ message: "User not found" });
        }

        const expiresIn = "7d"; // 7 days
        res.cookie(
          "accessToken",
          jwt.sign({ userId: user._id, userRole: user.role }, config.secret, {
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
          userName: user.name,
          userEmail: user.email,
          message: `Successfully Signed In. Expires in ${expiresIn}.`,
        });
      });
  });
};

exports.checkPasswordlessCode = (req, res, next) => {
  const missing = bodyMissingRequiredFields(req, ["email", "verificationCode"]);
  if (missing) {
    return res?.status(400).send(missing);
  }

  getDatabase("authentication").then((db) => {
    db.collection("loginEmailCodes")
      .findOne({
        email: req.body.email,
        code: req.body.verificationCode,
      })
      .then((obj) => {
        if (!obj) {
          return res
            .status(401)
            .send({ message: "Wrong email and verification code" });
        }
        db.collection("loginEmailCodes")
          .deleteOne({
            _id: insertRes.insertedId,
            email: req.body.email,
          })
          .then(() => next())
          .catch((error) => console.log(error));
      });
  });
};
