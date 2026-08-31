import { storeService } from '../services/storeService.js';

export const getCoupons = async (req, res) => {
  try {
    const coupons = storeService.getCoupons();
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, cartAmount } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code required' });

    const result = storeService.validateCoupon(code, Number(cartAmount) || 0);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.json({ success: true, message: result.message, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minimumOrder, maximumDiscount, expiryDate } = req.body;
    if (!code || !discountValue || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Missing required coupon fields' });
    }

    const newCoupon = storeService.createCoupon({
      code: code.toUpperCase(),
      description,
      discountType: discountType || 'Percentage',
      discountValue: Number(discountValue),
      minimumOrder: Number(minimumOrder) || 200,
      maximumDiscount: Number(maximumDiscount) || 150,
      expiryDate: new Date(expiryDate),
    });

    res.status(201).json({ success: true, message: 'Coupon created successfully', data: newCoupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
