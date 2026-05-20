import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export default function Orders() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders');
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.put(`/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    }
  });

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-white/5 rounded-lg"></div>;
  }

  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="font-serif text-4xl text-cream mb-2">Order Management</h1>
        <p className="font-sans text-sm text-mist/60">Track and fulfill collector acquisitions.</p>
      </header>

      <div className="flex gap-2 border-b border-white/5 pb-4">
        {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`py-2 px-4 rounded text-xs font-sans uppercase tracking-wider transition-all duration-300 ${
              filter === status ? 'bg-gold/10 text-gold border border-gold/20' : 'text-mist/60 hover:text-cream border border-transparent'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-carbon/20 border border-white/5 rounded-lg overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-20 text-center text-mist/40 font-sans">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-carbon/40 font-sans text-[10px] tracking-wider text-mist/60 uppercase">
                  <th className="p-5">Order ID / Date</th>
                  <th className="p-5">Collector</th>
                  <th className="p-5">Items</th>
                  <th className="p-5">Total</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans text-sm text-mist/85">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="font-medium text-ivory">#{order.id.substring(0, 8)}</span>
                        <span className="text-xs text-mist/50 mt-1">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-ivory">{order.user.name}</span>
                        <span className="text-xs text-mist/50 mt-1">{order.user.email}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1 text-xs">
                        {order.items.map(item => (
                          <div key={item.id} className="flex items-center gap-2">
                            <span className="text-gold">{item.quantity}x</span>
                            <span className="truncate max-w-[150px]">{item.artwork.title}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-5 text-gold font-medium">${order.total?.toLocaleString()}</td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider rounded border ${
                        order.status === 'PENDING' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        'bg-white/5 text-mist border-white/10'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                        disabled={updateStatusMutation.isLoading}
                        className="bg-void/50 border border-white/10 rounded px-3 py-2 font-sans text-xs text-ivory focus:border-gold/50 outline-none transition-colors ml-auto"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
