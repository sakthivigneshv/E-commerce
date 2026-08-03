import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Store,
  Plus,
  Edit3,
  Trash2,
  DollarSign,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
  Tag,
  Sparkles,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';

const SellerDashboard = () => {
  const { user, refreshUserProfile, isVerifiedSeller, sellerStatus } = useAuth();
  const { showToast } = useCart();

  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  
  // Application Form State
  const [applyForm, setApplyForm] = useState({
    storeName: user?.storeName || `${user?.name || 'Seller'}'s Store`,
    storeDescription: user?.storeDescription || '',
    businessEmail: user?.businessEmail || user?.email || '',
    businessPhone: user?.businessPhone || user?.phone || '',
    taxId: user?.taxId || '',
    verificationDoc: user?.verificationDoc || ''
  });
  const [isSubmittingApply, setIsSubmittingApply] = useState(false);

  // New / Edit Product Form State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Electronics',
    image: '',
    stock: 15,
    badge: 'New'
  });

  // Fast Price Edit Modal State
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [priceTargetProduct, setPriceTargetProduct] = useState(null);
  const [priceForm, setPriceForm] = useState({ price: '', originalPrice: '' });

  const fetchSellerProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/seller/products');
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error('Failed to load seller products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVerifiedSeller) {
      fetchSellerProducts();
    } else {
      setLoading(false);
    }
  }, [isVerifiedSeller]);

  // Submit Seller Application
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingApply(true);
    try {
      const res = await axios.post('/api/seller/apply', applyForm);
      if (res.data.success) {
        showToast('Seller application submitted! Pending Admin verification.', 'success');
        await refreshUserProfile();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit seller application', 'error');
    } finally {
      setIsSubmittingApply(false);
    }
  };

  // Add or Update Seller Product
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProductId) {
        const res = await axios.put(`/api/seller/products/${editingProductId}`, productForm);
        if (res.data.success) {
          showToast('Product updated successfully!');
          fetchSellerProducts();
          closeProductModal();
        }
      } else {
        const res = await axios.post('/api/seller/products', productForm);
        if (res.data.success) {
          showToast('New product published to store catalog!');
          fetchSellerProducts();
          closeProductModal();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    }
  };

  // Quick Price Update Handler
  const handlePriceUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!priceTargetProduct) return;
    try {
      const res = await axios.patch(`/api/seller/products/${priceTargetProduct._id}/price`, {
        price: priceForm.price,
        originalPrice: priceForm.originalPrice || priceForm.price
      });
      if (res.data.success) {
        showToast(`Price updated to $${parseFloat(priceForm.price).toFixed(2)} successfully!`);
        fetchSellerProducts();
        setIsPriceModalOpen(false);
        setPriceTargetProduct(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update price', 'error');
    }
  };

  const handleOpenPriceModal = (prod) => {
    setPriceTargetProduct(prod);
    setPriceForm({
      price: prod.price,
      originalPrice: prod.originalPrice || prod.price
    });
    setIsPriceModalOpen(true);
  };

  const handleEditProduct = (prod) => {
    setEditingProductId(prod._id);
    setProductForm({
      title: prod.title,
      description: prod.description,
      price: prod.price,
      originalPrice: prod.originalPrice || prod.price,
      category: prod.category,
      image: prod.image,
      stock: prod.stock,
      badge: prod.badge || ''
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product from your seller catalog?')) return;
    try {
      const res = await axios.delete(`/api/seller/products/${id}`);
      if (res.data.success) {
        showToast('Product removed');
        fetchSellerProducts();
      }
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProductId(null);
    setProductForm({
      title: '',
      description: '',
      price: '',
      originalPrice: '',
      category: 'Electronics',
      image: '',
      stock: 15,
      badge: 'New'
    });
  };

  // Render Status Badge
  const renderVerificationBadge = () => {
    if (isVerifiedSeller) {
      return (
        <span className="badge badge-success" style={{ padding: '6px 14px', fontSize: '0.85rem', gap: '6px' }}>
          <CheckCircle size={16} /> Verified Seller
        </span>
      );
    }
    if (sellerStatus === 'PENDING') {
      return (
        <span className="badge badge-warning" style={{ padding: '6px 14px', fontSize: '0.85rem', gap: '6px' }}>
          <Clock size={16} /> Pending Admin Verification
        </span>
      );
    }
    if (sellerStatus === 'REJECTED') {
      return (
        <span className="badge badge-danger" style={{ padding: '6px 14px', fontSize: '0.85rem', gap: '6px' }}>
          <AlertCircle size={16} /> Verification Rejected
        </span>
      );
    }
    return (
      <span className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.85rem', gap: '6px' }}>
        <Sparkles size={16} /> Become a Seller
      </span>
    );
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
            <Store size={36} color="var(--primary)" />
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0 }}>
              {user?.storeName || 'Seller Merchant Panel'}
            </h1>
            {renderVerificationBadge()}
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            List products, manage inventory stock, and adjust selling prices in real-time.
          </p>
        </div>

        {isVerifiedSeller && (
          <button onClick={() => setIsProductModalOpen(true)} className="btn btn-primary btn-md" style={{ gap: '8px' }}>
            <Plus size={18} /> Add New Product
          </button>
        )}
      </div>

      {/* STATE 1: Not a seller yet (Application Form) */}
      {!isVerifiedSeller && sellerStatus === 'NONE' && (
        <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '750px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(99,102,241,0.2)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: 'var(--primary)' }}>
              <Store size={32} />
            </div>
            <h2>Register Your Seller Store</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Fill in your store details to apply for a seller panel account. Your application will be verified by the Admin (<strong>sakthivijayarajkrv@gmail.com</strong>).
            </p>
          </div>

          <form onSubmit={handleApplySubmit}>
            <div className="input-group">
              <label className="input-label">Store / Business Name *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Apex Tech Store"
                value={applyForm.storeName}
                onChange={e => setApplyForm({ ...applyForm, storeName: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Store Description</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Describe the products you sell (e.g., Electronics, Audio, Wearables)..."
                value={applyForm.storeDescription}
                onChange={e => setApplyForm({ ...applyForm, storeDescription: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Business Email *</label>
                <input
                  type="email"
                  className="input-field"
                  value={applyForm.businessEmail}
                  onChange={e => setApplyForm({ ...applyForm, businessEmail: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Business Phone / WhatsApp *</label>
                <input
                  type="text"
                  className="input-field"
                  value={applyForm.businessPhone}
                  onChange={e => setApplyForm({ ...applyForm, businessPhone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Tax ID / Business Registration No.</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. GSTIN / TAX-12345"
                  value={applyForm.taxId}
                  onChange={e => setApplyForm({ ...applyForm, taxId: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Verification Document Image URL</label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://..."
                  value={applyForm.verificationDoc}
                  onChange={e => setApplyForm({ ...applyForm, verificationDoc: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingApply}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1.5rem', gap: '8px' }}
            >
              <ShieldCheck size={20} />
              {isSubmittingApply ? 'Submitting Application...' : 'Submit Verification Request'}
            </button>
          </form>
        </div>
      )}

      {/* STATE 2: Pending Admin Verification Banner */}
      {!isVerifiedSeller && sellerStatus === 'PENDING' && (
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.2)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--warning)' }}>
            <Clock size={38} />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>Seller Application Under Review</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
            Your seller store account <strong>"{user?.storeName || 'Store'}"</strong> is pending verification.
            <br />
            SuperAdmin (<strong>sakthivijayarajkrv@gmail.com</strong>) will review your documents and verify your seller panel.
          </p>
          <div style={{ display: 'inline-flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={refreshUserProfile} className="btn btn-secondary btn-md" style={{ gap: '6px' }}>
              <RefreshCw size={16} /> Refresh Verification Status
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: Application Rejected */}
      {!isVerifiedSeller && sellerStatus === 'REJECTED' && (
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--danger)' }}>
            <AlertCircle size={38} />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.75rem', color: 'var(--danger)' }}>Seller Verification Rejected</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1rem' }}>
            Reason: <i>{user?.rejectionReason || 'Documents or store details could not be verified by Admin.'}</i>
          </p>
          <button
            onClick={() => setApplyForm({ ...applyForm, storeName: user?.storeName || '' })}
            className="btn btn-primary btn-md"
          >
            Re-submit Verification Request
          </button>
        </div>
      )}

      {/* STATE 4: VERIFIED SELLER COMMAND CENTER */}
      {isVerifiedSeller && (
        <>
          {/* Overview Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(99,102,241,0.2)', padding: '14px', borderRadius: '14px', color: 'var(--primary)' }}>
                <Package size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Listed Products</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>{products.length}</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(16,185,129,0.2)', padding: '14px', borderRadius: '14px', color: 'var(--success)' }}>
                <DollarSign size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Store Catalog Status</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--success)' }}>Active & Selling</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(168,85,247,0.2)', padding: '14px', borderRadius: '14px', color: 'var(--secondary)' }}>
                <ShieldCheck size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verification Status</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>Verified Merchant</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem' }}>
            {[
              { id: 'products', name: `My Products Catalog (${products.length})` },
              { id: 'add', name: 'Add New Product' },
              { id: 'profile', name: 'Store Verification Info' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontWeight: '700',
                  fontSize: '1rem',
                  background: 'none',
                  color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* TAB 1: Seller Products List with Instant Price Modification */}
          {activeTab === 'products' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Seller Products & Pricing Management</h3>
                <button onClick={() => setIsProductModalOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
                  <Plus size={16} /> Add Product
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading seller catalog...</div>
              ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  <Package size={42} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                  <h4>No products listed yet</h4>
                  <p style={{ color: 'var(--text-muted)' }}>Start selling by adding your first product to the VizHop catalog.</p>
                  <button onClick={() => setIsProductModalOpen(true)} className="btn btn-primary btn-md" style={{ marginTop: '1rem' }}>
                    Add Product Now
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Product Title</th>
                        <th>Category</th>
                        <th>Current Price</th>
                        <th>Original Price</th>
                        <th>Stock</th>
                        <th>Badge</th>
                        <th>Price Actions</th>
                        <th>Manage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p._id}>
                          <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={p.image} alt="" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: '700', color: '#fff' }}>{p.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {p._id}</div>
                            </div>
                          </td>
                          <td>{p.category}</td>
                          <td style={{ fontWeight: '800', color: 'var(--success)', fontSize: '1.05rem' }}>
                            ₹{p.price.toFixed(2)}
                          </td>
                          <td style={{ color: 'var(--text-muted)', textDecoration: p.originalPrice > p.price ? 'line-through' : 'none' }}>
                            ₹{(p.originalPrice || p.price).toFixed(2)}
                          </td>
                          <td>{p.stock} units</td>
                          <td>{p.badge && <span className="badge badge-primary">{p.badge}</span>}</td>
                          <td>
                            <button
                              onClick={() => handleOpenPriceModal(p)}
                              className="btn btn-secondary btn-sm"
                              style={{ gap: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
                            >
                              <DollarSign size={14} /> Change Price
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleEditProduct(p)} className="btn btn-secondary btn-sm" title="Edit details">
                                <Edit3 size={14} />
                              </button>
                              <button onClick={() => handleDeleteProduct(p._id)} className="btn btn-danger btn-sm" title="Delete listing">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Add New Product Form */}
          {activeTab === 'add' && (
            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '750px', margin: '0 auto' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={22} color="var(--primary)" /> Add New Product to Seller Store
              </h3>

              <form onSubmit={handleProductSubmit}>
                <div className="input-group">
                  <label className="input-label">Product Title *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Wireless Noise-Cancelling Earbuds"
                    value={productForm.title}
                    onChange={e => setProductForm({ ...productForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Product Description *</label>
                  <textarea
                    className="input-field"
                    rows={4}
                    placeholder="Provide full description, features, and specs..."
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Selling Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      placeholder="99.99"
                      value={productForm.price}
                      onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Original Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      placeholder="129.99"
                      value={productForm.originalPrice}
                      onChange={e => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Category *</label>
                    <select
                      className="input-field"
                      value={productForm.category}
                      onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Audio">Audio</option>
                      <option value="Wearables">Wearables</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home & Kitchen">Home & Kitchen</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Inventory Stock Units *</label>
                    <input
                      type="number"
                      className="input-field"
                      value={productForm.stock}
                      onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Product Image URL *</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://images.unsplash.com/..."
                    value={productForm.image}
                    onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Promotional Tag / Badge</label>
                  <select
                    className="input-field"
                    value={productForm.badge}
                    onChange={e => setProductForm({ ...productForm, badge: e.target.value })}
                  >
                    <option value="">None</option>
                    <option value="Best Seller">Best Seller</option>
                    <option value="Trending">Trending</option>
                    <option value="Hot Deal">Hot Deal</option>
                    <option value="New">New</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1.5rem' }}>
                  Publish Product to VizHop Store
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Store Profile & Verification Info */}
          {activeTab === 'profile' && (
            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color="var(--success)" /> Store Verification Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Store Name:</span>
                  <span style={{ fontWeight: '700', color: '#fff' }}>{user?.storeName || 'Merchant Store'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                  <span style={{ fontWeight: '700', color: 'var(--success)' }}>VERIFIED</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Business Email:</span>
                  <span style={{ fontWeight: '600', color: '#fff' }}>{user?.businessEmail || user?.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Business Phone:</span>
                  <span style={{ fontWeight: '600', color: '#fff' }}>{user?.businessPhone || user?.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tax / Reg ID:</span>
                  <span style={{ fontWeight: '600', color: '#fff' }}>{user?.taxId || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL 1: Fast Price Modification Popup */}
      {isPriceModalOpen && priceTargetProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={20} color="var(--success)" /> Change Product Price
              </h3>
              <button onClick={() => setIsPriceModalOpen(false)} style={{ background: 'none', color: '#fff' }}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px' }}>
              <img src={priceTargetProduct.image} alt="" style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
              <div>
                <div style={{ fontWeight: '700', color: '#fff' }}>{priceTargetProduct.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Price: ₹{priceTargetProduct.price.toFixed(2)}</div>
              </div>
            </div>

            <form onSubmit={handlePriceUpdateSubmit}>
              <div className="input-group">
                <label className="input-label">New Selling Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={priceForm.price}
                  onChange={e => setPriceForm({ ...priceForm, price: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Original List Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={priceForm.originalPrice}
                  onChange={e => setPriceForm({ ...priceForm, originalPrice: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsPriceModalOpen(false)} className="btn btn-secondary btn-md" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md" style={{ flex: 1 }}>
                  Update Price Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Full Product Create / Edit Modal */}
      {isProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>{editingProductId ? 'Edit Seller Product' : 'Create Seller Product'}</h3>
              <button onClick={closeProductModal} style={{ background: 'none', color: '#fff' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleProductSubmit}>
              <div className="input-group">
                <label className="input-label">Product Title *</label>
                <input type="text" className="input-field" value={productForm.title} onChange={e => setProductForm({ ...productForm, title: e.target.value })} required />
              </div>

              <div className="input-group">
                <label className="input-label">Description *</label>
                <textarea className="input-field" rows={3} value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Price (₹) *</label>
                  <input type="number" step="0.01" className="input-field" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                </div>

                <div className="input-group">
                  <label className="input-label">Original Price (₹)</label>
                  <input type="number" step="0.01" className="input-field" value={productForm.originalPrice} onChange={e => setProductForm({ ...productForm, originalPrice: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Category *</label>
                  <select className="input-field" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                    <option value="Electronics">Electronics</option>
                    <option value="Audio">Audio</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Stock Units *</label>
                  <input type="number" className="input-field" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} required />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Image URL *</label>
                <input type="url" className="input-field" value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} required />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={closeProductModal} className="btn btn-secondary btn-md" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-md" style={{ flex: 1 }}>
                  {editingProductId ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
