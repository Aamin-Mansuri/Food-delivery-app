import API from './api';

export const notificationService = {
  getNotifications: () => API.get('/notifications'),
  markNotificationsRead: () => API.patch('/notifications/read-all'),
};
