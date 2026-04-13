const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const validateEmail = (email) =>
  isNonEmptyString(email) && EMAIL_REGEX.test(email.trim());

const validateUsername = (username) =>
  isNonEmptyString(username) && USERNAME_REGEX.test(username.trim());

const validatePassword = (password) =>
  isNonEmptyString(password) && password.length >= 6;

const validateHexColor = (color) =>
  isNonEmptyString(color) && HEX_COLOR_REGEX.test(color.trim());

module.exports = {
  validateEmail,
  validateUsername,
  validatePassword,
  validateHexColor,
  isNonEmptyString,
};
