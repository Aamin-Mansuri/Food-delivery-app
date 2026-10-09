import API from './api';

export const adminService = {
  getStats: () => API.get('/admin/stats'),
  getAnalytics: () => API.get('/admin/analytics'),
  getAllUsers: () => API.get('/admin/users'),
  toggleBlockUser: (id) => API.patch(`/admin/users/${id}/block`),
  toggleApproveRestaurant: (id) => API.patch(`/admin/restaurants/${id}/approve`),
  getDeliveryPartners: () => API.get('/admin/delivery-partners'),
  updateDeliveryPartner: (id, data) => API.patch(`/admin/delivery-partners/${id}`, data),
  deleteCoupon: (id) => API.delete(`/admin/coupons/${id}`),
  toggleCoupon: (id) => API.patch(`/admin/coupons/${id}/toggle`),

  // MongoDB Atlas Backup & Database Management
  getBackupStatus: () => API.get('/admin/backup/status'),
  syncToMongoAtlas: (data) => API.post('/admin/backup/sync', data || {}),
  testMongoAtlasConnection: (uri) => API.post('/admin/backup/test-connection', { uri }),
  connectMongoAtlasUri: (uri) => API.post('/admin/backup/connect', { uri }),
  exportBackupSnapshot: () => API.get('/admin/backup/export'),
  restoreBackupSnapshot: (snapshot, syncAtlas = true) => API.post('/admin/backup/restore', { snapshot, syncAtlas }),
  toggleAtlasAutoSync: (enabled) => API.post('/admin/backup/auto-sync-toggle', { enabled }),
};


