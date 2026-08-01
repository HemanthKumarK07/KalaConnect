import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Grid3X3, List, X, Mic, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard';
import SectionReveal from '../components/SectionReveal';
import { products, categories } from '../data/products';
import './Marketplace.css';

export default function Marketplace() {
  const { t } = useTranslation('marketplace');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 50000]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(s) ||
        p.craft.toLowerCase().includes(s) ||
        p.village.toLowerCase().includes(s) ||
        p.artisanName.toLowerCase().includes(s)
      );
    }
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'newest': result.sort((a, b) => b.sold - a.sold); break;
      default: result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return result;
  }, [search, selectedCategory, sortBy, priceRange]);

  return (
    <div className="marketplace-page">
      {/* Hero */}
      <section className="marketplace-hero">
        <div className="container">
          <SectionReveal animation="fade-up">
            <span className="tag" style={{ marginBottom: 'var(--space-4)', display: 'inline-block' }}>{t('hero.tag')}</span>
            <h1 className="marketplace-hero__title font-hero">
              {t('hero.title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
            </h1>
            <p className="marketplace-hero__subtitle">
              {t('hero.subtitle')}
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Toolbar */}
      <section className="marketplace-toolbar">
        <div className="container">
          <div className="marketplace-toolbar__inner">
            <div className="marketplace-search">
              <Search size={18} className="marketplace-search__icon" />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="marketplace-search__input"
              />
              <div className="marketplace-search__actions">
                <button className="marketplace-search__action" aria-label={t('search.voiceSearch')}>
                  <Mic size={16} />
                </button>
                <button className="marketplace-search__action" aria-label={t('search.imageSearch')}>
                  <Camera size={16} />
                </button>
              </div>
              {search && (
                <button className="marketplace-search__clear" onClick={() => setSearch('')}>
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="marketplace-toolbar__right">
              <button
                className={`btn btn--ghost btn--sm ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} /> {t('filters.filters')}
              </button>

              <select
                className="marketplace-sort"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="featured">{t('filters.featured')}</option>
                <option value="price-low">{t('filters.priceLowHigh')}</option>
                <option value="price-high">{t('filters.priceHighLow')}</option>
                <option value="rating">{t('filters.topRated')}</option>
                <option value="newest">{t('filters.bestSelling')}</option>
              </select>

              <div className="marketplace-view-toggle">
                <button
                  className={`marketplace-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  className={`marketplace-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="marketplace-categories">
            <button
              className={`marketplace-cat-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              {t('filters.allCrafts')}
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`marketplace-cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="marketplace-results section">
        <div className="container">
          <div className="marketplace-results__header">
            <p className="marketplace-results__count">
              <span className="font-number">{filtered.length}</span> {t('results.productsFound', { count: filtered.length })}
            </p>
          </div>

          {filtered.length > 0 ? (
            <div className={`marketplace-grid ${viewMode === 'list' ? 'marketplace-grid--list' : ''}`}>
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="marketplace-empty">
              <div className="marketplace-empty__icon">🏺</div>
              <h3>{t('results.noResults')}</h3>
              <p>{t('results.noResultsHint')}</p>
              <button className="btn btn--outline" onClick={() => { setSearch(''); setSelectedCategory('all'); }}>
                {t('filters.clearFilters')}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
