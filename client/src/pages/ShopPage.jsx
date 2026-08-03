import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Filter, Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialBadge = searchParams.get('badge') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedBadge, setSelectedBadge] = useState(initialBadge);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortOption, setSortOption] = useState('featured');
  const [loading, setLoading] = useState(true);

  // Sync state with URL search parameters on route change or navbar search
  useEffect(() => {
    const urlCat = searchParams.get('category') || 'All';
    const urlSearch = searchParams.get('search') || '';
    const urlBadge = searchParams.get('badge') || '';

    setSelectedCategory(urlCat);
    setSearchQuery(urlSearch);
    setSelectedBadge(urlBadge);
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/admin/categories');
        if (res.data.success) {
          const catNames = res.data.categories.map(c => c.name);
          setCategories(['All', ...catNames]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/api/products?sort=${sortOption}`;
        if (selectedCategory && selectedCategory !== 'All') {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }
        if (searchQuery && searchQuery.trim() !== '') {
          url += `&search=${encodeURIComponent(searchQuery.trim())}`;
        }
        if (selectedBadge) {
          url += `&badge=${encodeURIComponent(selectedBadge)}`;
        }
        if (maxPrice < 1000) {
          url += `&maxPrice=${maxPrice}`;
        }

        const res = await axios.get(url);
        if (res.data.success) {
          setProducts(res.data.products || []);
        }
      } catch (err) {
        console.error('Error fetching shop products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchQuery, selectedBadge, maxPrice, sortOption]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setSearchParams(prev => {
      if (cat === 'All') prev.delete('category');
      else prev.set('category', cat);
      return prev;
    });
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedBadge('');
    setMaxPrice(1000);
    setSortOption('featured');
    setSearchParams({});
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Product Catalog</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Explore our complete collection of products with detailed specs, ratings, and instant purchase options.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Filters Sidebar */}
        <aside className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '1.1rem' }}>
              <Filter size={18} color="var(--primary)" />
              <span>Filters</span>
            </div>
            {(selectedCategory !== 'All' || searchQuery || selectedBadge || maxPrice < 1000) && (
              <button onClick={clearAllFilters} style={{ background: 'none', color: 'var(--accent)', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <X size={14} /> Clear
              </button>
            )}
          </div>

          {/* Search Filter */}
          <div className="input-group">
            <label className="input-label">Search Keywords</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Search specific product name..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  setSearchParams(prev => {
                    if (val.trim()) prev.set('search', val);
                    else prev.delete('search');
                    return prev;
                  });
                }}
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchParams(prev => {
                      prev.delete('search');
                      return prev;
                    });
                  }}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--accent)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              ) : (
                <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              )}
            </div>
          </div>

          {/* Category List Filter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="input-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Categories</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    background: selectedCategory === cat ? 'rgba(99,102,241,0.2)' : 'transparent',
                    color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: selectedCategory === cat ? '700' : '500',
                    border: selectedCategory === cat ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Filter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="input-label">Max Price</label>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>${maxPrice}</span>
            </div>
            <input
              type="range"
              min="20"
              max="1000"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          {/* Badges Filter */}
          <div>
            <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Special Deals</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Best Seller', 'Trending', 'Hot Deal', 'New'].map((b) => (
                <span
                  key={b}
                  onClick={() => setSelectedBadge(selectedBadge === b ? '' : b)}
                  className={`badge ${selectedBadge === b ? 'badge-primary' : 'badge-secondary'}`}
                  style={{ cursor: 'pointer', padding: '6px 10px', fontSize: '0.75rem' }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Product Grid Area */}
        <div>
          {/* Top Controls Bar */}
          <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: '#fff' }}>{products.length}</strong> products
            </span>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpDown size={16} color="var(--text-muted)" />
              <select
                className="input-field"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                style={{ padding: '0.4rem 0.75rem', width: 'auto', fontSize: '0.85rem' }}
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              Loading products catalog...
            </div>
          ) : products.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <SlidersHorizontal size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <h3>No products found</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>Try adjusting your filters or search keywords.</p>
              <button onClick={clearAllFilters} className="btn btn-primary btn-sm">Reset All Filters</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {products.map((product) => (
                <ProductCard key={product._id || product.title} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
