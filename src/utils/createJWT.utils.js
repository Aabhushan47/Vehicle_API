const jwt = require("jsonwebtoken");

const generateAuthToken = (id, role) => {
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });

  return token;
};

module.exports = generateAuthToken;
