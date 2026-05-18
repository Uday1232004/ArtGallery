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
import AdminArtists from './pages/admin/Artists'
import AdminExhibitions from './pages/admin/Exhibitions'
import AdminCommissions from './pages/admin/Commissions'
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'

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

  return (
    <div className="noise-overlay min-h-screen bg-void text-mist">
      <Cursor />
      <CartSidebar />
      
      {!isAdminOrLogin && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/artworks/:id" element={<ArtworkDetail />} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/exhibitions" element={<Exhibitions />} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="artworks" element={<AdminArtworks />} />
          <Route path="artists" element={<AdminArtists />} />
          <Route path="exhibitions" element={<AdminExhibitions />} />
          <Route path="commissions" element={<AdminCommissions />} />
        </Route>
      </Routes>
    </div>
  )
}
