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
require("./mongo/startDB")(process.argv.includes("drop"));

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

/**
 * Define all our routes into express app.
 */
require("./mongo/routes/google.routes")(app);
require("./mongo/routes/auth.routes")(app);
require("./mongo/routes/lists.routes")(app);
require("./mongo/routes/generic.routes")(app);
require("./mongo/routes/resources.routes")(app);
app.use("/jsdoc-front", express.static("../rclient/jsdoc/out"));
app.use("/jsdoc-back", express.static("../server/jsdoc/out"));
app.use(express.static("../rclient/build"));

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
    res.sendFile(path.join(__dirname, "../rclient/build/index.html"));
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
