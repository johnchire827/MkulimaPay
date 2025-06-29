module.exports = {
    apiKey: process.env.MPESA_API_KEY,
    publicKey: process.env.MPESA_PUBLIC_KEY || '',
    shortcode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY,
    environment: process.env.MPESA_ENV || 'sandbox',
    callbackBaseUrl: process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api'
  };