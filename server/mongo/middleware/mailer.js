require("dotenv").config({ path: __dirname + "/../../.env" });
const nodemailer = require("nodemailer");
const config = require("../config/email.config.js");

const generateRandomCode = (numOfBytes) =>
  require("crypto").randomBytes(numOfBytes).toString("base64url");

const emailAuthenticationCheck = (subject, receiverEmail, receiverName) =>
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
        subject: subject, // Subject line
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

module.exports = { emailAuthenticationCheck };
