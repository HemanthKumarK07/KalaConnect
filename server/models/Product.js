import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    shortTitle: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    artisanId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    artisanName: { type: String, required: true },
    category: { type: String, required: true },
    craft: { type: String },
    village: { type: String },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    images: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
