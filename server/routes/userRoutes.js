import express from 'express';
import { updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.put('/profile', protect, upload.single('avatar'), updateProfile);

export default router;
