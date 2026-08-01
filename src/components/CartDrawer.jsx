import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useCartStore from '../store/useCartStore';
import Button from './Button';
import './CartDrawer.css';

export default function CartDrawer() {
  const { t } = useTranslation(['common', 'checkout']);
  const { items, isOpen, closeCart, removeItem, updateQuantity, getCartTotal } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="cart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.div
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="cart-drawer__header">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <ShoppingBag size={20} /> {t('common:nav.cart')}
              </h2>
              <button className="cart-drawer__close" onClick={closeCart}>
                <X size={20} />
              </button>
            </div>

            <div className="cart-drawer__content" data-lenis-prevent="true">
              {items.length === 0 ? (
                <div className="cart-drawer__empty">
                  <ShoppingBag size={48} style={{ color: 'var(--color-border)' }} />
                  <h3>{t('checkout:empty.title')}</h3>
                  <p>Discover beautiful handcrafted items from our artisans.</p>
                  <Button variant="accent" onClick={closeCart}>{t('checkout:success.continueShopping')}</Button>
                </div>
              ) : (
                <div className="cart-drawer__items">
                  {items.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item__image" style={{ background: 'var(--gradient-warm)' }}>
                        {/* We use a gradient placeholder for now. In a real app we'd use item.image */}
                      </div>
                      <div className="cart-item__info">
                        <div className="cart-item__title-row">
                          <h4 className="cart-item__title">{item.shortTitle || item.title}</h4>
                          <button className="cart-item__remove" onClick={() => removeItem(item.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="cart-item__price font-number">₹{item.price.toLocaleString('en-IN')}</p>
                        
                        <div className="cart-item__controls">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                          <span className="font-number">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="cart-drawer__footer">
                <div className="cart-drawer__total">
                  <span>{t('checkout:review.subtotal')}</span>
                  <span className="font-number" style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
                    ₹{getCartTotal().toLocaleString('en-IN')}
                  </span>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>
                  Shipping and taxes calculated at checkout.
                </p>
                <Link to="/checkout" onClick={closeCart} style={{ display: 'block' }}>
                  <Button variant="accent" size="lg" style={{ width: '100%' }} iconRight={<ArrowRight size={18} />}>
                    {t('checkout:actions.continueToPayment')}
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
