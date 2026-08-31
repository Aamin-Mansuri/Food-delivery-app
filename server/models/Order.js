import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  food: { type: String, ref: 'Food' },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    orderId: { type: String, required: true, unique: true },
    user: { type: String, ref: 'User', required: true },
    restaurant: { type: String, ref: 'Restaurant', required: true },
    items: [orderItemSchema],
    deliveryAddress: {
      fullName: String,
      phone: String,
      house: String,
      street: String,
      area: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
      latitude: Number,
      longitude: Number,
    },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 40 },
    tax: { type: Number, default: 20 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['COD', 'ONLINE', 'UPI', 'CARD'], default: 'COD' },
    paymentStatus: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
    transactionId: { type: String },
    orderStatus: {
      type: String,
      enum: [
        'PLACED',
        'CONFIRMED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'PICKED_UP',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'PLACED',
    },
    deliveryPartner: { type: String, ref: 'DeliveryPartner' },
    estimatedDeliveryTime: { type: String, default: '30-40 min' },
    deliveryOTP: { type: String, default: '1234' },
    coupon: { type: String },
    cancellationReason: { type: String },
    statusTimeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        message: String,
      },
    ],
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
