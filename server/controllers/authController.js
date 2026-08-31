import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { storeService } from '../services/storeService.js';
import { sendEmail } from '../config/email.js';

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'foodrush_super_secret_jwt_key_2026';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

const getRedirectPathForRole = (role) => {
  switch (role) {
    case 'restaurant_owner':
      return '/restaurant/dashboard';
    case 'delivery_partner':
      return '/delivery/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'customer':
    default:
      return '/';
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingUser = storeService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const validRoles = ['customer', 'restaurant_owner', 'delivery_partner', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'customer';

    const user = storeService.createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      role: userRole,
    });

    const token = generateToken(user._id);

    sendEmail({
      to: email,
      subject: 'Welcome to FoodRush! 🚀',
      text: `Hello ${name}, welcome to FoodRush! Your account has been created successfully with the ${userRole} role.`,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
        },
        redirectPath: getRedirectPathForRole(user.role),
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, requestedRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    const user = storeService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked by an administrator' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Optional role validation on login
    if (requestedRole && user.role !== requestedRole && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Account is registered as "${user.role}", not as "${requestedRole}".`,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          favoriteRestaurants: user.favoriteRestaurants || [],
          favoriteFoods: user.favoriteFoods || [],
        },
        redirectPath: getRedirectPathForRole(user.role),
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const switchRole = async (req, res) => {
  try {
    const { newRole } = req.body;
    const validRoles = ['customer', 'restaurant_owner', 'delivery_partner', 'admin'];

    if (!validRoles.includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${validRoles.join(', ')}`,
      });
    }

    const updatedUser = storeService.updateUser(req.user._id, { role: newRole });
    res.json({
      success: true,
      message: `Role switched to ${newRole}`,
      data: {
        user: updatedUser,
        redirectPath: getRedirectPathForRole(newRole),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getMe = async (req, res) => {
  res.json({
    success: true,
    data: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      avatar: req.user.avatar,
      favoriteRestaurants: req.user.favoriteRestaurants || [],
      favoriteFoods: req.user.favoriteFoods || [],
    },
  });
};

export const sendOTP = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await sendEmail({
    to: email,
    subject: 'FoodRush - Verification OTP',
    text: `Your OTP for FoodRush is: ${otp}`,
  });
  res.json({ success: true, message: 'OTP sent to email', data: { otp } });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = storeService.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ success: false, message: 'No account with that email' });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  storeService.updateUser(user._id, { otp });
  await sendEmail({
    to: email,
    subject: 'FoodRush - Password Reset Code',
    text: `Your password reset code is: ${otp}`,
  });
  res.json({ success: true, message: 'Password reset code sent to email' });
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = storeService.findUserByEmail(email);
  if (!user) return res.status(400).json({ success: false, message: 'User not found' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  storeService.updateUser(user._id, { password: hashedPassword, otp: null });
  res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
};
