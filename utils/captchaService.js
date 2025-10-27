// utils/captchaService.js
const axios = require('axios');

exports.verifyRecaptcha = async (token) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const response = await axios.post(
    'https://www.google.com/recaptcha/api/siteverify',
    null,
    {
      params: {
        secret,
        response: token
      }
    }
  );
  return response.data.success;
};