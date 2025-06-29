const { Queue } = require('bullmq');
const { redis } = require('../../config/redis.config');
const MpesaService = require('../services/payment/mpesa.service');

const paymentQueue = new Queue('paymentQueue', { connection: redis });

paymentQueue.process(async job => {
  const { phone, amount, farmerId, productId } = job.data;
  
  try {
    const result = await MpesaService.initiateSTKPayment(
      phone, 
      amount, 
      farmerId, 
      productId
    );
    return { success: true, data: result };
  } catch (error) {
    throw new Error(`Payment processing failed: ${error.message}`);
  }
});

module.exports = paymentQueue;