import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, CheckCircle2, Clock } from 'lucide-react';
import Sidebar from './Sidebar';

interface Order {
  _id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  totalPrice: number;
  orderStatus: 'placed' | 'delivered';
  orderedDate: string;
  deliveryDate: string;
  createdAt: string;
  updatedAt: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state data streams from Backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`, {
        withCredentials: true,
      });
 
      setOrders(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch transaction streams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update Status Routine (Mutates Order Node on Backend)
  const toggleOrderStatus = async (orderId: string, currentStatus: 'placed' | 'delivered') => {
    const nextStatus = currentStatus === 'placed' ? 'delivered' : 'placed';
    try {
      // Optimistic update for responsive feedback
      setOrders(prev =>
        prev.map(order => (order._id === orderId ? { ...order, orderStatus: nextStatus } : order))
      );

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${orderId}`,
        { orderStatus: nextStatus },
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Database mutation sequence failure:', error);
      fetchOrders(); // Rollback on error
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white font-sans selection:bg-violet-500/30">
      <Sidebar />

      <div className="flex-1 min-w-0 overflow-y-auto">
        {/* Navigation Branding Header */}
        <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-40">
          <div className="mx-auto px-8">
            <div className="flex items-center justify-between py-5">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold tracking-tighter text-violet-500">Haxord</span>
                <span className="text-xs px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-400 font-mono tracking-wider ml-2">ADMIN</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Core Matrix Display Panel */}
        <div className="mx-auto px-8 py-8">
          <div className="mb-8">
            <h1 className="text-xl font-bold tracking-tight text-white">Fulfillment Ledger Matrix</h1>
            <p className="text-zinc-500 text-xs mt-1">
              Connected to Pipeline Cluster — <span className="text-violet-400 font-mono font-medium">{orders.length} transaction entries logged</span>
            </p>
          </div>

          {loading ? (
            <div className="text-center py-32 text-zinc-600 font-mono text-xs tracking-widest animate-pulse">
              SYNCING WITH PIPELINE TRANSACTION LAYER...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
              <p className="text-sm text-zinc-500">Zero active document entries found matching ledger conditions.</p>
            </div>
          ) : (
            <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden backdrop-blur-sm shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 text-xxs font-semibold tracking-wider uppercase font-mono">
                      <th className="py-4 px-6">Transaction Document</th>
                      <th className="py-4 px-6">Config Details</th>
                      <th className="py-4 px-6 text-center">Qty</th>
                      <th className="py-4 px-6 text-right">Total Price Matrix</th>
                      <th className="py-4 px-6 text-center">Temporal Stamps</th>
                      <th className="py-4 px-6 text-center">Fulfillment State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40 text-xs text-zinc-300">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-zinc-900/40 transition-colors group">
                        {/* Image & Product Title metadata */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-800">
                              <img
                                src={order.productImage || 'https://picsum.photos/id/20/400/400'}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-zinc-100 truncate max-w-xs">{order.productName}</p>
                              <p className="text-xxs text-zinc-500 font-mono truncate max-w-xs mt-0.5">ID: {order._id}</p>
                            </div>
                          </div>
                        </td>

                        {/* Variants (Size / Color) */}
                        <td className="py-3.5 px-6 font-mono text-xxs tracking-wide">
                          <div className="space-y-0.5">
                            <div><span className="text-zinc-500 uppercase">SIZE:</span> <span className="text-zinc-200 font-semibold">{order.size}</span></div>
                            <div><span className="text-zinc-500 uppercase">COLOR:</span> <span className="text-zinc-400">{order.color}</span></div>
                          </div>
                        </td>

                        {/* Quantity */}
                        <td className="py-3.5 px-6 text-center font-mono font-medium text-zinc-400">
                          {order.quantity}
                        </td>

                        {/* Price Calculations */}
                        <td className="py-3.5 px-6 text-right font-mono text-zinc-100">
                          <div className="font-semibold text-xs">₹{order.totalPrice.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-zinc-500">₹{order.price.toLocaleString('en-IN')} each</div>
                        </td>

                        {/* Chrono Timeline Markers */}
                        <td className="py-3.5 px-6 text-center font-mono text-[10px] text-zinc-400">
                          <div className="space-y-0.5">
                            <div><span className="text-zinc-600">INBOUND:</span> {new Date(order.orderedDate).toLocaleDateString('en-IN')}</div>
                            <div><span className="text-zinc-600">EST_DLV:</span> {new Date(order.deliveryDate).toLocaleDateString('en-IN')}</div>
                          </div>
                        </td>

                        {/* Toggle Status Action Point */}
                        <td className="py-3.5 px-6 text-center">
                          <button
                            onClick={() => toggleOrderStatus(order._id, order.orderStatus)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xxs font-mono font-semibold uppercase border cursor-pointer transition-all active:scale-95 ${
                              order.orderStatus === 'delivered'
                                ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'
                                : 'bg-amber-500/5 text-amber-400 border-amber-500/20 hover:bg-amber-500/10'
                            }`}
                            title="Click to mutate state"
                          >
                            {order.orderStatus === 'delivered' ? (
                              <>
                                <CheckCircle2 size={12} />
                                DELIVERED
                              </>
                            ) : (
                              <>
                                <Clock size={12} />
                                PLACED
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;