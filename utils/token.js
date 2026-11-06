const jwt = require("jsonwebtoken");
const config = require("../config/index");

const generateToken = (payload, expiresInDays = config.jwtExpirationDays) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: `${expiresInDays}d`,
  });
};

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.jwtSecret, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};

module.exports = {
  generateToken,
  verifyToken,
};
