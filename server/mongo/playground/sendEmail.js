require("dotenv").config({ path: __dirname + "/../../.env" });
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: `${process.env.OUTGOING_EMAIL_HOST}`,
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: `${process.env.OUTGOING_EMAIL}`,
    pass: `${process.env.OUTGOING_EMAIL_PASSWORD}`,
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `"Test 👻" <${process.env.OUTGOING_EMAIL}>`, // sender address
    to: `${process.env.TEST_INCOMING_EMAIL}`, // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world??</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

main().catch(console.error);
