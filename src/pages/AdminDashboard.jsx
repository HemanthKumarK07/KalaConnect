import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, ShoppingBag, ShieldAlert, BarChart3, Settings, ShieldCheck, ArrowUpRight, Menu } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../store/useAuthStore';
import SkeletonLoader from '../components/SkeletonLoader';
import './Dashboard.css';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { t } = useTranslation('common');
  const [activeSidebar, setActiveSidebar] = useState('Overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { user, token } = useAuthStore();

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
        console.error('Failed to fetch admin dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) fetchDashboard();
  }, [token]);

  const sidebarItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Overview' },
    { icon: <Users size={18} />, label: 'User Management' },
    { icon: <ShoppingBag size={18} />, label: 'Marketplace' },
    { icon: <ShieldCheck size={18} />, label: 'Approvals' },
    { icon: <ShieldAlert size={18} />, label: 'Reports' },
    { icon: <Settings size={18} />, label: 'Settings' },
  ];

  const formatCurrency = (val) => val >= 100000 ? `₹${(val/100000).toFixed(1)}L` : `₹${val.toLocaleString('en-IN')}`;
  const totalVolume = dashboardData?.stats?.totalVolume ? formatCurrency(dashboardData.stats.totalVolume) : '₹0';

  const stats = [
    { label: 'Total Volume (Platform)', value: totalVolume, change: '+23%', icon: <BarChart3 size={20} /> },
    { label: 'Active Artisans', value: dashboardData?.stats?.activeArtisans || 0, change: '+12', icon: <Users size={20} /> },
    { label: 'Pending Approvals', value: dashboardData?.stats?.pendingApprovals || 0, change: '-5', icon: <ShieldCheck size={20} /> },
    { label: 'Active Courses', value: dashboardData?.stats?.activeCourses || 0, change: '+3', icon: <LayoutDashboard size={20} /> },
  ];

  const revenueHistory = dashboardData?.revenueHistory || [];

  if (loading) {
    return (
      <div className="dashboard-page admin-page" style={{ display: 'flex', padding: '100px 50px' }}>
        <SkeletonLoader count={1} type="card" style={{ width: '250px', height: '100vh', marginRight: '30px' }} />
        <div style={{ flex: 1 }}>
          <SkeletonLoader count={1} type="title" style={{ width: '300px', marginBottom: '30px' }} />
          <SkeletonLoader count={4} type="card" style={{ display: 'inline-block', width: '22%', height: '120px', marginRight: '2%' }} />
          <SkeletonLoader count={1} type="card" style={{ width: '100%', height: '300px', marginTop: '30px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page dashboard-page">
      <aside className={`dash-sidebar ${isMobileSidebarOpen ? 'dash-sidebar--open' : ''}`}>
        <div className="dash-sidebar__header">
          <div className="avatar" style={{ background: 'var(--color-primary)' }}>AD</div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{user?.name || 'Admin'}</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>Super Admin</p>
          </div>
        </div>
        <nav className="dash-sidebar__nav">
          {sidebarItems.map(item => (
            <button key={item.label} className={`dash-sidebar__item ${activeSidebar === item.label ? 'active' : ''}`} onClick={() => setActiveSidebar(item.label)}>
              {item.icon} {item.label}
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
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 600 }}>{t('nav.adminConsole')}</h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>Platform overview and moderation tools.</p>
            </div>
          </div>
        </div>

        <div className="dash-stats">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} className="dash-stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="dash-stat-card__icon" style={{ color: 'var(--color-primary)' }}>{stat.icon}</div>
              <div className="dash-stat-card__info">
                <span className="dash-stat-card__label">{stat.label}</span>
                <span className="dash-stat-card__value font-number">{stat.value}</span>
              </div>
              <span className={`dash-stat-card__change ${stat.change.startsWith('+') ? 'up' : 'down'}`}>
                <ArrowUpRight size={14} /> {stat.change}
              </span>
            </motion.div>
          ))}
        </div>

        {revenueHistory.length > 0 && (
          <motion.div className="dash-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="dash-chart-card__header">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Platform GMV (Gross Merchandise Value)</h3>
            </div>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueHistory}>
                  <defs>
                    <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3F3126" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3F3126" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/100000}L`} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#3F3126" strokeWidth={2} fill="url(#adminGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
        
        <div className="admin-grid">
           <div className="dash-orders-card">
             <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Pending Product Approvals</h3>
             <div className="dash-orders-table">
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>No pending approvals.</p>
             </div>
           </div>
           
           <div className="dash-orders-card">
             <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Reported Users/Content</h3>
             <div className="dash-orders-table">
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>No active reports.</p>
             </div>
           </div>
        </div>

      </main>
    </div>
  );
}
