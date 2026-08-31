import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    user: { type: String, ref: 'User', required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    house: { type: String, required: true },
    street: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true, default: 'Maharashtra' },
    pincode: { type: String, required: true },
    landmark: { type: String },
    latitude: { type: Number, default: 19.076 },
    longitude: { type: Number, default: 72.8777 },
    type: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Address || mongoose.model('Address', addressSchema);
