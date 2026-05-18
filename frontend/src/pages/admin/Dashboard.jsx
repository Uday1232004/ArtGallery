import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Image, Users, CalendarDays, DollarSign, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { gsap } from '../../animations/gsap';

export default function Dashboard() {
  const gridRef = useRef(null);

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/analytics');
      return data;
    }
  });

  useEffect(() => {
    if (!isLoading && stats && gridRef.current) {
      gsap.fromTo(
        gridRef.current.querySelectorAll('.stat-card'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, [isLoading, stats]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 w-full h-full animate-pulse">
        <div className="h-10 bg-white/5 w-1/4 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-lg border border-white/5"></div>)}
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-400">Failed to load dashboard data. Please check connection.</div>;
  }

  const statCards = [
    { title: 'Total Artworks', value: stats.totalArtworks, icon: Image, prefix: '' },
    { title: 'Total Orders', value: stats.totalOrders, icon: CalendarDays, prefix: '' },
    { title: 'Total Revenue', value: stats.totalRevenue, icon: DollarSign, prefix: '$' },
    { title: 'Total Collectors', value: stats.totalUsers, icon: Users, prefix: '' },
  ];

  return (
    <div className="flex flex-col gap-10">
      
      <header>
        <h1 className="font-serif text-4xl text-cream mb-2">Dashboard Overview</h1>
        <p className="font-sans text-sm text-mist/60">Monitor your gallery performance and incoming commissions.</p>
      </header>

      {/* Analytics Grid */}
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card bg-carbon/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg relative overflow-hidden group">
            {/* Hover gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <p className="font-sans text-[10px] tracking-wider text-mist uppercase">{stat.title}</p>
              <stat.icon size={16} className="text-gold/60" />
            </div>
            <h3 className="font-serif text-3xl text-ivory relative z-10">
              {stat.prefix}{stat.value.toLocaleString()}
            </h3>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="stat-card bg-carbon/30 border border-white/5 rounded-lg overflow-hidden mt-8">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-carbon/50">
          <h2 className="font-serif text-xl text-cream">Recent Orders</h2>
          <button className="text-xs font-sans text-mist hover:text-gold flex items-center gap-2 uppercase tracking-widest transition-colors">
            View All <ArrowUpRight size={14} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-sm text-mist">
            <thead className="bg-void/50 text-[10px] uppercase tracking-wider text-mist/60 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-normal">Order ID</th>
                <th className="px-6 py-4 font-normal">Collector</th>
                <th className="px-6 py-4 font-normal">Amount</th>
                <th className="px-6 py-4 font-normal">Status</th>
                <th className="px-6 py-4 font-normal">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-mist/40">No recent orders.</td>
                </tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-ivory">#{order.id.substring(0,8)}</td>
                    <td className="px-6 py-4">{order.user.name}</td>
                    <td className="px-6 py-4 text-gold font-medium">${order.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[9px] uppercase tracking-wider rounded-sm ${
                        order.status === 'PENDING' ? 'bg-orange-500/20 text-orange-400' :
                        order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'SHIPPED' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-mist/60">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
