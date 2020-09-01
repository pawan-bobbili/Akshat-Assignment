const express = require("express");
const { body } = require("express-validator");

const authcontroller = require("../controllers/auth");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

//SIGNUP
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

//SIGNIN
router.post("/signin", authcontroller.SigninHandler);

//STEP 1 OF FORGET PASSWORD
router.post("/preforgetpassword", authcontroller.preFogotPassword);

//STEP 2 OF FORGET PASSWORD
router.post("/validateforgetToken", authcontroller.forgotPassword);

//STEP 3 OF FORGET PASSWORD
router.post("/forgotpassword", authcontroller.postForgotPassword);

//PROTECTED ROUTE
router.post("/resetpassword", isAuth, authcontroller.resetPassword);

module.exports = router;
