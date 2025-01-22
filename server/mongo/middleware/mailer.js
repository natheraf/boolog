require("dotenv").config({ path: __dirname + "/../../.env" });
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const config = require("../config/email.config.js");
const { generateRandomCode } = require("./utils.js");

const emailAuthenticationCheck = (req) =>
  new Promise((resolve, reject) => {
    const link = `${req.header("Origin")}/login/passwordless`;
    const code = generateRandomCode(64);
    const codeId = generateRandomCode(64);
    const transporter = nodemailer.createTransport({
      host: `${config.outgoing_email_host}`,
      port: 587,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: `${config.outgoing_email}`,
        pass: `${config.outgoing_email_password}`,
      },
    });
    transporter
      .sendMail({
        from: `"Boolog 📖 No-Reply" <${config.outgoing_email}>`, // sender address
        to: `${req.body.email}`, // list of receivers
        subject: "Verify Your Identity", // Subject line
        text: `Hi ${
          req.body.name ?? req.body.email
        }. This is your verification link: ${link}?code=${code}`, // plain text body
        html: `<p>Hi ${
          req.body.name ?? req.body.email
        }<br/><p>Here is your one-time verification link to verify its you. This link is valid for <b>5 minutes</b> only: </p><a href="${link}?code=${code}&codeId=${codeId}&purpose=${
          req.body.purpose
        }"><h2>Click here to Verify</h2></a><p>Thanks, Boolog.</p>`, // html body
      })
      .then((info) => resolve({ codeId, code, info }))
      .catch((error) => {
        if (error.message === "No recipients defined") {
          reject({ message: "Error with sending Email" });
        } else {
          console.log(error);
          reject(error);
        }
      });
  });

const sendEmailAuthentication = (db, req) =>
  new Promise((resolve, reject) => {
    emailAuthenticationCheck(req)
      .then(({ codeId, code, info }) =>
        db
          .collection("loginEmailCodes")
          .findOne({ email: req.body.email })
          .then(async (foundDuplicate) => {
            if (foundDuplicate) {
              await db.collection("loginEmailCodes").deleteOne(foundDuplicate);
            }
            db.collection("loginEmailCodes")
              .insertOne({
                email: req.body.email,
                codeId,
                code: bcrypt.hashSync(code, 10),
                body: req.body,
                purpose: req.body.purpose,
                info,
              })
              .then((insertRes) => {
                setTimeout(
                  () =>
                    db.collection("loginEmailCodes").deleteOne({
                      _id: insertRes.insertedId,
                    }),
                  1000 * 60 * 5 // 5 minutes
                );
                resolve("Sent email verification link");
              });
          })
      )
      .catch(reject);
  });

module.exports = { sendEmailAuthentication };
