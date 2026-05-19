import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
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
import { getLenis } from './animations/lenis'

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin()) return <Navigate to="/profile" replace />;
  
  return children;
};

export default function App() {
  const location = useLocation();
  const isAdminOrLogin = location.pathname.startsWith('/admin') || location.pathname === '/login' || location.pathname === '/signup';

  const { fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

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

  return (
    <div className="noise-overlay min-h-screen bg-void text-mist">
      <Cursor />
      <CartSidebar />
      
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
  )
}
