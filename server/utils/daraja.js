const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const consumerKey = process.env.DARAJA_CONSUMER_KEY;
const consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
const businessShortCode = process.env.DARAJA_BUSINESS_SHORTCODE;
const passkey = process.env.DARAJA_PASSKEY;
const callbackURL = process.env.DARAJA_CALLBACK_URL;
const environment = process.env.DARAJA_ENVIRONMENT;

const baseURL = environment === 'production' 
  ? 'https://api.safaricom.co.ke' 
  : 'https://sandbox.safaricom.co.ke';

// Generate access token
exports.getAccessToken = async () => {
  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const response = await axios.get(`${baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw new Error('Failed to get M-Pesa access token');
  }
};

// Generate security credentials
const generatePassword = () => {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');
  return { password, timestamp };
};

// Initiate STK push
exports.initiateSTKPush = async (phone, amount, transactionId, description = 'MkulimaPay Deposit') => {
  try {
    const accessToken = await this.getAccessToken();
    const { password, timestamp } = generatePassword();
    
    // Format phone number (2547...)
    let formattedPhone = phone.replace(/\D/g, ''); // Remove non-digit characters
    
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      formattedPhone = '254' + formattedPhone;
    }
    
    if (formattedPhone.length !== 12) {
      throw new Error('Invalid phone number format. Expected 12 digits in 2547XXXXXXXX format');
    }

    const payload = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackURL,
      AccountReference: `MkulimaPay. Developer:John Muchire, Dedan Kimathi University.-${transactionId}`,
      TransactionDesc: description
    };
    
    console.log('Initiating STK Push with payload:', payload);
    
    const response = await axios.post(
      `${baseURL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log('STK Push response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error initiating STK push:', {
      error: error.response?.data || error.message,
      phone,
      amount,
      transactionId
    });
    throw new Error(`STK push failed: ${error.response?.data?.errorMessage || error.message}`);
  }
};

// Handle callback
exports.handleCallback = (data) => {
  try {
    console.log('Raw callback received:', JSON.stringify(data, null, 2));
    
    // Safaricom callback structure
    const callback = data.Body?.stkCallback;
    if (!callback) {
      console.error('Invalid callback format: Missing stkCallback object');
      return null;
    }
    
    const resultCode = callback.ResultCode;
    const resultDesc = callback.ResultDesc;
    const checkoutRequestID = callback.CheckoutRequestID;
    const callbackMetadata = callback.CallbackMetadata;
    
    // Extract transaction details
    let amount, mpesaReceiptNumber, phoneNumber, transactionDate;
    
    if (callbackMetadata?.Item) {
      callbackMetadata.Item.forEach(item => {
        if (item.Name === 'Amount') amount = item.Value;
        if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = item.Value;
        if (item.Name === 'PhoneNumber') phoneNumber = item.Value;
        if (item.Name === 'TransactionDate') transactionDate = item.Value;
      });
    }
    
    return {
      success: resultCode == '0', // Safaricom uses string '0' for success
      resultCode,
      resultDesc,
      checkoutRequestID,
      amount,
      mpesaReceiptNumber,
      phoneNumber,
      transactionDate
    };
  } catch (error) {
    console.error('Error processing callback:', error);
    return null;
  }
};