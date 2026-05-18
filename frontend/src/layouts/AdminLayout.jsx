import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Image, 
  Users, 
  CalendarDays, 
  MessageSquare,
  LogOut,
  Package,
  Globe
} from 'lucide-react';

export default function AdminLayout() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: Package },
    { name: 'Artworks', path: '/admin/artworks', icon: Image },
    { name: 'Artists', path: '/admin/artists', icon: Users },
    { name: 'Exhibitions', path: '/admin/exhibitions', icon: CalendarDays },
    { name: 'Commissions', path: '/admin/commissions', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex bg-void text-ivory">
      {/* Sidebar */}
      <aside className="w-64 bg-carbon border-r border-white/5 flex flex-col fixed h-full z-20">
        <div className="p-8 border-b border-white/5">
          <h2 className="font-serif text-2xl text-cream mb-1">ARTBRO SKETCHES</h2>
          <p className="font-sans text-[9px] tracking-[0.3em] text-gold uppercase">Management</p>
        </div>

        <nav className="flex-1 py-8 px-4 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/5 text-ivory border-l-2 border-gold' 
                    : 'text-mist hover:bg-white/5 hover:text-ivory border-l-2 border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-gold' : 'text-mist/70'} />
                <span className="font-sans text-xs tracking-wider uppercase">{item.name}</span>
              </Link>
            )
          })}

          <div className="h-px bg-white/5 my-4" />

          <Link
            to="/"
            className="flex items-center gap-4 px-4 py-3 rounded-md text-gold hover:bg-white/5 transition-all duration-300 border-l-2 border-transparent"
          >
            <Globe size={18} className="text-gold" />
            <span className="font-sans text-xs tracking-wider uppercase font-semibold">View Storefront</span>
          </Link>
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-serif">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-sans text-xs text-ivory">{user?.name}</p>
              <p className="font-sans text-[9px] text-mist uppercase">{user?.role}</p>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="flex items-center gap-3 text-mist hover:text-red-400 transition-colors w-full px-2"
          >
            <LogOut size={16} />
            <span className="font-sans text-xs tracking-wider uppercase">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-10 lg:p-16 relative">
        {/* Subtle grid background for the dashboard */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
