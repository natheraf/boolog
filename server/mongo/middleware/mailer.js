require("dotenv").config({ path: __dirname + "/../../.env" });
const nodemailer = require("nodemailer");
const config = require("../config/email.config.js");

const generateRandomCode = (numOfBytes) =>
  require("crypto").randomBytes(numOfBytes).toString("base64url");

const emailAuthenticationCheck = (receiverEmail, receiverName) =>
  new Promise((resolve, reject) => {
    const code = generateRandomCode(4);
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
        from: `"No-Reply Boolog 📖" <${config.outgoing_email}>`, // sender address
        to: `${receiverEmail}`, // list of receivers
        subject: "Verify Your Identity", // Subject line
        text: `Hi ${
          receiverName ?? receiverEmail
        }. This is your verification code: ${code}`, // plain text body
        html: `<p>Hi ${
          receiverName ?? receiverEmail
        }<br/><b>One-time verification code</b><br/>Here is your one-time verification code to verify its you. This code is valid for <b>5 minutes</b> only: </p><h1>${code}</h1><p>Thanks, Boolog.</p>`, // html body
      })
      .then((info) => resolve({ code, info }))
      .catch((error) => reject(error));
  });

const sendEmailAuthentication = (db, receiverEmail, receiverName) =>
  new Promise((resolve, reject) => {
    emailAuthenticationCheck(receiverEmail, receiverName).then(
      ({ code, info }) =>
        db
          .collection("loginEmailCodes")
          .insertOne({ email: receiverEmail, code, info })
          .then((insertRes) => {
            setTimeout(
              () =>
                db.collection("loginEmailCodes").deleteOne({
                  _id: insertRes.insertedId,
                  email: receiverEmail,
                }),
              // 1000 * 60 * 5 // 5 minutes
              1000 * 60 // 1 minute
            );
            resolve("Sent verification code");
          })
    );
  });

module.exports = { sendEmailAuthentication };
