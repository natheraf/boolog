const config = require("../config/auth.config");
const superAdminConfig = require("../config/superAdmin.config");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getDatabase } = require("../database");
const { isDuplicateEmail } = require("../middleware/verifySignUp");
const { sendEmailAuthentication } = require("../middleware/mailer");
const { bodyMissingRequiredFields } = require("../middleware/utils");
const { ObjectId } = require("mongodb");

const signOut = (req, res) => {
  // Set token to null and expire after 5 seconds
  res.clearCookie("accessToken");
  res.clearCookie("userInfo");
  res.status(401).send({
    message: "User logged out successfully",
  });
};

exports.signOut = signOut;

exports.checkUserIdExists = (req, res, next) => {
  getDatabase("authentication").then((db) => {
    db.collection("loginInfo")
      .findOne(ObjectId.createFromHexString(req.userId))
      .then((user) => {
        if (user === null) {
          return signOut(req, res);
        }
        next();
      });
  });
};

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
  if (req.passwordlessFoundUser === true) {
    return next();
  }
  if (req.body.name === undefined) {
    req.body.name = req.body.email;
  }
  const userRequiredBody = ["email", "password", "role", "active", "name"];
  const missing = bodyMissingRequiredFields(req, userRequiredBody);
  if (missing) {
    return res?.status(400).send(missing);
  }

  const user = {};
  userRequiredBody.forEach((key) => (user[key] = req.body[key]));
  if (req.body.password !== null) {
    user.password = bcrypt.hashSync(req.body.password, 10);
  }
  getDatabase("authentication")
    .then((db) => {
      db.collection("loginInfo")
        .insertOne(user)
        .then(() => next())
        .catch((error) => {
          console.log(error);
          res.status(500).send(error);
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send(error);
    });
};

exports.sendSignUpCode = (req, res) => {
  const missing = bodyMissingRequiredFields(req, [
    "name",
    "email",
    "password",
    "role",
    "active",
  ]);
  if (missing) {
    return res?.status(400).send(missing);
  }

  req.body.purpose = "signup";
  getDatabase("authentication").then((db) =>
    sendEmailAuthentication(db, req)
      .then((message) => res.send({ message }))
      .catch((error) => res.status(400).send(error))
  );
};

exports.checkSignUpCode = (req, res, next) => {
  const missing = bodyMissingRequiredFields(req, [
    "verificationId",
    "verificationCode",
  ]);
  if (missing) {
    return res?.status(400).send(missing);
  }

  getDatabase("authentication").then((db) => {
    db.collection("loginEmailCodes")
      .findOne({
        codeId: req.body.verificationId,
        purpose: "signup",
      })
      .then((data) => {
        const codeIsValid = () =>
          bcrypt.compareSync(req.body.verificationCode, data.code);
        if (!data || !codeIsValid()) {
          return res
            .status(401)
            .send({ message: "Wrong verification code or possibly expired" });
        }
        req.body = data.body;
        db.collection("loginEmailCodes")
          .deleteOne({
            _id: data._id,
          })
          .then(() => next())
          .catch((error) => console.log(error));
      });
  });
};

exports.signIn = (req, res) => {
  const missing = bodyMissingRequiredFields(req, ["email", "password"]);
  if (missing) {
    return res?.status(400).send(missing);
  }

  getDatabase("authentication").then((db) => {
    db.collection("loginInfo")
      .findOne({ email: req.body.email })
      .then((user) => {
        if (!user || user.password === null) {
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
            expiresIn: 60 * 60 * 24 * 7, // 1 week
            sameSite: "Strict",
          }
        );
        res.cookie(
          "userInfo",
          {
            userName: user.name,
            userEmail: user.email,
          },
          {
            secure: true,
            signed: true,
            expiresIn: 60 * 60 * 24 * 7, // 1 week
            sameSite: "Strict",
          }
        );
        res.status(200).send({
          userName: user.name,
          userEmail: user.email,
          message: `Successfully Signed In. Expires in ${expiresIn}.`,
        });
      });
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
              return res.status(401).send({ message: "Email not found" });
            }
            req.body.purpose = "login";
            sendEmailAuthentication(db, req)
              .then((message) => res.send({ message }))
              .catch((error) => res.status(400).send(error));
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

  getDatabase("authentication")
    .then((db) => {
      req.body.password = null;
      req.body.purpose = "login";
      sendEmailAuthentication(db, req)
        .then((message) => res.send({ message }))
        .catch((error) => {
          res.status(400).send(error);
        });
    })
    .catch((error) => {
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
            expiresIn: 60 * 60 * 24 * 7, // 1 week
            sameSite: "Strict",
          }
        );
        res.cookie(
          "userInfo",
          {
            userName: user.name,
            userEmail: user.email,
          },
          {
            secure: true,
            signed: true,
            expiresIn: 60 * 60 * 24 * 7, // 1 week
            sameSite: "Strict",
          }
        );
        res.status(200).send({
          message: `Successfully Signed In. Expires in ${expiresIn}.`,
        });
      });
  });
};

exports.checkPasswordlessCode = (req, res, next) => {
  const missing = bodyMissingRequiredFields(req, [
    "verificationId",
    "verificationCode",
  ]);
  if (missing) {
    return res?.status(400).send(missing);
  }

  getDatabase("authentication").then((db) => {
    db.collection("loginEmailCodes")
      .findOne({
        codeId: req.body.verificationId,
        purpose: "login",
      })
      .then((data) => {
        const codeIsValid = () =>
          bcrypt.compareSync(req.body.verificationCode, data.code);
        if (!data || !codeIsValid()) {
          return res
            .status(401)
            .send({ message: "Wrong verification code or possibly expired" });
        }
        req.body.email = data.email;
        db.collection("loginInfo")
          .findOne({ email: req.body.email })
          .then((user) => {
            if (!user) {
              req.body = data.body;
            } else {
              req.passwordlessFoundUser = true;
            }
            db.collection("loginEmailCodes")
              .deleteOne({
                _id: data._id,
              })
              .then(() => next())
              .catch((error) => console.log(error));
          });
      });
  });
};
