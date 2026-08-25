import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Package, ShoppingBag, Users, TrendingUp, Star, Clock, Plus,
  Settings, Bell, ArrowUpRight, ArrowDownRight, Menu, Heart, BookOpen, Award,
  ShieldCheck, Upload
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button';
import SkeletonLoader from '../components/SkeletonLoader';
import useAuthStore from '../store/useAuthStore';
import Logo from '../components/Logo';
import { verifyArtisanCraft } from '../api/ai';
import { useToast } from '../components/Toast';
import './Dashboard.css';

// Sidebar items per role
const artisanSidebarItems = [
  { icon: <BarChart3 size={18} />, labelKey: 'overview' },
  { icon: <Package size={18} />, labelKey: 'products' },
  { icon: <ShoppingBag size={18} />, labelKey: 'orders' },
  { icon: <Users size={18} />, labelKey: 'students' },
  { icon: <Star size={18} />, labelKey: 'reviews' },
  { icon: <Bell size={18} />, labelKey: 'notifications' },
  { icon: <Settings size={18} />, labelKey: 'settings' },
];

const customerSidebarItems = [
  { icon: <BarChart3 size={18} />, labelKey: 'overview' },
  { icon: <ShoppingBag size={18} />, labelKey: 'myOrders' },
  { icon: <Heart size={18} />, labelKey: 'wishlist' },
  { icon: <BookOpen size={18} />, labelKey: 'myCourses' },
  { icon: <Award size={18} />, labelKey: 'certificates' },
  { icon: <Settings size={18} />, labelKey: 'settings' },
];

export default function Dashboard() {
  const { t } = useTranslation('dashboard');
  const [activeSidebar, setActiveSidebar] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Dashboard state
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationFile, setVerificationFile] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const { user, token } = useAuthStore();
  const { showToast } = useToast();
  const [isAIVerified, setIsAIVerified] = useState(user?.isAIVerified === true);

  const isArtisan = user?.role === 'artisan' || user?.role === 'admin';
  const sidebarItems = isArtisan ? artisanSidebarItems : customerSidebarItems;

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.success) {
          setDashboardData(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) fetchDashboard();
  }, [token]);

  // User initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const firstName = user?.name?.split(' ')[0] || 'User';
  const roleLabel = user?.role === 'artisan' ? 'Artisan' : user?.role === 'admin' ? 'Admin' : 'Customer';

  const formatCurrency = (val) => val >= 100000 ? `₹${(val/100000).toFixed(1)}L` : `₹${val.toLocaleString('en-IN')}`;

  const artisanStats = [
    { label: t('stats.totalRevenue'), value: dashboardData?.stats?.totalRevenue ? formatCurrency(dashboardData.stats.totalRevenue) : '₹0', change: '+23%', up: true, icon: <TrendingUp size={20} /> },
    { label: t('stats.activeOrders'), value: dashboardData?.stats?.activeOrders || 0, change: '+8', up: true, icon: <ShoppingBag size={20} /> },
    { label: t('stats.totalProducts'), value: dashboardData?.stats?.totalProducts || 0, change: '+5', up: true, icon: <Package size={20} /> },
    { label: t('stats.courseStudents'), value: dashboardData?.stats?.courseStudents?.toLocaleString() || 0, change: '+142', up: true, icon: <Users size={20} /> },
  ];

  const customerStats = [
    { label: t('stats.ordersPlaced'), value: dashboardData?.stats?.ordersPlaced || 0, change: '+3', up: true, icon: <ShoppingBag size={20} /> },
    { label: t('stats.wishlistItems'), value: dashboardData?.stats?.wishlistItems || 0, change: '+2', up: true, icon: <Heart size={20} /> },
    { label: t('stats.coursesEnrolled'), value: dashboardData?.stats?.coursesEnrolled || 0, change: '+1', up: true, icon: <BookOpen size={20} /> },
    { label: t('stats.certificates'), value: dashboardData?.stats?.certificates || 0, change: t('stats.certificatesNew'), up: true, icon: <Award size={20} /> },
  ];

  const statsCards = isArtisan ? artisanStats : customerStats;
  const recentOrders = dashboardData?.recentOrders || [];
  const products = dashboardData?.products || [];
  const revenueHistory = dashboardData?.revenueHistory || [];

  const handleVerification = async (event) => {
    event.preventDefault();

    if (!verificationFile) {
      showToast('Please upload an image of your craft first.', 'info');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await verifyArtisanCraft(verificationFile);
      if (response.verified) {
        setIsAIVerified(true);
        showToast(response.reason || 'Craft technique authenticated.', 'success');
      } else {
        showToast(`Verification failed: ${response.reason || 'The image could not be authenticated.'}`, 'error');
      }
    } catch (error) {
      showToast(error.message || 'Verification failed. Please try again.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'var(--color-success)';
      case 'Shipped': return 'var(--color-info)';
      case 'Processing': return 'var(--color-warning)';
      default: return 'var(--color-text-tertiary)';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page" style={{ display: 'flex', padding: '100px 50px' }}>
        <SkeletonLoader count={1} type="card" style={{ width: '250px', height: '100vh', marginRight: '30px' }} />
        <div style={{ flex: 1 }}>
          <SkeletonLoader count={1} type="title" style={{ width: '300px', marginBottom: '30px' }} />
          <SkeletonLoader count={4} type="card" style={{ display: 'inline-block', width: '22%', height: '120px', marginRight: '2%' }} />
          <SkeletonLoader count={1} type="card" style={{ width: '100%', height: '300px', marginTop: '30px' }} />
        </div>
      </div>
    );
  }

  // Render content based on active sidebar tab
  const renderContent = () => {
    switch (activeSidebar) {
      case 'overview':
        return renderOverview();
      case 'products':
        return renderProducts();
      case 'orders':
      case 'myOrders':
        return renderOrders();
      case 'students':
        return renderPlaceholder(t('sidebar.students'), 'Student enrollment and progress data.', <Users size={40} />);
      case 'reviews':
        return renderPlaceholder(t('sidebar.reviews'), 'Customer reviews and ratings.', <Star size={40} />);
      case 'notifications':
        return renderPlaceholder(t('sidebar.notifications'), 'Your latest notifications.', <Bell size={40} />);
      case 'settings':
        return renderSettings();
      case 'wishlist':
        return renderPlaceholder(t('sidebar.wishlist'), 'Your saved products will appear here.', <Heart size={40} />);
      case 'myCourses':
        return renderPlaceholder(t('sidebar.myCourses'), 'Courses you are enrolled in.', <BookOpen size={40} />);
      case 'certificates':
        return renderPlaceholder(t('sidebar.certificates'), 'Your earned certificates.', <Award size={40} />);
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <>
      {/* Stats */}
      <div className="dash-stats">
        {statsCards.map((stat, i) => (
          <motion.div key={stat.label} className="dash-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }}>
            <div className="dash-stat-card__icon">{stat.icon}</div>
            <div className="dash-stat-card__info">
              <span className="dash-stat-card__label">{stat.label}</span>
              <span className="dash-stat-card__value font-number">{stat.value}</span>
            </div>
            <span className={`dash-stat-card__change ${stat.up ? 'up' : 'down'}`}>
              {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {stat.change}
            </span>
          </motion.div>
        ))}
      </div>

      {isArtisan && (
        <motion.div className="dash-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="dash-chart-card__header">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Get AI Verified</h3>
            {isAIVerified && <span className="badge badge--success"><ShieldCheck size={13} /> Verified</span>}
          </div>
          {isAIVerified ? (
            <p style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <ShieldCheck size={18} /> Your craft technique has been authenticated.
            </p>
          ) : (
            <form onSubmit={handleVerification} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <label className="input" style={{ flex: '1 1 260px', cursor: 'pointer' }}>
                <Upload size={16} style={{ verticalAlign: 'middle', marginRight: 'var(--space-2)' }} />
                {verificationFile ? verificationFile.name : 'Upload a craft image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={event => setVerificationFile(event.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
              </label>
              <Button type="submit" variant="accent" size="sm" disabled={isVerifying} icon={<ShieldCheck size={15} />}>
                {isVerifying ? 'Verifying...' : 'Submit for Verification'}
              </Button>
            </form>
          )}
        </motion.div>
      )}

      {/* Revenue Chart — artisan only */}
      {isArtisan && revenueHistory.length > 0 && (
        <motion.div className="dash-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="dash-chart-card__header">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Revenue Overview</h3>
            <span className="tag">Last 7 months</span>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A66B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#C9A66B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 13 }} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#C9A66B" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Recent Orders */}
      <motion.div className="dash-orders-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="dash-chart-card__header">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
            {isArtisan ? t('recentOrders.title') : t('sidebar.myOrders')}
          </h3>
          <button className="btn btn--ghost btn--sm">{t('recentOrders.viewAll')}</button>
        </div>
        {recentOrders.length > 0 ? renderOrderTable(recentOrders) : <p style={{color: 'var(--color-text-secondary)', padding: 'var(--space-4) 0'}}>{t('recentOrders.noOrders')}</p>}
      </motion.div>

      {/* Products — artisan only */}
      {isArtisan && (
        <motion.div className="dash-products-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="dash-chart-card__header">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Your Products</h3>
            <Button variant="outline" size="sm" icon={<Plus size={14} />}>Add New</Button>
          </div>
          {products.length > 0 ? (
            <div className="dash-products-grid">
              {products.slice(0, 6).map((p, i) => (
                <div key={p._id} className="dash-product-mini">
                  <div className="dash-product-mini__image" style={{ background: ['linear-gradient(135deg, #D4B896, #8A6A4A)', 'linear-gradient(135deg, #A8C4B8, #4F6958)', 'linear-gradient(135deg, #B8A8C4, #6B5C7A)'][i % 3] }} />
                  <div>
                    <p style={{ fontWeight: 500, fontSize: 'var(--text-sm)', marginBottom: '2px' }}>{p.shortTitle}</p>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                      <span className="font-number">₹{p.price.toLocaleString()}</span>
                      <span>{p.sold} sold</span>
                      <span><Star size={11} fill="#C9A66B" stroke="#C9A66B" /> {p.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{color: 'var(--color-text-secondary)', padding: 'var(--space-4) 0'}}>No products found.</p>
          )}
        </motion.div>
      )}
    </>
  );

  const renderOrderTable = (orders) => (
    <div className="dash-orders-table">
      <div className="dash-orders-thead">
        <span>Order</span><span>Product</span><span>Customer</span><span>Amount</span><span>Status</span>
      </div>
      {orders.map((order, i) => (
        <motion.div key={order._id} className="dash-orders-row" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
          <span className="font-number" style={{ fontWeight: 500 }}>{order.orderNumber}</span>
          <span>{order.productName}</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>{order.customerName}</span>
          <span className="font-number" style={{ fontWeight: 600 }}>₹{order.amount.toLocaleString('en-IN')}</span>
          <span className="dash-orders-status" style={{ color: statusColor(order.status) }}>
            <span className="dash-orders-status-dot" style={{ background: statusColor(order.status) }} />
            {order.status}
          </span>
        </motion.div>
      ))}
    </div>
  );

  const renderProducts = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="dash-chart-card__header" style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-xl)' }}>All Products</h2>
        <Button variant="accent" size="sm" icon={<Plus size={14} />}>Add Product</Button>
      </div>
      <div className="dash-products-card">
        {products.length > 0 ? (
          <div className="dash-products-grid">
            {products.map((p, i) => (
              <div key={p._id} className="dash-product-mini">
                <div className="dash-product-mini__image" style={{ background: ['linear-gradient(135deg, #D4B896, #8A6A4A)', 'linear-gradient(135deg, #A8C4B8, #4F6958)', 'linear-gradient(135deg, #B8A8C4, #6B5C7A)'][i % 3] }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, fontSize: 'var(--text-sm)', marginBottom: '2px' }}>{p.shortTitle}</p>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                    <span className="font-number">₹{p.price.toLocaleString()}</span>
                    <span>{p.sold} sold</span>
                    <span><Star size={11} fill="#C9A66B" stroke="#C9A66B" /> {p.rating}</span>
                    <span className="badge badge--success" style={{ marginLeft: 'auto' }}>{p.inStock ? 'In Stock' : 'Out'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{color: 'var(--color-text-secondary)', padding: 'var(--space-4) 0'}}>No products found.</p>
        )}
      </div>
    </motion.div>
  );

  const renderOrders = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>
        {isArtisan ? 'All Orders' : 'My Orders'}
      </h2>
      <div className="dash-orders-card">
        {recentOrders.length > 0 ? renderOrderTable(recentOrders) : <p style={{color: 'var(--color-text-secondary)', padding: 'var(--space-4) 0'}}>No orders found.</p>}
      </div>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)' }}>Profile Settings</h2>
      <div className="dash-chart-card" style={{ padding: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
          <div className="avatar avatar--xl" style={{ background: 'linear-gradient(135deg, #C9A66B, #8A6A4A)', fontSize: 'var(--text-2xl)' }}>{initials}</div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-xl)' }}>{user?.name || 'User'}</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>{user?.email || ''}</p>
            <span className="badge badge--accent" style={{ marginTop: 'var(--space-2)' }}>{roleLabel}</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          {[
            { label: 'Full Name', value: user?.name || '' },
            { label: 'Email', value: user?.email || '' },
            { label: 'Phone', value: user?.phone || 'Not set' },
            { label: 'Location', value: user?.state ? `${user.district || ''}, ${user.state}` : 'Not set' },
          ].map((field) => (
            <div key={field.label} className="form-group">
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 'var(--space-2)' }}>{field.label}</label>
              <input className="input" value={field.value} readOnly style={{ opacity: 0.7 }} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderPlaceholder = (title, description, icon) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 'var(--space-20) var(--space-8)' }}>
      <div style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-4)' }}>{icon}</div>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>{title}</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>{description}</p>
    </motion.div>
  );

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className={`dash-sidebar ${isMobileSidebarOpen ? 'dash-sidebar--open' : ''}`}>
        <div className="dash-sidebar__brand" style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
          <Logo variant="horizontal" size="sm" />
        </div>
        <div className="dash-sidebar__header">
          <div className="avatar" style={{ background: 'linear-gradient(135deg, #C9A66B, #8A6A4A)' }}>{initials}</div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{user?.name || 'User'}</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>{roleLabel}</p>
          </div>
        </div>
        <nav className="dash-sidebar__nav">
          {sidebarItems.map(item => (
            <button
              key={item.labelKey}
              className={`dash-sidebar__item ${activeSidebar === item.labelKey ? 'active' : ''}`}
              onClick={() => { setActiveSidebar(item.labelKey); setIsMobileSidebarOpen(false); }}
            >
              {item.icon} {t(`sidebar.${item.labelKey}`)}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="dash-sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="dash-main">
        <div className="dash-main__header">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
            <button className="dash-mobile-toggle" onClick={() => setIsMobileSidebarOpen(true)} aria-label="Toggle Menu">
              <Menu size={24} />
            </button>
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 600 }}>
                {activeSidebar === 'overview' ? `Welcome back, ${firstName} 🙏` : t(`sidebar.${activeSidebar}`)}
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                {activeSidebar === 'overview'
                  ? isArtisan
                    ? t('welcome.artisan')
                    : t('welcome.customer')
                  : `Manage your ${t(`sidebar.${activeSidebar}`).toLowerCase()}`}
              </p>
            </div>
          </div>
          {activeSidebar === 'overview' && isArtisan && (
            <Button variant="accent" size="sm" icon={<Plus size={16} />}>Add Product</Button>
          )}
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
