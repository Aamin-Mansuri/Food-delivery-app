import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'restaurant_owner', 'delivery_partner', 'admin'],
      default: 'customer',
    },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80' },
    isVerified: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    favoriteRestaurants: [{ type: String, ref: 'Restaurant' }],
    favoriteFoods: [{ type: String, ref: 'Food' }],
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
