const { Mpesa } = require('mpesa-node');
const config = require('../../config/mpesa.config');

exports.generateTimestamp = () => {
  const date = new Date();
  return (
    date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0') +
    String(date.getHours()).padStart(2, '0') +
    String(date.getMinutes()).padStart(2, '0') +
    String(date.getSeconds()).padStart(2, '0')
  );
};

exports.generatePassword = (shortcode, passkey, timestamp) => {
  const buffer = Buffer.from(shortcode + passkey + timestamp);
  return buffer.toString('base64');
};

exports.initiateMpesa = () => {
  return new Mpesa({
    apiKey: config.apiKey,
    publicKey: config.publicKey,
    environment: config.environment
  });
};

exports.formatPhoneNumber = (phone) => {
  let formatted = phone.replace(/\D/g, '');
  if (formatted.startsWith('0')) formatted = '254' + formatted.substring(1);
  if (formatted.startsWith('7')) formatted = '254' + formatted;
  return formatted;
};