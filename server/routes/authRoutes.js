import express from 'express';
import {
  register,
  login,
  getMe,
  sendOTP,
  forgotPassword,
  resetPassword,
  switchRole,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Authentication endpoints
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.patch('/switch-role', protect, switchRole);

// Password & OTP endpoints
router.post('/send-otp', sendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;

