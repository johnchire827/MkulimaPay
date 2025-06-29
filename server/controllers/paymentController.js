const { Order, Transaction } = require('../models');
const { initiateSTKPush } = require('../utils/daraja');

exports.processMpesaPayment = async (req, res) => {
  try {
    const { orderId, phone, amount } = req.body;
    
    // Validate order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Create transaction
    const transaction = await Transaction.create({
      user_id: order.user_id,
      amount: parseFloat(amount),
      type: 'order_payment',
      phone: phone,
      provider: 'Safaricom',
      status: 'pending'
    });

    // Initiate STK push
    const stkResponse = await initiateSTKPush(
      phone, 
      amount, 
      transaction.id,
      `Payment for Order #${orderId}`
    );
    
    // Update transaction with checkout request ID
    transaction.checkout_request_id = stkResponse.CheckoutRequestID;
    await transaction.save();
    
    // Update order status
    order.status = 'payment_pending';
    await order.save();

    res.json({
      message: 'Payment initiated. Please check your phone.',
      transactionId: transaction.id,
      checkoutRequestId: stkResponse.CheckoutRequestID
    });
    
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    res.status(500).json({ 
      error: 'Payment processing failed',
      details: error.message 
    });
  }
};