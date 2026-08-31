import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    user: { type: String, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'ORDER_UPDATE' },
    isRead: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
