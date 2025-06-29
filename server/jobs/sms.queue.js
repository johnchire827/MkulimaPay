const { Queue } = require('bullmq');
const { redis } = require('../../config/redis.config');
const SmsService = require('../services/sms/sms.service');

const smsQueue = new Queue('smsQueue', { connection: redis });

smsQueue.process(async job => {
  const { phone, message } = job.data;
  
  try {
    const result = await SmsService.sendSms(phone, message);
    return { success: true, data: result };
  } catch (error) {
    throw new Error(`SMS sending failed: ${error.message}`);
  }
});

module.exports = smsQueue;