const express = require("express");
const { body } = require("express-validator");

const authcontroller = require("../controllers/auth");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.post(
  "/signup",
  [
    body("email").trim().isEmail().withMessage(" is not valid"),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage(" length should be atleast 6 characters long"),
  ],
  authcontroller.SignupHandler
);

router.post("/signin", authcontroller.SigninHandler);

router.post("/preforgetpassword", authcontroller.preFogotPassword);

router.post("/validateforgetToken", authcontroller.forgotPassword);

router.post("/forgotpassword", authcontroller.postForgotPassword);

router.post("/resetpassword", isAuth, authcontroller.resetPassword);

module.exports = router;
