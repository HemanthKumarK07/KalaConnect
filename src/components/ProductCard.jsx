import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../data/products';
import useCartStore from '../store/useCartStore';
import useAppStore from '../store/useAppStore';
import { useToast } from './Toast';
import './ProductCard.css';

export default function ProductCard({ product, index = 0 }) {
  const { t } = useTranslation('common');
  const { addItem } = useCartStore();
  const { wishlist, toggleWishlist } = useAppStore();
  const { showToast } = useToast();
  
  const isLiked = wishlist.includes(product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const isAIVerified = product.artisan?.isAIVerified === true || product.id === 'prod-001';

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product);
    showToast(t('notifications.itemAdded'), 'success');
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product.id);
    showToast(isLiked ? t('notifications.itemRemoved') : t('notifications.success'), 'info');
  };

  const colors = [
    'linear-gradient(135deg, #D4B896 0%, #C9A66B 50%, #8A6A4A 100%)',
    'linear-gradient(135deg, #A8C4B8 0%, #4F6958 50%, #3A5042 100%)',
    'linear-gradient(135deg, #C4A882 0%, #8A6A4A 50%, #5C4A35 100%)',
    'linear-gradient(135deg, #B8A8C4 0%, #6B5C7A 50%, #4A3F5C 100%)',
    'linear-gradient(135deg, #C4B8A8 0%, #7A6B5C 50%, #5C4A3F 100%)',
    'linear-gradient(135deg, #A8BCC4 0%, #5C6B7A 50%, #3F4A5C 100%)',
  ];

  const getPrimaryImageUrl = (product) => {
    if (!product.images || !Array.isArray(product.images) || product.images.length === 0) return null;
    if (typeof product.images[0] === 'string') return product.images[0]; // legacy format support
    const primary = product.images.find(img => img.isPrimary) || product.images[0];
    return primary.url;
  };

  const primaryImage = getPrimaryImageUrl(product);

  return (
    <motion.div
      className="product-card card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/marketplace/${product.id || product._id}`} className="product-card__link">
        <div className="product-card__image-wrap" data-cursor="view">
          {primaryImage ? (
            <div
              className="product-card__image"
              style={{ backgroundImage: `url("${primaryImage}")` }}
            >
              <span className="product-card__craft-label">{product.craft}</span>
            </div>
          ) : (
            <div
              className="product-card__image-placeholder"
              style={{ background: colors[index % colors.length] }}
            >
              <span className="product-card__craft-label">{product.craft}</span>
            </div>
          )}

          {isAIVerified && (
            <div className="ai-verified-badge">
              <ShieldCheck size={14} />
              <span>100% Handcrafted</span>
            </div>
          )}

          <div className="product-card__badges">
            {product.handmadeBadge && (
              <span className="badge badge--handmade">
                <ShieldCheck size={12} /> {t('labels.handmade')}
              </span>
            )}
            {product.isFairlyPriced !== false && (
              <span className="badge badge--success" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px' }}>
                ✓ Fairly Priced
              </span>
            )}
            {discount > 0 && (
              <span className="badge badge--accent">-{discount}%</span>
            )}
          </div>

          <div className="product-card__actions">
            <button 
              className="product-card__action"
              onClick={handleAddToCart}
            >
              <ShoppingBag size={18} />
            </button>
            <motion.button 
              className="product-card__action"
              onClick={handleToggleWishlist}
              whileTap={{ scale: 0.85 }}
              animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
            >
              <Heart 
                size={18} 
                fill={isLiked ? '#D84B4B' : 'none'} 
                stroke={isLiked ? '#D84B4B' : 'currentColor'} 
              />
            </motion.button>
          </div>
        </div>

        <div className="product-card__content">
          <div className="product-card__meta">
            <span className="product-card__village">{product.village}</span>
            <span className="product-card__rating">
              <Star size={13} fill="#C9A66B" stroke="#C9A66B" />
              <span className="font-number">{product.rating}</span>
            </span>
          </div>

          <h3 className="product-card__title">{product.shortTitle}</h3>

          <p className="product-card__artisan">by {product.artisanName}</p>

          <div className="product-card__footer">
            <div className="product-card__price">
              <span className="product-card__price-current font-number">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="product-card__price-original font-number">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <span className="product-card__hours font-number">
              {product.craftingHours}h crafted
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
