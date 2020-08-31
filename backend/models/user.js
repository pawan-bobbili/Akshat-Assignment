const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  password: {
    type: mongoose.Schema.Types.String,
    required: true,
  },
  resetToken: {
    type: mongoose.Schema.Types.String,
  },
  resetTokenExpires: {
    type: mongoose.Schema.Types.Date,
  },
});

module.exports = mongoose.model("user", userSchema, "users");
