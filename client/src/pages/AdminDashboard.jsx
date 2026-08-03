import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import {
  ShieldCheck,
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { showToast } = useCart();
  const [activeTab, setActiveTab] = useState('orders'); // Defaults to Orders tab for immediate access

  // Analytics Stats State
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Core Data States
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Product Add/Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Electronics',
    image: '',
    stock: 10,
    badge: 'New'
  });

  // Fast Price Modification Modal State
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [priceTargetProduct, setPriceTargetProduct] = useState(null);
  const [priceForm, setPriceForm] = useState({ price: '', originalPrice: '' });

  // Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Banner & Category Form States
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', imageUrl: '', linkUrl: '/shop' });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', imageUrl: '' });

  const fetchData = async () => {
    try {
      setLoadingStats(true);
      const [statsRes, prodRes, catRes, banRes, ordRes, sellRes, userRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/products'),
        axios.get('/api/admin/categories'),
        axios.get('/api/admin/banners'),
        axios.get('/api/orders/admin/all'),
        axios.get('/api/admin/sellers'),
        axios.get('/api/admin/users')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (prodRes.data.success) setProducts(prodRes.data.products || []);
      if (catRes.data.success) setCategories(catRes.data.categories || []);
      if (banRes.data.success) setBanners(banRes.data.banners || []);
      if (ordRes.data.success) setAllOrders(ordRes.data.orders || []);
      if (sellRes.data.success) setSellers(sellRes.data.sellers || []);
      if (userRes.data.success) setAllUsers(userRes.data.users || []);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Save or Update Product Details
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProductId) {
        const res = await axios.put(`/api/products/${editingProductId}`, productForm);
        if (res.data.success) {
          showToast('Product details updated successfully!');
          fetchData();
          closeProductModal();
        }
      } else {
        const res = await axios.post('/api/products', productForm);
        if (res.data.success) {
          showToast('New product created successfully!');
          fetchData();
          closeProductModal();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  // Quick Price Update Handler
  const handlePriceUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!priceTargetProduct) return;
    try {
      const res = await axios.put(`/api/products/${priceTargetProduct._id}`, {
        price: parseFloat(priceForm.price),
        originalPrice: priceForm.originalPrice ? parseFloat(priceForm.originalPrice) : parseFloat(priceForm.price)
      });
      if (res.data.success) {
        showToast(`Product price updated to $${parseFloat(priceForm.price).toFixed(2)}!`);
        fetchData();
        setIsPriceModalOpen(false);
        setPriceTargetProduct(null);
      }
    } catch (err) {
      showToast('Failed to update product price', 'error');
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
    if (!window.confirm('Are you sure you want to delete this product from store?')) return;
    try {
      const res = await axios.delete(`/api/products/${id}`);
      if (res.data.success) {
        showToast('Product deleted successfully');
        fetchData();
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
      category: categories[0]?.name || 'Electronics',
      image: '',
      stock: 10,
      badge: 'New'
    });
  };

  // Order Status Confirmation Handler
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axios.put(`/api/orders/admin/${orderId}/status`, { orderStatus: newStatus });
      if (res.data.success) {
        showToast(`Order #${orderId} updated to '${newStatus}'`);
        fetchData();
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
      }
    } catch (err) {
      showToast('Failed to update order status', 'error');
    }
  };

  // Seller Verification Handler
  const handleVerifySeller = async (sellerId, newStatus) => {
    try {
      const res = await axios.put(`/api/admin/sellers/${sellerId}/verify`, { status: newStatus });
      if (res.data.success) {
        showToast(`Seller status set to ${newStatus}`);
        fetchData();
      }
    } catch (err) {
      showToast('Failed to update seller verification', 'error');
    }
  };

  // Banner Handlers
  const handleAddBanner = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/banners', bannerForm);
      if (res.data.success) {
        showToast('Banner added successfully!');
        setBannerForm({ title: '', subtitle: '', imageUrl: '', linkUrl: '/shop' });
        fetchData();
      }
    } catch (err) {
      showToast('Failed to add banner', 'error');
    }
  };

  const handleDeleteBanner = async (id) => {
    try {
      const res = await axios.delete(`/api/admin/banners/${id}`);
      if (res.data.success) {
        showToast('Banner removed');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to remove banner', 'error');
    }
  };

  // Category Handler
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/categories', categoryForm);
      if (res.data.success) {
        showToast('Category added!');
        setCategoryForm({ name: '', description: '', imageUrl: '' });
        fetchData();
      }
    } catch (err) {
      showToast('Failed to add category', 'error');
    }
  };

  const openOrderDetails = (ord) => {
    setSelectedOrder(ord);
    setIsOrderModalOpen(true);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={36} color="var(--primary)" />
            <span>SuperAdmin Control Panel</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Exclusive Admin Dashboard for <strong>sakthivijayarajkrv@gmail.com</strong>. Manage orders, confirm shipments, publish products & edit prices.
          </p>
        </div>

        <button onClick={() => setIsProductModalOpen(true)} className="btn btn-primary btn-md" style={{ gap: '6px' }}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {/* Analytics Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(99,102,241,0.2)', padding: '14px', borderRadius: '14px', color: 'var(--primary)' }}>
            <IndianRupee size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Revenue</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
              ₹{stats ? stats.totalRevenue.toFixed(2) : '0.00'}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16,185,129,0.2)', padding: '14px', borderRadius: '14px', color: 'var(--success)' }}>
            <ShoppingBag size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Orders</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
              {allOrders.length}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(168,85,247,0.2)', padding: '14px', borderRadius: '14px', color: 'var(--secondary)' }}>
            <Package size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Products Count</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
              {products.length}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(236,72,153,0.2)', padding: '14px', borderRadius: '14px', color: 'var(--accent)' }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sellers Registered</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
              {sellers.length}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-glass)', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { id: 'orders', name: `Orders & Confirmation (${allOrders.length})` },
          { id: 'products', name: `Products Catalog & Pricing (${products.length})` },
          { id: 'users', name: `Registered Users (${allUsers.length})` },
          { id: 'sellers', name: `Seller Verification (${sellers.filter(s => s.sellerStatus === 'PENDING').length} Pending)` },
          { id: 'banners', name: 'Banners & Categories' }
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

      {/* TAB 1: ORDERS & CONFIRMATION DETAILS */}
      {activeTab === 'orders' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>Customer Orders & Delivery Confirmation ({allOrders.length})</h3>
            <span className="badge badge-primary" style={{ padding: '6px 12px' }}>
              Admin Confirmation Mode
            </span>
          </div>

          {allOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No orders placed yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Name & Email</th>
                    <th>Items</th>
                    <th>Total Price</th>
                    <th>Payment</th>
                    <th>Order Status</th>
                    <th>Order Details & Confirmation</th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders.map(ord => (
                    <tr key={ord._id}>
                      <td style={{ fontWeight: '700', color: 'var(--primary)' }}>#{ord._id}</td>
                      <td>
                        <div style={{ fontWeight: '600', color: '#fff' }}>
                          {ord.shippingAddress?.fullName || ord.userId?.name || 'Customer'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {ord.userId?.email || 'N/A'}
                        </div>
                      </td>
                      <td>{ord.orderItems?.length || 0} item(s)</td>
                      <td style={{ fontWeight: '800', color: '#fff' }}>
                        ₹{ord.totalPrice ? ord.totalPrice.toFixed(2) : '0.00'}
                      </td>
                      <td>
                        <span className={`badge ${ord.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                          {ord.paymentStatus || 'Paid'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${ord.orderStatus === 'Delivered' ? 'badge-success' : ord.orderStatus === 'Shipped' ? 'badge-primary' : ord.orderStatus === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                          {ord.orderStatus || 'Processing'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => openOrderDetails(ord)}
                            className="btn btn-secondary btn-sm"
                            style={{ gap: '4px', fontSize: '0.78rem', padding: '4px 8px' }}
                            title="View Full Details"
                          >
                            <Eye size={14} /> Details
                          </button>

                          {ord.orderStatus !== 'Processing' && ord.orderStatus !== 'Delivered' && (
                            <button
                              onClick={() => handleOrderStatusChange(ord._id, 'Processing')}
                              className="btn btn-primary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.78rem', background: '#10b981', borderColor: '#10b981' }}
                            >
                              Confirm
                            </button>
                          )}

                          {ord.orderStatus !== 'Cancelled' && (
                            <button
                              onClick={() => handleOrderStatusChange(ord._id, 'Cancelled')}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                            >
                              Cancel
                            </button>
                          )}

                          <select
                            className="input-field"
                            value={ord.orderStatus || 'Processing'}
                            onChange={(e) => handleOrderStatusChange(ord._id, e.target.value)}
                            style={{ padding: '0.25rem 0.4rem', fontSize: '0.78rem', width: 'auto', background: '#0f172a', color: '#fff' }}
                          >
                            <option value="Processing">Confirm Order</option>
                            <option value="Shipped">Mark Shipped</option>
                            <option value="Delivered">Mark Delivered</option>
                            <option value="Cancelled">Cancel Order</option>
                          </select>
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

      {/* TAB 2: PRODUCTS CATALOG & PRICING MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>Store Products & Price Rate Control ({products.length})</h3>
            <button onClick={() => setIsProductModalOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
              <Plus size={16} /> Add Product
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product Title</th>
                  <th>Category</th>
                  <th>Selling Price</th>
                  <th>Original Price</th>
                  <th>Stock</th>
                  <th>Badge</th>
                  <th>Price Rate Action</th>
                  <th>Product Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={p.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      <span style={{ fontWeight: '600', color: '#fff' }}>{p.title}</span>
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
                        <IndianRupee size={14} /> Change Price
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleEditProduct(p)} className="btn btn-secondary btn-sm" title="Edit details">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteProduct(p._id)} className="btn btn-danger btn-sm" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REGISTERED USERS & CUSTOMERS */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>Registered Website Users & Customers ({allUsers.length})</h3>
            <span className="badge badge-primary" style={{ padding: '6px 12px' }}>
              SuperAdmin User Management
            </span>
          </div>

          {allUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No registered users found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Mobile Phone</th>
                    <th>Account Role</th>
                    <th>2-Step Verification</th>
                    <th>Seller Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(u => (
                    <tr key={u._id || u.email}>
                      <td>
                        <div style={{ fontWeight: '700', color: '#fff' }}>{u.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ID: {u._id}</div>
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{u.email}</td>
                      <td>{u.phone || 'N/A'}</td>
                      <td>
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-primary' : u.role === 'SELLER' ? 'badge-secondary' : 'badge-outline'}`}>
                          {u.role || 'USER'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem' }}>
                          <span style={{ color: u.isEmailVerified ? '#10b981' : '#f59e0b' }}>
                            {u.isEmailVerified ? '✓ Email Verified' : '⏳ Email Pending'}
                          </span>
                          <span style={{ color: u.isMobileVerified ? '#10b981' : '#f59e0b' }}>
                            {u.isMobileVerified ? '✓ Mobile Verified' : '⏳ Mobile Pending'}
                          </span>
                        </div>
                      </td>
                      <td>
                        {u.sellerStatus && u.sellerStatus !== 'NONE' ? (
                          <span className={`badge ${u.sellerStatus === 'VERIFIED' ? 'badge-success' : u.sellerStatus === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                            Seller: {u.sellerStatus}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Customer</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SELLER VERIFICATION */}
      {activeTab === 'sellers' && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3>Seller Panel Applications & Verification ({sellers.length})</h3>
            <span className="badge badge-primary" style={{ padding: '6px 12px' }}>
              Admin Verification Mode
            </span>
          </div>

          {sellers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No seller applications found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Store & Applicant</th>
                    <th>Contact Info</th>
                    <th>Document</th>
                    <th>Verification Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map(sel => (
                    <tr key={sel._id}>
                      <td>
                        <div style={{ fontWeight: '700', color: '#fff' }}>{sel.storeName || sel.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Owner: {sel.name}</div>
                      </td>
                      <td>
                        <div>{sel.businessEmail || sel.email}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sel.businessPhone || sel.phone}</div>
                      </td>
                      <td>
                        {sel.verificationDoc ? (
                          <a href={sel.verificationDoc} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'underline' }}>
                            View Document
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>None</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${sel.sellerStatus === 'VERIFIED' ? 'badge-success' : sel.sellerStatus === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                          {sel.sellerStatus || 'PENDING'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {sel.sellerStatus !== 'VERIFIED' && (
                            <button
                              onClick={() => handleVerifySeller(sel._id, 'VERIFIED')}
                              className="btn btn-success btn-sm"
                              style={{ gap: '4px', background: '#10b981', color: '#fff' }}
                            >
                              <Check size={14} /> Verify & Approve
                            </button>
                          )}
                          {sel.sellerStatus !== 'REJECTED' && (
                            <button
                              onClick={() => handleVerifySeller(sel._id, 'REJECTED')}
                              className="btn btn-danger btn-sm"
                              style={{ gap: '4px' }}
                            >
                              <X size={14} /> Reject
                            </button>
                          )}
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

      {/* TAB 4: BANNERS & CATEGORIES */}
      {activeTab === 'banners' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Banners Box */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Site Banners Carousel</h3>

            <form onSubmit={handleAddBanner} style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Add New Hero Banner</h4>
              <div className="input-group">
                <label className="input-label">Banner Title</label>
                <input type="text" className="input-field" value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Subtitle</label>
                <input type="text" className="input-field" value={bannerForm.subtitle} onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="input-label">Image URL</label>
                <input type="url" className="input-field" value={bannerForm.imageUrl} onChange={e => setBannerForm({ ...bannerForm, imageUrl: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Add Banner</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {banners.map(b => (
                <div key={b._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '10px' }}>
                  <img src={b.imageUrl} alt="" style={{ width: '80px', height: '50px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#fff' }}>{b.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.subtitle}</div>
                  </div>
                  <button onClick={() => handleDeleteBanner(b._id)} className="btn btn-danger btn-sm">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Categories Box */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.25rem' }}>Categories Management</h3>

            <form onSubmit={handleAddCategory} style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Add New Category</h4>
              <div className="input-group">
                <label className="input-label">Category Name</label>
                <input type="text" className="input-field" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <input type="text" className="input-field" value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Add Category</button>
            </form>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {categories.map(cat => (
                <div key={cat._id || cat.name} style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', padding: '8px 14px', borderRadius: '10px', fontSize: '0.9rem', color: '#fff', fontWeight: '600' }}>
                  {cat.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Order Details & Status Confirmation Popup */}
      {isOrderModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
              <h3>Order Details #{selectedOrder._id}</h3>
              <button onClick={() => setIsOrderModalOpen(false)} style={{ background: 'none', color: '#fff' }}><X size={20} /></button>
            </div>

            {/* Customer Details */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Customer & Delivery Info</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div><strong>Name:</strong> {selectedOrder.shippingAddress?.fullName || selectedOrder.userId?.name || 'Customer'}</div>
                <div><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone || selectedOrder.userId?.phone || 'N/A'}</div>
                <div><strong>Email:</strong> {selectedOrder.userId?.email || 'N/A'}</div>
                <div><strong>Payment:</strong> <span className="badge badge-success">{selectedOrder.paymentStatus || 'Paid'}</span></div>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                <strong>Shipping Address:</strong> {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zip}
              </div>
            </div>

            {/* Order Items Table */}
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Itemized Products ({selectedOrder.orderItems?.length || 0})</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '0.5rem' }}>
              {selectedOrder.orderItems?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0.5rem 0', borderBottom: idx !== selectedOrder.orderItems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <img src={item.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      ₹{item.price.toFixed(2)} x {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: '800', color: 'var(--success)' }}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800', fontSize: '1.1rem', marginBottom: '1.5rem', background: 'rgba(99,102,241,0.1)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
              <span>Total Order Amount:</span>
              <span style={{ color: 'var(--success)' }}>₹{selectedOrder.totalPrice ? selectedOrder.totalPrice.toFixed(2) : '0.00'}</span>
            </div>

            {/* Admin Order Confirmation Actions */}
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>Update Order Confirmation Status:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                onClick={() => handleOrderStatusChange(selectedOrder._id, 'Processing')}
                className="btn btn-primary btn-sm"
                style={{ gap: '6px' }}
              >
                <CheckCircle size={16} /> Confirm Order
              </button>
              <button
                onClick={() => handleOrderStatusChange(selectedOrder._id, 'Shipped')}
                className="btn btn-secondary btn-sm"
                style={{ gap: '6px', background: 'rgba(99,102,241,0.2)', color: '#fff' }}
              >
                <Truck size={16} /> Mark as Shipped
              </button>
              <button
                onClick={() => handleOrderStatusChange(selectedOrder._id, 'Delivered')}
                className="btn btn-success btn-sm"
                style={{ gap: '6px', background: '#10b981', color: '#fff' }}
              >
                <Check size={16} /> Mark Delivered
              </button>
              <button
                onClick={() => handleOrderStatusChange(selectedOrder._id, 'Cancelled')}
                className="btn btn-danger btn-sm"
                style={{ gap: '6px' }}
              >
                <X size={16} /> Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Fast Price Modification Popup */}
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
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Selling Price: ₹{priceTargetProduct.price.toFixed(2)}</div>
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
                  Update Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Full Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>{editingProductId ? 'Edit Store Product' : 'Create New Store Product'}</h3>
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
                    {categories.map(c => <option key={c._id || c.name} value={c.name}>{c.name}</option>)}
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

              <div className="input-group">
                <label className="input-label">Special Badge</label>
                <select className="input-field" value={productForm.badge} onChange={e => setProductForm({ ...productForm, badge: e.target.value })}>
                  <option value="">None</option>
                  <option value="Best Seller">Best Seller</option>
                  <option value="Trending">Trending</option>
                  <option value="Hot Deal">Hot Deal</option>
                  <option value="New">New</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={closeProductModal} className="btn btn-secondary btn-md" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-md" style={{ flex: 1 }}>
                  {editingProductId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
