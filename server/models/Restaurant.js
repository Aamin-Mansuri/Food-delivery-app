import mongoose from 'mongoose';

// Sub-schema for structured menu items within the restaurant
const menuItemSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: { type: String, required: [true, 'Menu item name is required'], trim: true },
    description: { type: String, trim: true },
    category: { type: String, default: 'Main Course' },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    discountPrice: { type: Number, default: 0, min: 0 },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    },
    isVegetarian: { type: Boolean, default: true },
    isVegan: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: String, default: '15-25 min' },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { _id: false, timestamps: true }
);

// Sub-schema for structured location / address details
const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    area: { type: String, trim: true },
    city: { type: String, default: 'Mumbai', trim: true },
    state: { type: String, default: 'Maharashtra', trim: true },
    pincode: { type: String, trim: true },
    formattedAddress: { type: String, trim: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [72.8777, 19.076] }, // [longitude, latitude]
    },
  },
  { _id: false }
);

// Main Restaurant Schema
const restaurantSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: 'Delicious food delivered hot and fresh from our kitchen.',
    },
    owner: {
      type: String,
      ref: 'User',
      required: true,
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
    },
    
    // Address fields - supports both flat strings and structured address object
    address: {
      type: String,
      required: [true, 'Restaurant address is required'],
      trim: true,
    },
    addressDetails: {
      type: addressSchema,
      default: () => ({}),
    },
    city: {
      type: String,
      required: true,
      default: 'Mumbai',
      index: true,
    },
    state: {
      type: String,
      default: 'Maharashtra',
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: Number,
      default: 19.076,
    },
    longitude: {
      type: Number,
      default: 72.8777,
    },

    // Cuisine & Categories
    cuisineTypes: {
      type: [String],
      required: [true, 'At least one cuisine type is required'],
      index: true,
    },
    cuisine: {
      type: String, // Convenient singular alias for primary cuisine
      default: function () {
        return this.cuisineTypes && this.cuisineTypes.length > 0 ? this.cuisineTypes[0] : 'Multi-Cuisine';
      },
    },

    // Rating & Popularity metrics for Featured Grid sorting
    rating: {
      type: Number,
      default: 4.5,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5'],
      index: true,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Embedded Menu Items and references
    menuItems: {
      type: [menuItemSchema],
      default: [],
    },

    // Operational & Grid Display Attributes
    isFeatured: {
      type: Boolean,
      default: true,
      index: true,
    },
    deliveryTime: {
      type: String,
      default: '25-35 min',
    },
    minimumOrder: {
      type: Number,
      default: 150,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 40,
      min: 0,
    },
    costForTwo: {
      type: Number,
      default: 400,
      min: 0,
    },
    isVegetarian: {
      type: Boolean,
      default: false,
      index: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
      index: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    tags: [{ type: String }],
  },
  {
    timestamps: true,
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for id getter
restaurantSchema.virtual('id').get(function () {
  return this._id;
});

// Virtual for primary cuisine string representation
restaurantSchema.virtual('cuisinesText').get(function () {
  return (this.cuisineTypes || []).join(', ');
});

// Indexes for fast grid queries and text search
restaurantSchema.index({ name: 'text', description: 'text', cuisineTypes: 'text' });
restaurantSchema.index({ isFeatured: 1, rating: -1, isOpen: 1 });
restaurantSchema.index({ city: 1, isApproved: 1, isBlocked: 1 });

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;
export { restaurantSchema, menuItemSchema };

