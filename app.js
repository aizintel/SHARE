const express = require("express");
const bodyParser = require("body-parser");
const mainshield = require("./shieldstuff.js");
const dotenv = require("dotenv");
const fs = require("fs");
const https = require("https");
const winston = require("winston");

// Load environment variables
dotenv.config();

// Setup logging
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

const app = express();
const port = process.env.PORT || 3000;

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Redirect to /khienfb
app.get("/", (req, res) => {
  res.redirect("/khienfb");
});

// Serve index.html
app.get("/khienfb", (req, res) => {
  res.sendFile(__dirname + "/public/index.html", (err) => {
    if (err) {
      logger.error(err);
      res.status(500).send("Internal Server Error");
    }
  });
});

// Handle token submission
app.post("/khienfb/", (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res
      .status(400)
      .send(
        "<script>alert('Token Field Cannot Be Empty'); window.location.replace('/khienfb');</script>"
      );
  }

  mainshield
    .tokenchecker(token)
    .then((result) => {
      const userid = result.id;
      if (!userid) {
        return res
          .status(400)
          .send(
            "<script>alert('Invalid Token'); window.location.replace('/khienfb');</script>"
          );
      }

      mainshield
        .makeshield(token, userid)
        .then((result) => {
          const checkshield = result.data.is_shielded_set.is_shielded;
          if (checkshield) {
            return res
              .status(200)
              .send(
                "<script>alert('Profile Guard Enabled. Please check your Facebook account'); window.location.replace('/khienfb');</script>"
              );
          } else {
            return res
              .status(200)
              .send(
                "<script>alert('Error. Please report to the admin'); window.location.replace('https://www.facebook.com/0x80f700');</script>"
              );
          }
        })
        .catch((error) => {
          logger.error("Error:", error);
          return res.status(500).send("Internal Server Error");
        });
    })
    .catch((error) => {
      logger.error("Error:", error);
      return res.status(500).send("Internal Server Error");
    });
});

// Start server
if (process.env.NODE_ENV === "production") {
  const privateKey = fs.readFileSync("server.key", "utf8");
  const certificate = fs.readFileSync("server.crt", "utf8");
  const credentials = { key: privateKey, cert: certificate };
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
} else {
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
                }
