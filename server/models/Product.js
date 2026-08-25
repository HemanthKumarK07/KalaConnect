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
    rating: { type: Number, default: 5.0 },
    reviews: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    images: [{ type: String }],
    description: { type: String },
    materials: [{ type: String }],
    story: { type: String },
    dimensions: { type: String },
    weight: { type: String },

    // --- Fair Price Recommendation & Artisan Cost Breakdown ---
    materialCost: { type: Number, default: 0, min: 0 },
    labourCost: { type: Number, default: 0, min: 0 },
    packagingCost: { type: Number, default: 0, min: 0 },
    otherCost: { type: Number, default: 0, min: 0 },
    craftingHours: { type: Number, default: 0, min: 0 },
    quantityProduced: { type: Number, default: 1, min: 1 },
    qualityLevel: { 
      type: String, 
      enum: ['Standard', 'Premium', 'Masterpiece / GI-Tagged'], 
      default: 'Standard' 
    },
    estimatedProductionCost: { type: Number, default: 0, min: 0 },
    recommendedMinPrice: { type: Number, default: 0, min: 0 },
    recommendedMaxPrice: { type: Number, default: 0, min: 0 },
    recommendedProfit: { type: Number, default: 0, min: 0 },
    finalSellingPrice: { type: Number, min: 0 },
    isFairlyPriced: { type: Boolean, default: true },
    pricingNotes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);

