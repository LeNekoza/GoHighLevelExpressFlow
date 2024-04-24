import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { db } from "./redis/ds.js";
import indexRouter from "./routes/index.js";
import dotenv from "dotenv";
import cors from "cors";

var app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "https://127.0.0.1:5000"],
    credentials: true,
  })
);
const __dirname = path.resolve();
// view engine setup
dotenv.config();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
