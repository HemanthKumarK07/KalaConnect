import { useEffect, useState } from 'react';
import { Calculator, CircleHelp, IndianRupee, LoaderCircle, TriangleAlert, Sparkles } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { useToast } from './Toast';
import ImageUploader from './ImageUploader';
import './ProductFormModal.css';

const API_BASE = 'http://localhost:5000/api';
const DEFAULT_FORM = {
  title: '', category: 'textiles', craft: '', village: '', description: '', price: '',
  materialCost: '', labourCost: '', packagingCost: '', otherCost: '', craftingHours: '',
  quantityProduced: 1, qualityLevel: 'Standard'
};

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

export default function ProductFormModal({ product, token, onClose, onSaved }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [images, setImages] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const { showToast } = useToast();
  const isEditing = Boolean(product?._id);

  useEffect(() => {
    if (!product) {
      setForm(DEFAULT_FORM);
      setImages([]);
      setRecommendation(null);
      return;
    }
    
    if (product.images && Array.isArray(product.images)) {
      setImages(product.images.map((img, idx) => ({
        id: img.publicId || `existing-${idx}`,
        url: img.url || (typeof img === 'string' ? img : ''),
        publicId: img.publicId || null,
        isPrimary: img.isPrimary || (idx === 0),
        order: img.order !== undefined ? img.order : idx,
        isUploaded: true,
        isUploading: false
      })));
    } else {
      setImages([]);
    }
    setForm({ ...DEFAULT_FORM, ...product, price: product.finalSellingPrice || product.price || '' });
    if (product.recommendedMinPrice > 0) {
      setRecommendation({
        costBreakdown: { estimatedProductionCost: product.estimatedProductionCost },
        recommendation: {
          recommendedMinPrice: product.recommendedMinPrice,
          recommendedMaxPrice: product.recommendedMaxPrice,
          suggestedOptimalPrice: Math.round((product.recommendedMinPrice + product.recommendedMaxPrice) / 2),
          recommendedMinProfit: product.recommendedProfit,
          recommendedMaxProfit: product.recommendedProfit
        }
      });
    } else setRecommendation(null);
  }, [product]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const numericValue = (field) => Number(form[field] || 0);
  const estimatedCost = ['materialCost', 'labourCost', 'packagingCost', 'otherCost']
    .reduce((total, field) => total + numericValue(field), 0) / Math.max(1, Number(form.quantityProduced) || 1);
  const belowCost = Number(form.price) > 0 && Number(form.price) < estimatedCost;

  const getRecommendation = async () => {
    const numericFields = ['materialCost', 'labourCost', 'packagingCost', 'otherCost', 'craftingHours', 'quantityProduced'];
    if (numericFields.some((field) => form[field] === '' || !Number.isFinite(Number(form[field])) || Number(form[field]) < 0)
      || Number(form.quantityProduced) < 1) {
      showToast('Enter valid non-negative costs and a quantity of at least 1.', 'error');
      return;
    }
    setLoadingRecommendation(true);
    try {
      const response = await fetch(`${API_BASE}/products/fair-price`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productName: form.title,
          category: form.category,
          qualityLevel: form.qualityLevel,
          materialCost: numericValue('materialCost'),
          labourCost: numericValue('labourCost'),
          packagingCost: numericValue('packagingCost'),
          otherCost: numericValue('otherCost'),
          craftingHours: numericValue('craftingHours'),
          quantity: Number(form.quantityProduced),
          askAiInsights: false,
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to calculate a recommendation.');
      setRecommendation(data.data);
    } catch (error) {
      showToast(error.message, 'error');
    } finally { setLoadingRecommendation(false); }
  };

  const useRecommendedPrice = () => {
    if (!recommendation) return;
    setForm((current) => ({ ...current, price: recommendation.recommendation.suggestedOptimalPrice }));
    showToast('Recommended price applied. You can still edit it before saving.', 'success');
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.category || !Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      showToast('Please enter a product name, category, and valid final selling price.', 'error');
      return;
    }

    if (images.length === 0 || images.length > 5) {
      showToast('Please upload between 1 and 5 product images.', 'error');
      return;
    }

    if (images.some(img => img.isUploading)) {
      showToast('Please wait for all images to finish uploading.', 'warning');
      return;
    }

    const unfinishedImages = images.filter(img => !img.url || !img.publicId);
    if (unfinishedImages.length > 0) {
      showToast('Some images failed to upload. Please remove them or retry before saving.', 'error');
      return;
    }

    setSaving(true);
    const rec = recommendation?.recommendation;
    const payload = {
      ...form, shortTitle: form.title.slice(0, 30), finalSellingPrice: Number(form.price), price: Number(form.price),
      materialCost: numericValue('materialCost'), labourCost: numericValue('labourCost'), packagingCost: numericValue('packagingCost'),
      otherCost: numericValue('otherCost'), craftingHours: numericValue('craftingHours'), quantityProduced: Number(form.quantityProduced),
      estimatedProductionCost: recommendation?.costBreakdown?.estimatedProductionCost ?? estimatedCost,
      recommendedMinPrice: rec?.recommendedMinPrice ?? 0, recommendedMaxPrice: rec?.recommendedMaxPrice ?? 0,
      recommendedProfit: rec?.recommendedMaxProfit ?? 0,
      images: images.map(img => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: img.isPrimary,
        order: img.order
      }))
    };
    try {
      const response = await fetch(`${API_BASE}/products${isEditing ? `/${product._id}` : ''}`, {
        method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to save product.');
      showToast(isEditing ? 'Product updated successfully.' : 'Product published successfully.', 'success');
      onSaved(data.data);
    } catch (error) {
      showToast(error.message, 'error');
    } finally { setSaving(false); }
  };

  const costFields = [
    ['materialCost', 'Raw material cost', 'The total cost of materials used for this batch.'],
    ['labourCost', 'Labour cost', 'The amount paid for your skilled time and work.'],
    ['packagingCost', 'Packaging cost', 'Boxes, wrapping, labels, and protective material.'],
    ['otherCost', 'Transport / other costs', 'Travel, production, tools, or other direct expenses.']
  ];

  const analyzeImage = async () => {
    const primaryImg = images.find(img => img.isPrimary) || images[0];
    if (!primaryImg || (!primaryImg.url && !primaryImg.id)) {
      showToast('Please upload an image first for AI to analyze.', 'warning');
      return;
    }
    setAnalyzingImage(true);
    try {
      const response = await fetch(`${API_BASE}/ai/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ image: primaryImg.url })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to analyze image.');
      
      setForm(prev => ({
        ...prev,
        description: data.data.description,
        price: data.data.estimatedPrice || prev.price
      }));
      showToast('AI filled description and price based on your image!', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setAnalyzingImage(false);
    }
  };

  return <Modal isOpen onClose={onClose} title={isEditing ? 'Edit Product & Price' : 'Add Product & Fair Price'} size="lg">
    <form className="product-form" onSubmit={saveProduct}>
      <div className="product-form__grid">
        <label>Product name<input name="title" value={form.title} onChange={update} required placeholder="e.g. Handwoven cotton stole" /></label>
        <label>Category<select name="category" value={form.category} onChange={update}><option value="textiles">Handloom & Textiles</option><option value="pottery">Pottery & Ceramics</option><option value="jewelry">Traditional Jewelry</option><option value="paintings">Folk Art & Paintings</option><option value="woodwork">Woodwork & Toys</option><option value="brass_metal">Metalcraft & Dhokra</option><option value="leather">Leather Craft</option></select></label>
        <label>Craft (optional)<input name="craft" value={form.craft || ''} onChange={update} placeholder="e.g. Ikat weaving" /></label>
        <label>Village (optional)<input name="village" value={form.village || ''} onChange={update} placeholder="e.g. Pochampally" /></label>
      </div>
      
      <ImageUploader images={images} setImages={setImages} token={token} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-10px', marginBottom: '15px' }}>
        <Button type="button" variant="outline" size="sm" icon={<Sparkles size={15} />} onClick={analyzeImage} loading={analyzingImage}>AI Auto-Fill Details</Button>
      </div>
      
      <label>Description (optional)<textarea name="description" value={form.description || ''} onChange={update} rows="2" placeholder="Tell customers about this handmade piece." /></label>

      <section className="price-recommendation">
        <div className="price-recommendation__heading"><div><h4><Calculator size={19} /> Fair Price Recommendation</h4><p>A rule-based estimate from your actual costs. You always choose the final price.</p></div></div>
        <div className="product-form__grid">
          {costFields.map(([name, label, help]) => <label key={name}>{label}<span className="field-help" title={help}><CircleHelp size={13} /></span><div className="currency-input"><IndianRupee size={15} /><input type="number" name={name} min="0" step="0.01" value={form[name]} onChange={update} placeholder="0" /></div></label>)}
          <label>Hours to create<span className="field-help" title="Approximate hours required to make this batch."><CircleHelp size={13} /></span><input type="number" name="craftingHours" min="0" step="0.5" value={form.craftingHours} onChange={update} placeholder="0" /></label>
          <label>Quantity produced<input type="number" name="quantityProduced" min="1" step="1" value={form.quantityProduced} onChange={update} /></label>
          <label>Quality level<select name="qualityLevel" value={form.qualityLevel} onChange={update}><option>Standard</option><option>Premium</option><option>Masterpiece / GI-Tagged</option></select></label>
        </div>
        <Button type="button" variant="outline" size="sm" icon={<Calculator size={15} />} onClick={getRecommendation} loading={loadingRecommendation}>Calculate recommendation</Button>
        {recommendation && <div className="price-result">
          <div><span>Estimated cost per item</span><strong>{money(recommendation.costBreakdown.estimatedProductionCost)}</strong></div>
          <div><span>Suggested profit</span><strong>{money(recommendation.recommendation.recommendedMinProfit)} – {money(recommendation.recommendation.recommendedMaxProfit)}</strong></div>
          <div className="price-result__highlight"><span>Recommended fair price</span><strong>{money(recommendation.recommendation.recommendedMinPrice)} – {money(recommendation.recommendation.recommendedMaxPrice)}</strong></div>
          {recommendation.recommendation.labourFairnessNote && <p className="price-result__note">{recommendation.recommendation.labourFairnessNote}</p>}
          <Button type="button" variant="accent" size="sm" onClick={useRecommendedPrice}>Use Recommended Price</Button>
        </div>}
      </section>
      <label className="product-form__final-price">Final selling price <span className="field-help" title="This is the only price customers will see."><CircleHelp size={13} /></span><div className="currency-input"><IndianRupee size={16} /><input type="number" name="price" min="1" step="1" value={form.price} onChange={update} required placeholder="Enter your own price" /></div></label>
      {belowCost && <p className="price-warning"><TriangleAlert size={17} /> Your selling price is below the estimated production cost. Consider reviewing your price.</p>}
      <div className="product-form__actions"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" variant="accent" loading={saving}>{isEditing ? 'Save changes' : 'Publish product'}</Button></div>
    </form>
  </Modal>;
}
