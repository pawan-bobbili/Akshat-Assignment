const jwt = require("jsonwebtoken");
const { JWT } = require("../secrets");

module.exports = (req, res, next) => {
  const token = req.headers.token;
  if (!token) {
    const error = { statusCode: 422, msg: ["Token Validation Failed"] };
    return next(error);
  }
  try {
    const { email } = jwt.verify(token, JWT);
    req.userEmail = email;
    next();
  } catch (err) {
    const error = { statusCode: 422, msg: ["Token Validation Failed"] };
    next(error);
  }
};
