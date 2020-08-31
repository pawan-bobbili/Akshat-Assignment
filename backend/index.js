const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const { MONGO_URI } = require("./secrets");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log("Request recieved");
  next();
});

app.use("/auth", authRoutes);

app.use((err, req, res, next) => {
  let error = err.msg;
  if (!error) {
    error = ["Server Side error..!"];
  }
  res.status(err.statusCode || 500).json({ errors: error });
});

mongoose.connect(MONGO_URI).then(() => {
  console.log("Connected");
  app.listen(9000);
});
