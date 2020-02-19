const validator = require("validator");

module.exports = class {
  checkUserSingUpData(userSingUpData) {
    if (!/^[a-zA-Z0-9_-]{6,32}$/.test(userSingUpData.userName)) {
      return "Invalid username!";
    }
    if (!validator.isEmail(userSingUpData.email)) {
      return "Invalid email!";
    }
    if (!/^.{6,}$/.test(userSingUpData.password)) {
      return "Password has to have 6 or more characters";
    }
  }
};