import { storeService } from '../services/storeService.js';

export const verifyPayment = async (req, res) => {
  try {
    const { orderId, transactionId } = req.body;

    const order = storeService.getOrderById(orderId);
    if (order) {
      order.paymentStatus = 'COMPLETED';
      if (transactionId) {
        order.transactionId = transactionId;
      }
    }

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: { orderId, transactionId: transactionId || `txn_${Date.now()}` },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
