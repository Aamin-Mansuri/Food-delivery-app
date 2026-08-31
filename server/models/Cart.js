import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  food: { type: String, ref: 'Food', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true },
  name: { type: String },
  image: { type: String },
});

const cartSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    user: { type: String, ref: 'User', required: true, unique: true },
    restaurant: { type: String, ref: 'Restaurant' },
    items: [cartItemSchema],
    subtotal: { type: Number, default: 0 },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);
