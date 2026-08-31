import { storeService } from '../services/storeService.js';

export const getNotifications = async (req, res) => {
  try {
    const notifications = storeService.getNotifications(req.user._id);
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationsRead = async (req, res) => {
  try {
    storeService.markNotificationsRead(req.user._id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
