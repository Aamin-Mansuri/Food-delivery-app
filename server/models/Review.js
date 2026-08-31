import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    user: { type: String, ref: 'User', required: true },
    restaurant: { type: String, ref: 'Restaurant', required: true },
    order: { type: String, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
