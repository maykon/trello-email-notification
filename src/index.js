require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const mongoose = require("mongoose");

const sentry = require("./services/Sentry");

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
});

app.use(compression());
app.use(helmet());
app.disable("x-powered-by");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use(require("./routes"));

sentry(io);

http.listen(process.env.PORT || 3000);

process.on("SIGTERM", () => mongoose.disconnect());
