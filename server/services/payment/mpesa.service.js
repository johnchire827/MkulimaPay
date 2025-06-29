const { Mpesa } = require('mpesa-node');
const config = require('../../config/mpesa.config');
const Transaction = require('../../models/transaction.model');
const Farmer = require('../../models/farmer.model');

class MpesaService {
  constructor() {
    this.mpesa = new Mpesa({
      apiKey: config.apiKey,
      publicKey: config.publicKey,
      environment: config.environment
    });
  }

  async initiateSTKPayment(phone, amount, farmerId, productId) {
    try {
      // Format phone number (2547XXXXXXXX)
      const formattedPhone = phone.startsWith('0') ? '254' + phone.substring(1) : phone;
      
      const response = await this.mpesa.stkPush({
        amount,
        phone: formattedPhone,
        reference: `MKULIMA-${Date.now()}`,
        description: 'Farm Produce Purchase',
        callbackUrl: `${config.callbackBaseUrl}/payments/callback`
      });
      
      // Save transaction to DB
      await Transaction.create({
        farmerId,
        productId,
        amount,
        status: 'pending',
        mpesaCode: response.CheckoutRequestID,
        phone: formattedPhone
      });
      
      return response;
    } catch (error) {
      console.error('M-Pesa STK push failed:', error);
      throw new Error('Payment initiation failed');
    }
  }

  async handleCallback(data) {
    const { Body: { stkCallback: { CheckoutRequestID, ResultCode } } } = data;
    
    const transaction = await Transaction.findOne({ 
      where: { mpesaCode: CheckoutRequestID } 
    });
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    if (ResultCode === 0) {
      transaction.status = 'completed';
      await transaction.save();
      
      // Update farmer balance
      await Farmer.increment('balance', {
        by: transaction.amount,
        where: { id: transaction.farmerId }
      });
    } else {
      transaction.status = 'failed';
      await transaction.save();
    }
    
    return transaction;
  }
}

module.exports = new MpesaService();