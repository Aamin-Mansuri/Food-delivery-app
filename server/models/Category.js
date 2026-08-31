import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true },
    icon: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, _id: false }
);

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
