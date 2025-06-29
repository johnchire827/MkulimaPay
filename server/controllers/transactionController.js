const { Transaction, User } = require('../models');
const { initiateSTKPush, handleCallback } = require('../utils/daraja');
const { Op } = require('sequelize');

exports.createTransaction = async (req, res) => {
  try {
    const { userId, amount, type, phone, provider } = req.body;
    
    // Validate transaction type
    if (type !== 'deposit' && type !== 'withdrawal') {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }
    
    // Create transaction
    const transaction = await Transaction.create({
      user_id: userId,
      amount: parseFloat(amount),
      type,
      phone,
      provider,
      status: 'pending'
    });

    console.log(`Transaction created: ${transaction.id} (${type})`);

    // For deposits, initiate STK push
    if (type === 'deposit') {
      try {
        const stkResponse = await initiateSTKPush(
          phone, 
          amount, 
          transaction.id,
          'MkulimaPay Deposit'
        );
        
        // Save checkout request ID
        transaction.checkout_request_id = stkResponse.CheckoutRequestID;
        await transaction.save();
        
        console.log('STK Push initiated:', {
          transactionId: transaction.id,
          checkoutRequestID: stkResponse.CheckoutRequestID,
          responseCode: stkResponse.ResponseCode,
          responseDescription: stkResponse.ResponseDescription
        });
      } catch (error) {
        console.error('STK push failed:', error);
        transaction.status = 'failed';
        await transaction.save();
        return res.status(500).json({ 
          error: 'Failed to initiate payment',
          details: error.message 
        });
      }
    } 
    // For withdrawals, handle immediately
    else if (type === 'withdrawal') {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check sufficient balance
      if (parseFloat(user.balance) < parseFloat(amount)) {
        transaction.status = 'failed';
        await transaction.save();
        return res.status(400).json({ error: 'Insufficient funds' });
      }
      
      // Update balance immediately
      user.balance -= parseFloat(amount);
      await user.save();
      
      // Set status to processing (simulate B2C)
      transaction.status = 'processing';
      await transaction.save();
      
      console.log(`Withdrawal processing: ${transaction.id}`);
    }

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find and update transaction
    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    transaction.status = status;
    await transaction.save();

    // If deposit completed, update user balance
    if (status === 'completed' && transaction.type === 'deposit') {
      const user = await User.findByPk(transaction.user_id);
      if (user) {
        user.balance = (parseFloat(user.balance) || 0) + parseFloat(transaction.amount);
        await user.save();
        console.log(`Balance updated for user ${user.id}: +${transaction.amount}`);
      }
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

exports.handleCallback = async (req, res) => {
  try {
    console.log('Received M-Pesa callback:', JSON.stringify(req.body, null, 2));
    
    const callbackData = handleCallback(req.body);
    
    if (!callbackData) {
      console.error('Invalid callback format');
      return res.status(400).json({
        ResultCode: 1,
        ResultDesc: 'Invalid callback format'
      });
    }
    
    console.log('Processed callback data:', callbackData);

    // Find transaction by checkout request ID
    const transaction = await Transaction.findOne({
      where: { checkout_request_id: callbackData.checkoutRequestID }
    });
    
    if (!transaction) {
      console.error('Transaction not found for checkout ID:', callbackData.checkoutRequestID);
      return res.status(404).json({
        ResultCode: 1,
        ResultDesc: 'Transaction not found'
      });
    }
    
    console.log(`Transaction found: ${transaction.id} (${transaction.type})`);
    
    // Update transaction based on callback
    if (callbackData.success) {
      transaction.status = 'completed';
      transaction.mpesa_receipt = callbackData.mpesaReceiptNumber;
      
      // Update user balance for deposits
      if (transaction.type === 'deposit') {
        const user = await User.findByPk(transaction.user_id);
        if (user) {
          user.balance = (parseFloat(user.balance) || 0) + parseFloat(transaction.amount);
          await user.save();
          console.log(`Balance updated for user ${user.id}: +${transaction.amount}`);
        }
      }
      
      console.log(`Transaction completed: ${transaction.id}`);
    } else {
      transaction.status = 'failed';
      console.log(`Transaction failed: ${transaction.id} - ${callbackData.resultDesc}`);
    }
    
    await transaction.save();
    
    // Respond to Daraja
    res.json({
      ResultCode: 0,
      ResultDesc: 'Success'
    });
  } catch (error) {
    console.error('Error handling callback:', error);
    res.status(500).json({
      ResultCode: 1,
      ResultDesc: 'Failed to process callback'
    });
  }
};

exports.getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const transactions = await Transaction.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByPk(id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};