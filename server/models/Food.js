import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true },
    description: { type: String },
    restaurant: { type: String, ref: 'Restaurant', required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    image: { type: String, default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' },
    ingredients: [{ type: String }],
    isVegetarian: { type: Boolean, default: true },
    isVegan: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: String, default: '15-20 min' },
    rating: { type: Number, default: 4.8 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Food || mongoose.model('Food', foodSchema);
