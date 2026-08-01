import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './components/ThemeToggle';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import Academy from './pages/Academy';
import CourseDetail from './pages/CourseDetail';
import CoursePlayer from './pages/CoursePlayer';
import Community from './pages/Community';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AIAssistant from './pages/AIAssistant';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import CartDrawer from './components/CartDrawer';
import FloatingTooltip from './components/FloatingTooltip';
import useAuthStore from './store/useAuthStore';
import { useEffect, useState, useCallback, useRef } from 'react';
import SmoothScroll from './components/layout/SmoothScroll';
import CustomCursor from './components/ui/CustomCursor';
import GlobalCanvas from './components/canvas/GlobalCanvas';
import LoadingScreen from './components/ui/LoadingScreen';
import WovenSilkTransition from './components/ui/WovenSilkTransition';
import useDirection from './hooks/useDirection';

/**
 * Handcrafted Woven Textile Transition Variants
 * Synchronized with the 800ms Woven Silk Threads animation.
 */
const wovenTextileTransition = {
  initial: {
    opacity: 0,
    filter: 'blur(10px)',
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.25, // Appears as threads complete weaving across
    },
  },
  exit: {
    opacity: 0,
    filter: 'blur(8px)',
    scale: 0.99,
    transition: {
      duration: 0.35,
      ease: [0.7, 0, 0.84, 0],
    },
  },
};

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AnimatedRoutes({ onPathChange }) {
  const location = useLocation();
  const noFooterPaths = ['/dashboard', '/admin', '/ai-assistant', '/checkout', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
  const showFooter = !noFooterPaths.some(p => location.pathname.startsWith(p));
  const isPlayerPage = location.pathname.includes('/learn');

  useEffect(() => {
    onPathChange?.(location.pathname);
  }, [location.pathname, onPathChange]);

  return (
    <>
      <ScrollToTop />
      {!isPlayerPage && <Navbar />}
      <WovenSilkTransition>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={wovenTextileTransition}
            style={{ willChange: 'opacity, filter, transform' }}
          >
            <Routes location={location}>
              <Route path="/" element={<Landing />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/marketplace/:id" element={<ProductDetail />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['customer', 'artisan', 'admin']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              <Route path="/academy" element={<Academy />} />
              <Route path="/academy/:id" element={<CourseDetail />} />
              <Route path="/academy/:id/learn" element={<CoursePlayer />} />
              <Route path="/community" element={<Community />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </WovenSilkTransition>
      {showFooter && !isPlayerPage && <Footer />}
    </>
  );
}

function MainApp() {
  const [currentPath, setCurrentPath] = useState('/');
  useDirection(); // Manages document dir, lang, and data-lang attributes

  const handlePathChange = useCallback((path) => {
    setCurrentPath(path);
  }, []);

  return (
    <GlobalCanvas pathname={currentPath}>
      <ToastProvider>
        <FloatingTooltip />
        <AnimatedRoutes onPathChange={handlePathChange} />
        <CartDrawer />
      </ToastProvider>
    </GlobalCanvas>
  );
}

function App() {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const [loading, setLoading] = useState(true);

  const handleLoadComplete = useCallback(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ThemeProvider>
      <SmoothScroll>
        <CustomCursor />
        <AnimatePresence mode="wait">
          {loading && <LoadingScreen onComplete={handleLoadComplete} />}
        </AnimatePresence>
        <Router>
          <MainApp />
        </Router>
      </SmoothScroll>
    </ThemeProvider>
  );
}

export default App;
