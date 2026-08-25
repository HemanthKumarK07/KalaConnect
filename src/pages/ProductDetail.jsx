import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Shield, ShieldCheck, Clock, MapPin, Heart, ShoppingBag, Truck, Award, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import SectionReveal from '../components/SectionReveal';
import ProductCard from '../components/ProductCard';
import { getProductById, getProductsByArtisan, formatPrice } from '../data/products';
import { getArtisanById } from '../data/artisans';
import { useState } from 'react';
import useCartStore from '../store/useCartStore';
import useAppStore from '../store/useAppStore';
import { useToast } from '../components/Toast';
import './ProductDetail.css';

export default function ProductDetail() {
  const { t } = useTranslation('common');
  const { id } = useParams();
  const product = getProductById(id);
  const [selectedTab, setSelectedTab] = useState('story');
  
  const { addItem } = useCartStore();
  const { wishlist, toggleWishlist } = useAppStore();
  const { showToast } = useToast();
  
  const isLiked = wishlist?.includes(product?.id);

  if (!product) {
    return (
      <div className="product-detail-page" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-20))', textAlign: 'center' }}>
        <div className="container">
          <h2>Product not found</h2>
          <Link to="/marketplace"><Button variant="outline" style={{ marginTop: 'var(--space-4)' }}>{t('buttons.back')}</Button></Link>
        </div>
      </div>
    );
  }

  const artisan = getArtisanById(product.artisanId);
  const relatedProducts = getProductsByArtisan(product.artisanId).filter(p => p.id !== product.id).slice(0, 4);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const isAIVerified = product.artisan?.isAIVerified === true || product.id === 'prod-001';

  const colors = ['linear-gradient(135deg, #D4B896 0%, #C9A66B 50%, #8A6A4A 100%)', 'linear-gradient(135deg, #A8C4B8 0%, #4F6958 50%, #3A5042 100%)'];

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="pd-breadcrumb">
          <Link to="/marketplace" className="pd-breadcrumb__link"><ArrowLeft size={16} /> {t('nav.marketplace')}</Link>
          <ChevronRight size={14} />
          <span>{product.category}</span>
          <ChevronRight size={14} />
          <span className="pd-breadcrumb__current">{product.shortTitle}</span>
        </div>

        <div className="pd-layout">
          {/* Gallery */}
          <SectionReveal animation="fade-right" className="pd-gallery">
            <div className="pd-gallery__main" style={{ background: colors[0] }}>
              <span className="font-hero" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-2xl)', fontStyle: 'italic', textAlign: 'center' }}>
                {product.craft}
              </span>
              {isAIVerified && (
                <div className="ai-verified-badge">
                  <ShieldCheck size={14} />
                  <span>100% Handcrafted</span>
                </div>
              )}
              {product.handmadeBadge && (
                <div className="pd-gallery__badge">
                  <Shield size={14} /> AI {t('labels.verified')} {t('labels.handmade')}
                </div>
              )}
            </div>
            <div className="pd-gallery__thumbs">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="pd-gallery__thumb" style={{ background: colors[i % 2], opacity: i === 0 ? 1 : 0.6 }} />
              ))}
            </div>
          </SectionReveal>

          {/* Info */}
          <SectionReveal animation="fade-left" delay={0.1} className="pd-info">
            <div className="pd-info__badges">
              <span className="badge badge--handmade"><Shield size={12} /> {t('labels.handmade')}</span>
              {discount > 0 && <span className="badge badge--accent">{discount}% {t('labels.discount')}</span>}
            </div>

            <h1 className="pd-info__title font-hero">{product.title}</h1>

            <div className="pd-info__meta">
              <div className="pd-info__rating">
                <Star size={16} fill="#C9A66B" stroke="#C9A66B" />
                <span className="font-number">{product.rating}</span>
                <span>({product.reviews} {t('labels.reviews').toLowerCase()})</span>
              </div>
              <span>•</span>
              <span className="font-number">{product.sold} sold</span>
            </div>

            <div className="pd-info__price">
              <span className="pd-info__price-current font-number">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="pd-info__price-original font-number">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            <p className="pd-info__description">{product.description}</p>

            <div className="pd-info__details">
              <div className="pd-info__detail">
                <Clock size={16} />
                <div>
                  <span className="pd-info__detail-label">Crafting Time</span>
                  <span className="pd-info__detail-value font-number">{product.craftingHours} hours</span>
                </div>
              </div>
              <div className="pd-info__detail">
                <MapPin size={16} />
                <div>
                  <span className="pd-info__detail-label">Made in</span>
                  <span className="pd-info__detail-value">{product.village}</span>
                </div>
              </div>
              <div className="pd-info__detail">
                <Truck size={16} />
                <div>
                  <span className="pd-info__detail-label">Delivery</span>
                  <span className="pd-info__detail-value font-number">{product.deliveryDays} days</span>
                </div>
              </div>
            </div>

            <div className="pd-info__materials">
              <span className="pd-info__detail-label">Materials</span>
              <div className="pd-info__material-tags">
                {product.materials.map((m, i) => (
                  <span key={i} className="tag">{m}</span>
                ))}
              </div>
            </div>

            <div className="pd-info__actions">
              <Button variant="accent" size="lg" magnetic icon={<ShoppingBag size={18} />} onClick={() => { addItem(product); showToast(t('notifications.itemAdded'), 'success'); }}>
                {t('buttons.addToCart')}
              </Button>
              <motion.button
                className="pd-info__wish-btn"
                onClick={() => { toggleWishlist(product.id); showToast(isLiked ? t('notifications.itemRemoved') : t('notifications.success'), 'info'); }}
                whileTap={{ scale: 0.85 }}
                animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
              >
                <Heart size={20} fill={isLiked ? '#D84B4B' : 'none'} stroke={isLiked ? '#D84B4B' : 'currentColor'} />
              </motion.button>
            </div>

            {/* Artisan */}
            {artisan && (
              <div className="pd-artisan">
                <div className="pd-artisan__header">
                  <div className="avatar" style={{ background: 'linear-gradient(135deg, #C9A66B, #8A6A4A)' }}>{artisan.initials}</div>
                  <div>
                    <h3 className="pd-artisan__name">{artisan.name}</h3>
                    <p className="pd-artisan__craft">{artisan.craft} • {artisan.village}</p>
                  </div>
                  <Shield size={16} style={{ color: 'var(--color-forest)', marginLeft: 'auto' }} />
                </div>
                {artisan.awards.length > 0 && (
                  <div className="pd-artisan__award">
                    <Award size={13} /> {artisan.awards[0]}
                  </div>
                )}
              </div>
            )}
          </SectionReveal>
        </div>

        {/* Tabs */}
        <section className="pd-tabs section">
          <div className="pd-tabs__nav">
            {['story', 'details', 'reviews'].map(tab => (
              <button
                key={tab}
                className={`pd-tabs__tab ${selectedTab === tab ? 'active' : ''}`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {selectedTab === tab && (
                  <motion.div className="pd-tabs__indicator" layoutId="pd-tab" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
              </button>
            ))}
          </div>

          <div className="pd-tabs__content">
            {selectedTab === 'story' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h3 className="font-hero" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>The Story Behind This Piece</h3>
                <p style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)', maxWidth: '720px' }}>{product.story}</p>
              </motion.div>
            )}
            {selectedTab === 'details' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="pd-specs">
                  <div className="pd-spec"><span>Dimensions</span><span>{product.dimensions}</span></div>
                  <div className="pd-spec"><span>Weight</span><span>{product.weight}</span></div>
                  <div className="pd-spec"><span>Craft</span><span>{product.craft}</span></div>
                  <div className="pd-spec"><span>{t('labels.category')}</span><span>{product.category}</span></div>
                </div>
              </motion.div>
            )}
            {selectedTab === 'reviews' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <p style={{ color: 'var(--color-text-secondary)' }}>Reviews coming soon. This product has {product.reviews} reviews with an average rating of {product.rating}.</p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <section className="section">
            <SectionReveal animation="fade-up">
              <h2 className="font-hero" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-8)' }}>
                More from {artisan?.name}
              </h2>
            </SectionReveal>
            <div className="featured__grid">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
