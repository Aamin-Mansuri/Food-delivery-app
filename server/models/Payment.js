import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    order: { type: String, ref: 'Order', required: true },
    user: { type: String, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['COD', 'ONLINE', 'UPI', 'CARD'], required: true },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
    transactionId: { type: String },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
