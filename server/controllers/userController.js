import { storeService } from '../services/storeService.js';
import { uploadToCloudinaryMock } from '../config/cloudinary.js';

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    let newAvatar = avatar;

    if (req.file) {
      const uploadRes = await uploadToCloudinaryMock(req.file.buffer, 'avatars');
      newAvatar = uploadRes.secure_url;
    }

    const updated = storeService.updateUser(req.user._id, {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(newAvatar && { avatar: newAvatar }),
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        avatar: updated.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
