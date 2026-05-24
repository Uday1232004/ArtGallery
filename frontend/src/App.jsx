import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CursorProvider } from './context/CursorContext'
import Cursor from './components/Cursor'
import Navbar from './components/Navbar'
import CartSidebar from './components/CartSidebar'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Gallery from './pages/Gallery'
import ArtworkDetail from './pages/ArtworkDetail'
import UserProfile from './pages/UserProfile'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Artists from './pages/Artists'
import Exhibitions from './pages/Exhibitions'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminOrders from './pages/admin/Orders'
import AdminArtworks from './pages/admin/Artworks'

import AdminExhibitions from './pages/admin/Exhibitions'
import AdminCommissions from './pages/admin/Commissions'
import AdminLogin from './pages/admin/Login'
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'
import RequestCommission from './pages/RequestCommission'
import ArtistProfile from './pages/ArtistProfile'
import CommissionDetail from './pages/CommissionDetail'
import ToastContainer from './components/Toast'
import { getLenis } from './animations/lenis'

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isHydrating } = useAuthStore();
  const storeHydrated = useAuthStore.persist.hasHydrated();
  
  console.log('[ProtectedRoute] Evaluation. storeHydrated:', storeHydrated, 'isHydrating:', isHydrating, 'isAuthenticated:', isAuthenticated);
  
  if (!storeHydrated || isHydrating) {
    console.log('[ProtectedRoute] Route evaluation suspended. Zustand is still hydrating or validating.');
    return (
      <div className="min-h-screen bg-void flex items-center justify-center pencil-texture relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(222,214,199,0.05)_0%,transparent_80%)] z-0" />
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin z-10" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] User not authenticated. Redirecting to /login.');
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && !isAdmin()) {
    console.log('[ProtectedRoute] User is not authorized as Admin. Redirecting to /profile.');
    return <Navigate to="/profile" replace />;
  }
  
  console.log('[ProtectedRoute] Access granted.');
  return children;
};

export default function App() {
  const location = useLocation();
  const isAdminOrLogin = location.pathname.startsWith('/admin') || location.pathname === '/login' || location.pathname === '/signup';

  const { fetchCart } = useCartStore();
  const { isAuthenticated, isHydrating, user, initAuth } = useAuthStore();
  const [storeHydrated, setStoreHydrated] = useState(false);

  // 1. Listen to Zustand store hydration completion
  useEffect(() => {
    console.log('[App Mount] Checking store hydration state. hasHydrated:', useAuthStore.persist.hasHydrated());
    
    if (useAuthStore.persist.hasHydrated()) {
      setStoreHydrated(true);
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        console.log('[App] Zustand store hydration finished.');
        setStoreHydrated(true);
      });
      return unsub;
    }
  }, []);

  // 2. Once store is hydrated, trigger initAuth if isHydrating is true
  useEffect(() => {
    if (storeHydrated && isHydrating) {
      console.log('[App] Store is hydrated and auth is not initialized yet. Explicitly triggering initAuth.');
      initAuth();
    }
  }, [storeHydrated, isHydrating, initAuth]);

  // 3. Fetch cart when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  // Scroll restoration and smooth hash scrolling
  useEffect(() => {
    if (!location.hash) {
      // No hash, reset scroll to top
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(0, { duration: 0.2, immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      // Scroll to hash element
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        const lenis = getLenis();
        setTimeout(() => {
          if (lenis) {
            lenis.scrollTo(element, { duration: 1.2, offset: -80 });
          } else {
            const yOffset = -80;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 150);
      }
    }
  }, [location.pathname, location.hash]);

  // Prevent UI flicker by waiting for both Zustand hydration and backend token verification
  if (!storeHydrated || isHydrating) {
    console.log('[App Render] Blocking UI with spinner during hydration. storeHydrated:', storeHydrated, 'isHydrating:', isHydrating);
    return (
      <div className="min-h-screen bg-void flex items-center justify-center pencil-texture relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(222,214,199,0.05)_0%,transparent_80%)] z-0" />
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin z-10" />
      </div>
    );
  }

  return (
    <CursorProvider>
      <div className="noise-overlay min-h-screen bg-void text-mist">
      <CartSidebar />
      <ToastContainer />
      
      {!isAdminOrLogin && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/artworks/:id" element={<ArtworkDetail />} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/artists/:id" element={<ArtistProfile />} />
        <Route path="/commissions/request" element={<ProtectedRoute><RequestCommission /></ProtectedRoute>} />
        <Route path="/commissions/:id" element={<ProtectedRoute><CommissionDetail /></ProtectedRoute>} />
        <Route path="/exhibitions" element={<Exhibitions />} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="artworks" element={<AdminArtworks />} />

          <Route path="exhibitions" element={<AdminExhibitions />} />
          <Route path="commissions" element={<AdminCommissions />} />
        </Route>
      </Routes>
    </div>
    </CursorProvider>
  )
}
