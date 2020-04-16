const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const morgan = require("morgan");
var rfs = require("rotating-file-stream"); // version 2.x
const logger = require("./middleware/logger");
const connectDB = require("./config/db");
const colors = require("colors");

// Router оруулж ирэх
const categoriesRoutes = require("./routes/categories");

// Апп-ын тохиргоог process.env рүү ачааллах
dotenv.config({ path: "./config/config.env" });

connectDB();

// create a rotating write stream
var accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "log"),
});

const app = express();

app.use(logger);
// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));
app.use("/api/v1/categories", categoriesRoutes);

const server = app.listen(
  process.env.PORT,
  console.log(`Express server ${process.env.PORT} портон дээр аслаа.`.rainbow)
);

// App даяар цацагдсан try catch хийгээгүй promise-уудыг rejex-үүдийг барьж авч байна.
process.on("unhandledRejection", (err, promise) => {
  console.log(`Алдаа гарлаа.: ${err.message}`.underline.red.bold);
  server.close(() => {
    // Процессыг зогсоож байна. Алдааны кодыг 1 гээд дамжуулж байна.
    process.exit(1);
  });
});
