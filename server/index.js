const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const corsOptions = { origin: "http://localhost:3000", credentials: true };
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Connecting to database. The `drop` argument drops and resync all tables.
 */
require("./startDB")(process.argv.includes("drop"));

/**
 * Define all our routes into express app.
 */
require("./routes/auth.routes")(app);
app.use("/jsdoc-front", express.static("../client/jsdoc/out"));
app.use("/jsdoc-back", express.static("../server/jsdoc/out"));
app.use(express.static("../client/build"));

const port = process.env.PORT || 8080;

/**
 * If `dev` was in our arguments, we will start the app by listening for HTTP requests. This is used for development.
 *
 * Otherwise we will start our app in production mode with SSL certificates.
 */
if (process.argv.includes("dev")) {
  app.listen(port, () => console.log(`Express Server on port ${port}`));
} else {
  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });
  const fs = require("fs");
  const https = require("https");
  const httpServer = https.createServer(
    {
      key: fs.readFileSync(process.env.PRIVATEKEY, "utf-8"),
      cert: fs.readFileSync(process.env.CERTIFICATE, "utf-8"),
    },
    app
  );

  httpServer.listen(port, () => console.log(`Express Server on port ${port}`));
}
