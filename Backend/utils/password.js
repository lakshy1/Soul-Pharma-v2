const bcrypt = require("bcryptjs");

const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

const verifyPassword = async (plain, hash) => bcrypt.compare(plain, hash);

const hashOtp = async (plain) => {
  const salt = await bcrypt.genSalt(6);
  return bcrypt.hash(plain, salt);
};

const verifyOtp = async (plain, hash) => bcrypt.compare(plain, hash);

module.exports = { hashPassword, verifyPassword, hashOtp, verifyOtp };
