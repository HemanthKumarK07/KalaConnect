import Product from '../models/Product.js';
import { generateCompletion } from '../services/groq.js';

// Category-based baseline fair profit margins (Min & Max %)
// These are realistic margins for Indian rural handicraft markets
const CATEGORY_MARGINS = {
  textiles: { min: 0.15, max: 0.30, label: 'Handloom & Textiles' },
  pottery: { min: 0.12, max: 0.25, label: 'Pottery & Ceramics' },
  jewelry: { min: 0.20, max: 0.35, label: 'Traditional Jewelry' },
  paintings: { min: 0.20, max: 0.40, label: 'Folk Art & Paintings' },
  woodwork: { min: 0.15, max: 0.30, label: 'Woodwork & Toys' },
  brass_metal: { min: 0.18, max: 0.32, label: 'Metalcraft & Dhokra' },
  leather: { min: 0.15, max: 0.28, label: 'Leather Craft' },
  default: { min: 0.12, max: 0.25, label: 'Handicrafts' }
};

// Quality level margin multipliers
const QUALITY_MULTIPLIERS = {
  'Standard': 1.0,
  'Premium': 1.15,
  'Masterpiece / GI-Tagged': 1.30,
};

const COST_FIELDS = ['materialCost', 'labourCost', 'packagingCost', 'otherCost', 'craftingHours'];
const INTERNAL_PRICING_FIELDS = [
  'materialCost', 'labourCost', 'packagingCost', 'otherCost', 'craftingHours',
  'quantityProduced', 'estimatedProductionCost', 'recommendedMinPrice',
  'recommendedMaxPrice', 'recommendedProfit', 'finalSellingPrice', 'pricingNotes'
];

const isValidNonNegativeNumber = (value) => value !== '' && value !== null && value !== undefined
  && Number.isFinite(Number(value)) && Number(value) >= 0;

const hideInternalPricing = (product) => {
  const plainProduct = product.toObject ? product.toObject() : { ...product };
  INTERNAL_PRICING_FIELDS.forEach((field) => delete plainProduct[field]);
  return plainProduct;
};

/**
 * @desc    Calculate AI-based Fair Price Recommendation for Artisans
 * @route   POST /api/products/fair-price
 * @access  Private (Artisan, Admin)
 */
export const calculateFairPrice = async (req, res, next) => {
  try {
    const {
      productName,
      category = 'default',
      materialCost = 0,
      labourCost = 0,
      craftingHours = 0,
      packagingCost = 0,
      otherCost = 0,
      qualityLevel = 'Standard',
      quantity = 1,
      askAiInsights = false
    } = req.body;

    // Reject malformed or negative values instead of silently turning them into zero.
    if (![materialCost, labourCost, packagingCost, otherCost, craftingHours].every(isValidNonNegativeNumber)
      || !Number.isFinite(Number(quantity)) || Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Costs and crafting time must be valid non-negative numbers, and quantity must be at least 1.'
      });
    }

    const matCost = Number(materialCost);
    const labCost = Number(labourCost);
    const packCost = Number(packagingCost);
    const othCost = Number(otherCost);
    const hours = Number(craftingHours);
    const qty = Number(quantity);

    // 2. Base Production Cost per unit
    const totalUnitCost = (matCost + labCost + packCost + othCost) / qty;
    const estimatedProductionCost = Math.round(totalUnitCost);

    if (estimatedProductionCost <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total production cost must be greater than zero. Please enter raw material or labour cost.'
      });
    }

    // 3. Margin determination based on craft category and quality
    const normalizedCategory = (category || 'default').toLowerCase().replace(/[^a-z_]/g, '');
    const catConfig = CATEGORY_MARGINS[normalizedCategory] || CATEGORY_MARGINS.default;
    const qualityMultiplier = QUALITY_MULTIPLIERS[qualityLevel] || 1.0;

    const minMarginRate = catConfig.min * qualityMultiplier;
    const maxMarginRate = catConfig.max * qualityMultiplier;

    // 4. Calculate recommended profit & price ranges
    // Profit is purely proportional — no artificial minimum floors
    const recommendedMinProfit = Math.round(estimatedProductionCost * minMarginRate);
    const recommendedMaxProfit = Math.round(estimatedProductionCost * maxMarginRate);

    const recommendedMinPrice = estimatedProductionCost + recommendedMinProfit;
    const recommendedMaxPrice = estimatedProductionCost + recommendedMaxProfit;
    const suggestedOptimalPrice = Math.round((recommendedMinPrice + recommendedMaxPrice) / 2);

    // 5. Market price benchmarking from database
    let marketComparison = null;
    try {
      const existingProducts = await Product.find({
        category: { $regex: new RegExp(category, 'i') }
      }).select('price sold rating shortTitle');

      if (existingProducts && existingProducts.length > 0) {
        const prices = existingProducts.map(p => p.price);
        const avgMarketPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
        const minMarketPrice = Math.min(...prices);
        const maxMarketPrice = Math.max(...prices);

        marketComparison = {
          sampleSize: existingProducts.length,
          avgMarketPrice,
          minMarketPrice,
          maxMarketPrice,
          note: `Based on ${existingProducts.length} marketplace listings in ${catConfig.label}.`
        };
      }
    } catch (dbErr) {
      console.warn('Market benchmarking query failed:', dbErr.message);
    }

    // 6. Labor valuation health check
    let labourFairnessNote = null;
    if (hours > 0) {
      const hourlyRate = labCost / hours;
      if (hourlyRate < 100) {
        labourFairnessNote = `?? Notice: Your current labour rate of ?${Math.round(hourlyRate)}/hr is below the standard fair living wage of ?120-150/hr for skilled artisans. Consider increasing labour value to protect your craftsmanship.`;
      } else {
        labourFairnessNote = `? Fair Wage Check: Your labour compensation of ?${Math.round(hourlyRate)}/hr fairly values your crafting time.`;
      }
    }

    // 7. Optional AI Craft Valuation Insight via Groq
    let aiInsight = null;
    if (askAiInsights && process.env.GROQ_API_KEY) {
      try {
        const prompt = `As Kalai, KalaConnect's Fair Trade pricing advisor, provide a brief 2-sentence artisan welfare recommendation for a ${qualityLevel} ${productName || category} handmade craft with production cost ?${estimatedProductionCost}, recommended selling range ?${recommendedMinPrice} - ?${recommendedMaxPrice}. Highlight why this ensures fair livelihood and authentic customer value.`;
        const aiResponse = await generateCompletion([
          { role: 'system', content: 'You are an ethical fair-trade artisan pricing expert. Keep advice encouraging, practical, and concise.' },
          { role: 'user', content: prompt }
        ]);
        if (aiResponse && aiResponse.content) {
          aiInsight = aiResponse.content.replace(/<think>[\s\S]*?<\/think>\s*/gi, '').trim();
        }
      } catch (aiErr) {
        console.warn('AI pricing insight generation skipped:', aiErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        costBreakdown: {
          materialCost: matCost,
          labourCost: labCost,
          packagingCost: packCost,
          otherCost: othCost,
          craftingHours: hours,
          quantity: qty,
          estimatedProductionCost
        },
        recommendation: {
          recommendedMinPrice,
          recommendedMaxPrice,
          suggestedOptimalPrice,
          recommendedMinProfit,
          recommendedMaxProfit,
          profitMarginRange: `${Math.round(minMarginRate * 100)}% � ${Math.round(maxMarginRate * 100)}%`,
          qualityLevel,
          categoryName: catConfig.label,
          labourFairnessNote,
          marketComparison,
          aiInsight
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new product by an artisan
 * @route   POST /api/products
 * @access  Private (Artisan, Admin)
 */
export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      shortTitle,
      price,
      originalPrice,
      category,
      craft,
      village,
      images,
      description,
      materials,
      story,
      dimensions,
      weight,
      inStock,
      // Cost & Fair Price Fields
      materialCost = 0,
      labourCost = 0,
      packagingCost = 0,
      otherCost = 0,
      craftingHours = 0,
      qualityLevel = 'Standard',
      estimatedProductionCost = 0,
      recommendedMinPrice = 0,
      recommendedMaxPrice = 0,
      recommendedProfit = 0,
      finalSellingPrice,
      quantityProduced = 1
    } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product title, price, and category.'
      });
    }

    if (!Array.isArray(images) || images.length === 0 || images.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'A product must have between 1 and 5 images.'
      });
    }

    // Ensure exactly one primary image
    const primaryCount = images.filter(img => img.isPrimary).length;
    if (primaryCount !== 1) {
      images.forEach((img, idx) => {
        img.isPrimary = (idx === 0);
      });
    }

    if (!COST_FIELDS.every((field) => isValidNonNegativeNumber(req.body[field] ?? 0))
      || !Number.isFinite(Number(quantityProduced)) || Number(quantityProduced) < 1) {
      return res.status(400).json({ success: false, message: 'Pricing costs must be valid non-negative numbers and quantity must be at least 1.' });
    }

    const sellingPrice = Number(finalSellingPrice ?? price);
    if (isNaN(sellingPrice) || sellingPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product selling price must be a valid positive number.'
      });
    }

    const product = await Product.create({
      title,
      shortTitle: shortTitle || title.slice(0, 30),
      price: sellingPrice,
      originalPrice: originalPrice || Math.round(sellingPrice * 1.2),
      artisanId: req.user._id,
      artisanName: req.user.name,
      category: category.toLowerCase(),
      craft: craft || req.user.craft || 'Traditional Craft',
      village: village || req.user.district || req.user.state || 'India',
      images: Array.isArray(images) && images.length > 0 
        ? images.map((img, i) => ({
            url: img.url,
            publicId: img.publicId,
            isPrimary: img.isPrimary || false,
            order: img.order !== undefined ? img.order : i
          }))
        : [],
      description: description || '',
      materials: Array.isArray(materials) ? materials : [],
      story: story || '',
      dimensions: dimensions || '',
      weight: weight || '',
      inStock: inStock !== undefined ? inStock : true,

      // Fair Price Metadata
      materialCost: Number(materialCost) || 0,
      labourCost: Number(labourCost) || 0,
      packagingCost: Number(packagingCost) || 0,
      otherCost: Number(otherCost) || 0,
      craftingHours: Number(craftingHours) || 0,
      quantityProduced: Number(quantityProduced) || 1,
      qualityLevel: qualityLevel || 'Standard',
      estimatedProductionCost: Number(estimatedProductionCost) || ((Number(materialCost) + Number(labourCost) + Number(packagingCost) + Number(otherCost)) / Number(quantityProduced || 1)),
      recommendedMinPrice: Number(recommendedMinPrice) || 0,
      recommendedMaxPrice: Number(recommendedMaxPrice) || 0,
      recommendedProfit: Number(recommendedProfit) || 0,
      finalSellingPrice: sellingPrice,
      isFairlyPriced: sellingPrice >= (Number(estimatedProductionCost) || 0)
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      data: product
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all products (public catalog with filters)
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, artisanId, inStock } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    if (artisanId) {
      query.artisanId = artisanId;
    }

    if (inStock !== undefined) {
      query.inStock = inStock === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { craft: { $regex: search, $options: 'i' } },
        { artisanName: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products.map(hideInternalPricing)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      data: hideInternalPricing(product)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product by ID
 * @route   PUT /api/products/:id
 * @access  Private (Owner Artisan, Admin)
 */
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Verify ownership
    if (product.artisanId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
    }

    const updateData = { ...req.body };
    if (!COST_FIELDS.every((field) => updateData[field] === undefined || isValidNonNegativeNumber(updateData[field]))
      || (updateData.quantityProduced !== undefined && (!Number.isFinite(Number(updateData.quantityProduced)) || Number(updateData.quantityProduced) < 1))) {
      return res.status(400).json({ success: false, message: 'Pricing costs must be valid non-negative numbers and quantity must be at least 1.' });
    }
    if (updateData.finalSellingPrice !== undefined || updateData.price !== undefined) {
      const price = Number(updateData.finalSellingPrice ?? updateData.price);
      if (!Number.isFinite(price) || price <= 0) {
        return res.status(400).json({ success: false, message: 'Product selling price must be a valid positive number.' });
      }
      updateData.price = price;
      updateData.finalSellingPrice = price;
      
      const prodCost = Number(updateData.estimatedProductionCost || product.estimatedProductionCost || 0);
      updateData.isFairlyPriced = price >= prodCost;
    }

    if (updateData.images !== undefined) {
      if (!Array.isArray(updateData.images) || updateData.images.length === 0 || updateData.images.length > 5) {
        return res.status(400).json({
          success: false,
          message: 'A product must have between 1 and 5 images.'
        });
      }
      
      // Ensure exactly one primary image
      const primaryCount = updateData.images.filter(img => img.isPrimary).length;
      if (primaryCount !== 1) {
        updateData.images.forEach((img, idx) => {
          img.isPrimary = (idx === 0);
        });
      }

      updateData.images = updateData.images.map((img, i) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: img.isPrimary || false,
        order: img.order !== undefined ? img.order : i
      }));
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully!',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product by ID
 * @route   DELETE /api/products/:id
 * @access  Private (Owner Artisan, Admin)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Verify ownership
    if (product.artisanId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
