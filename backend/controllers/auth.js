const axios = require("axios");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");
const nodemailer = require("nodemailer");
const sendgridtransport = require("nodemailer-sendgrid-transport");

const { SEND_GRID, SERVER_KEY, BCRYPT, JWT } = require("../secrets");
const User = require("../models/user");
const { default: Axios } = require("axios");

const transporter = nodemailer.createTransport(
  sendgridtransport({
    auth: {
      api_key: SEND_GRID,
    },
  })
);

// SIGNUP
exports.SignupHandler = async (req, res, next) => {
  const serverKey = SERVER_KEY;
  const humankey = req.body.value;
  //IF NOT CAME BY GOOGLE oAUTH
  if (!req.body.google) {
    //HUMAN VERIFICATION
    try {
      const ishuman = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        `secret=${serverKey}&response=${humankey}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
          },
        }
      );
      if (!ishuman.data.success) {
        throw { statusCode: 500, msg: ["Human Verification failed"] };
      }
    } catch (err) {
      return next(err);
    }
  }
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    //VALIDATION ERRORS
    errors = errors.array();
    const errorArray = [];
    let i = 0;
    while (i < errors.length) {
      errorArray.push(errors[i].param + errors[i].msg);
      i++;
    }
    res.status(422).json({ errors: errorArray });
    return;
  }
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        const err = { statusCode: 404, msg: ["User already exists"] };
        throw err;
      }
      return bcryptjs.hash(password, BCRYPT);
    })
    .then((hashedPwd) => {
      return User.create({
        email: email,
        password: hashedPwd,
      });
    })
    .then((result) => {
      res.status(200).json({ msg: "Signup Succesfull" });
    })
    .catch((err) => next(err));
};

//SIGNIN
exports.SigninHandler = async (req, res, next) => {
  const serverKey = SERVER_KEY;
  const humankey = req.body.value;
  //IF NOT SENT BY GOOGLE OAUTH
  if (!req.body.google) {
    //HUMAN VERIFICATION
    try {
      const ishuman = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        `secret=${serverKey}&response=${humankey}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
          },
        }
      );
      if (!ishuman.data.success) {
        throw { statusCode: 500, msg: ["Human Verification failed"] };
      }
    } catch (err) {
      return next(err);
    }
  }
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (!userDoc) {
        const err = { statusCode: 404, msg: ["User Not found"] };
        throw err;
      }
      return bcryptjs.compare(password, userDoc.password);
    })
    .then((result) => {
      if (result) {
        const token = jwt.sign({ email: email }, JWT, {
          expiresIn: "1h",
        });
        res.status(200).json({ token: token, expiresIn: 3600 });
      } else {
        res
          .status(422)
          .json({ errors: ["Invalid Username/Password Combination"] });
      }
    })
    .catch((err) => next(err));
};

//STEP 1 OF FORGET PASSWORD (SENDING MAIL)
exports.preFogotPassword = async (req, res, next) => {
  const email = req.body.email;
  let temp = "";
  const serverKey = SERVER_KEY;
  const humankey = req.body.value;
  if (!req.body.google) {
    //HUMAN VERIFICATION
    try {
      const ishuman = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        `secret=${serverKey}&response=${humankey}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
          },
        }
      );
      if (!ishuman.data.success) {
        throw { statusCode: 500, msg: ["Human Verification failed"] };
      }
    } catch (err) {
      return next(err);
    }
  }
  User.findOne({ email: email })
    .then((userDoc) => {
      if (!userDoc) {
        const err = {
          statusCode: 404,
          msg: ["No User Found to initiate Forgot Password mechanism"],
        };
        throw err;
      }
      temp = randomstring.generate(15);
      userDoc.resetToken = temp;
      userDoc.resetTokenExpires = Date.now() + 36000000;
      return userDoc.save();
    })
    .then((result) => {
      transporter
        .sendMail({
          to: email,
          from: "pawan_11812061@nitkkr.ac.in",
          subject: "Password Reset Request",
          html: `
          <p>Follow this link <a href = "http://localhost:3000/forgotpass/${temp}">Reset Password</a></p>
      `,
        })
        .catch((err) => console.log(err));
      res
        .status(201)
        .json({ msg: "Password Forgot mechanism initiated Succesfully" });
    })
    .catch((err) => next(err));
};

//STEP 2 OF FORGETPASSWORD (VALIDATING TOKEN)
exports.forgotPassword = (req, res, next) => {
  const resetToken = req.headers.token;
  User.findOne({ resetToken: resetToken })
    .then((userDoc) => {
      if (!userDoc) {
        const err = {
          statusCode: 404,
          msg: ["No User Found to initiate Forgot Password mechanism"],
        };
        throw err;
      }
      if (User.resetTokenExpires < Date.now()) {
        return res
          .status(422)
          .json({ errors: ["Time limit Exceeded... Try again !!"] });
      }
      res.status(200).json({ email: userDoc.email });
    })
    .catch((err) => next(err));
};

//STEP 3 OF FORGET PASSWORD (NEW PASSWORD GENERATION)
exports.postForgotPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const email = req.headers.email;
  let loadedUser;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (!userDoc) {
        const err = {
          statusCode: 404,
          msg: ["User not Found to reset Password"],
        };
        throw err;
      }
      loadedUser = userDoc;
      return bcryptjs.hash(newPassword, BCRYPT);
    })
    .then((hashPwd) => {
      loadedUser.password = hashPwd;
      loadedUser.resetToken = null;
      loadedUser.resetTokenExpires = null;
      return loadedUser.save();
    })
    .then((result) => {
      res.status(201).json({ msg: "Password Reset Succesfull" });
    })
    .catch((err) => next(err));
};

//RESET PASSWORD
exports.resetPassword = (req, res, next) => {
  const email = req.userEmail;
  const oldPwd = req.body.oldPwd;
  const newPwd = req.body.newPwd;
  let loadedUser;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (!userDoc) {
        const err = {
          statusCode: 404,
          msg: ["User not Found to change Password"],
        };
        throw err;
      }
      loadedUser = userDoc;
      return bcryptjs.compare(oldPwd, userDoc.password);
    })
    .then((result) => {
      if (!result) {
        const err = { statusCode: 403, msg: ["Old Password didn't match"] };
        throw err;
      }
      return bcryptjs.hash(newPwd, BCRYPT);
    })
    .then((hashPwd) => {
      loadedUser.password = hashPwd;
      return loadedUser.save();
    })
    .then((result) => {
      res.status(201).json({ msg: "Password changed Succesfully" });
    })
    .catch((err) => next(err));
};
