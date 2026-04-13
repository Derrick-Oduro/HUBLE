const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthService {
  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static generateToken(payload, expiresIn = "7d") {
    return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn,
    });
  }

  static verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
  }
}

module.exports = AuthService;
