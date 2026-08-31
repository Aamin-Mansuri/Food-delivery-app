import jwt from 'jsonwebtoken';
import { storeService } from '../services/storeService.js';

export const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, token missing' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'foodrush_super_secret_jwt_key_2026';
    const decoded = jwt.verify(token, secret);
    const user = storeService.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or token invalid' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked by administrator' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not authorized to access this resource. Allowed roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

