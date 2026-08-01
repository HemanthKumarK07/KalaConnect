import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, CreditCard, MapPin, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useCartStore from '../store/useCartStore';
import Button from '../components/Button';
import SectionReveal from '../components/SectionReveal';
import { useToast } from '../components/Toast';
import './Checkout.css';

const steps = ['shipping', 'payment', 'review'];

export default function Checkout() {
  const { t } = useTranslation(['checkout', 'common']);
  const { items, getCartTotal, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const subtotal = getCartTotal();
  const shipping = subtotal > 5000 ? 0 : 250;
  const tax = subtotal * 0.12; // 12% GST
  const total = subtotal + shipping + tax;

  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep < 2) {
      setCurrentStep(c => c + 1);
    } else {
      handleCheckout();
    }
  };

  const handleCheckout = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      showToast('Order placed successfully! Thank you for supporting artisans.', 'success');
      navigate('/');
    }, 2000);
  };

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="checkout-page" style={{ paddingTop: 'calc(var(--nav-height) + var(--space-20))', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--space-4)' }}>{t('checkout:empty.title')}</h2>
          <Link to="/marketplace"><Button variant="accent">{t('checkout:empty.returnToShop')}</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container checkout-container">
        
        {/* Left Side: Form */}
        <div className="checkout-main">
          <Link to="/marketplace" className="checkout-back">
            <ArrowLeft size={16} /> Back to marketplace
          </Link>

          <div className="checkout-progress">
            {steps.map((step, i) => (
              <div key={step} className={`checkout-step ${i <= currentStep ? 'active' : ''}`}>
                <div className="checkout-step__circle">
                  {i < currentStep ? <Check size={14} /> : i + 1}
                </div>
                <span>{t(`checkout:steps.${step}`)}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleNext}>
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h2 className="checkout-section-title">{t('checkout:shipping.title')}</h2>
                  <div className="checkout-form-grid">
                    <div className="form-group" style={{ gridColumn: 'span 1' }}>
                      <label>First Name</label>
                      <input type="text" className="input" required defaultValue="Ananya" />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 1' }}>
                      <label>Last Name</label>
                      <input type="text" className="input" required defaultValue="Krishnan" />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Email Address</label>
                      <input type="email" className="input" required defaultValue="ananya@example.com" />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Street Address</label>
                      <input type="text" className="input" required defaultValue="123 Heritage Lane, Indiranagar" />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input type="text" className="input" required defaultValue="Bangalore" />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input type="text" className="input" required defaultValue="Karnataka" />
                    </div>
                    <div className="form-group">
                      <label>{t('checkout:shipping.pincode')}</label>
                      <input type="text" className="input" required defaultValue="560038" />
                    </div>
                    <div className="form-group">
                      <label>{t('checkout:shipping.phone')}</label>
                      <input type="tel" className="input" required defaultValue="+91 98765 43210" />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h2 className="checkout-section-title">{t('checkout:payment.title')}</h2>
                  <div className="payment-methods">
                    <label className="payment-method selected">
                      <input type="radio" name="payment" defaultChecked />
                      <div className="payment-method__content">
                        <CreditCard size={20} style={{ color: 'var(--color-accent)' }} />
                        <div>
                          <p style={{ fontWeight: 600 }}>{t('checkout:payment.creditCard')}</p>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>Visa, Mastercard, RuPay</p>
                        </div>
                      </div>
                    </label>
                    <label className="payment-method">
                      <input type="radio" name="payment" />
                      <div className="payment-method__content">
                        <span style={{ fontSize: '20px' }}>📱</span>
                        <div>
                          <p style={{ fontWeight: 600 }}>{t('checkout:payment.upi')} / {t('checkout:payment.netBanking')}</p>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>Google Pay, PhonePe, Paytm</p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="checkout-form-grid" style={{ marginTop: 'var(--space-6)' }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Card Number</label>
                      <input type="text" className="input" placeholder="0000 0000 0000 0000" />
                    </div>
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input type="text" className="input" placeholder="MM/YY" />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input type="text" className="input" placeholder="123" />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Cardholder Name</label>
                      <input type="text" className="input" placeholder="Name on card" />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h2 className="checkout-section-title">{t('checkout:review.title')}</h2>
                  
                  <div className="review-section">
                    <div className="review-section__header">
                      <MapPin size={16} /> <h3>{t('checkout:review.shippingAddress')}</h3>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)' }}>
                      Ananya Krishnan<br />
                      123 Heritage Lane, Indiranagar<br />
                      Bangalore, Karnataka 560038<br />
                      +91 98765 43210
                    </p>
                  </div>

                  <div className="review-section" style={{ marginTop: 'var(--space-6)' }}>
                    <div className="review-section__header">
                      <CreditCard size={16} /> <h3>{t('checkout:review.paymentMethod')}</h3>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                      Credit Card ending in 4242
                    </p>
                  </div>

                  <div className="checkout-trust">
                    <ShieldCheck size={20} style={{ color: 'var(--color-forest)' }} />
                    <p>All transactions are secure and encrypted. Artisan payments are held in escrow until delivery is confirmed.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="checkout-actions">
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={() => setCurrentStep(c => c - 1)}>
                  {t('common:buttons.back')}
                </Button>
              )}
              <Button type="submit" variant="accent" loading={isProcessing} iconRight={currentStep < 2 ? <ArrowRight size={16} /> : undefined} style={{ marginLeft: 'auto' }}>
                {currentStep === 2 ? t('checkout:actions.placeOrder') : t('common:buttons.continue')}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Side: Order Summary */}
        <div className="checkout-sidebar">
          <div className="checkout-summary-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>{t('checkout:review.orderSummary')}</h3>
            
            <div className="checkout-items">
              {items.map(item => (
                <div key={item.id} className="checkout-item">
                  <div className="checkout-item__image" style={{ background: 'var(--gradient-warm)' }}>
                    <span className="checkout-item__qty font-number">{item.quantity}</span>
                  </div>
                  <div className="checkout-item__info">
                    <p className="checkout-item__title">{item.shortTitle}</p>
                    <p className="checkout-item__artisan">by {item.artisanName || 'Artisan'}</p>
                  </div>
                  <div className="checkout-item__price font-number">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="checkout-totals">
              <div className="checkout-total-row">
                <span>{t('checkout:review.subtotal')}</span>
                <span className="font-number">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="checkout-total-row">
                <span>{t('checkout:review.shipping')}</span>
                <span className="font-number">{shipping === 0 ? t('checkout:review.freeShipping') : `₹${shipping}`}</span>
              </div>
              <div className="checkout-total-row">
                <span>{t('checkout:review.tax')}</span>
                <span className="font-number">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="checkout-total-row checkout-total-row--final">
                <span>{t('checkout:review.total')}</span>
                <span className="font-number" style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-accent)' }}>
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
