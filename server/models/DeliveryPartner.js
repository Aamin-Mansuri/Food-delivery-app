import mongoose from 'mongoose';

const deliveryPartnerSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    user: { type: String, ref: 'User', required: true, unique: true },
    isOnline: { type: Boolean, default: true },
    vehicleType: { type: String, enum: ['Bike', 'Scooter', 'Bicycle'], default: 'Bike' },
    vehicleNumber: { type: String, default: 'MH-02-FR-1080' },
    currentLocation: {
      latitude: { type: Number, default: 19.076 },
      longitude: { type: Number, default: 72.8777 },
    },
    totalDeliveries: { type: Number, default: 24 },
    rating: { type: Number, default: 4.9 },
    earningsToday: { type: Number, default: 1250 },
    totalEarnings: { type: Number, default: 18400 },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.DeliveryPartner || mongoose.model('DeliveryPartner', deliveryPartnerSchema);
