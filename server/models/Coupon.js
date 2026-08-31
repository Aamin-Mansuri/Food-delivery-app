import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    discountType: { type: String, enum: ['Percentage', 'Fixed Amount'], default: 'Percentage' },
    discountValue: { type: Number, required: true },
    minimumOrder: { type: Number, default: 200 },
    maximumDiscount: { type: Number, default: 150 },
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 1000 },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
