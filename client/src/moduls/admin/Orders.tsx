import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock } from 'lucide-react';
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`, {
        withCredentials: true,
      });
      setOrders(res.data.data || res.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleOrderStatus = async (orderId: string, currentStatus: 'placed' | 'delivered') => {
    const nextStatus = currentStatus === 'placed' ? 'delivered' : 'placed';
    try {
      setOrders(prev =>
        prev.map(order => (order._id === orderId ? { ...order, orderStatus: nextStatus } : order))
      );
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${orderId}`,
        { orderStatus: nextStatus },
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
      fetchOrders();
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      {/* Main content — offset top on mobile for the fixed nav bar in Sidebar */}
      <div className="flex-1 min-w-0 overflow-y-auto pt-14 md:pt-0">
        {/* Header */}
        <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-30">
          <div className="px-4 sm:px-8">
            <div className="flex items-center gap-2 py-4">
              <span className="text-2xl font-bold tracking-tighter text-violet-500">Haxord</span>
              <span className="text-xs px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-400 font-mono tracking-wider">
                ADMIN
              </span>
            </div>
          </div>
        </nav>

        <div className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="mb-6">
            <h1 className="text-lg sm:text-xl font-bold text-white">Orders</h1>
            <p className="text-zinc-500 text-xs mt-1">
              <span className="text-violet-400 font-mono font-medium">{orders.length}</span> total orders
            </p>
          </div>

          {loading ? (
            <div className="text-center py-32 text-zinc-600 font-mono text-xs tracking-widest animate-pulse">
              LOADING ORDERS...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-sm text-zinc-500">No orders found.</p>
            </div>
          ) : (
            <>
              {/* ── Desktop table (md+) ── */}
              <div className="hidden md:block bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 text-xs font-semibold tracking-wider uppercase font-mono">
                        <th className="py-4 px-5">Product</th>
                        <th className="py-4 px-5">Details</th>
                        <th className="py-4 px-5 text-center">Qty</th>
                        <th className="py-4 px-5 text-right">Price</th>
                        <th className="py-4 px-5 text-center">Dates</th>
                        <th className="py-4 px-5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40 text-xs text-zinc-300">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-zinc-900/40 transition-colors group">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                                <img
                                  src={order.productImage || 'https://picsum.photos/id/20/400/400'}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-zinc-100 truncate max-w-[200px]">{order.productName}</p>
                                <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[200px] mt-0.5">
                                  {order._id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 font-mono text-[11px]">
                            <div><span className="text-zinc-500">SIZE:</span> <span className="text-zinc-200 font-semibold">{order.size}</span></div>
                            <div><span className="text-zinc-500">COLOR:</span> <span className="text-zinc-400">{order.color}</span></div>
                          </td>
                          <td className="py-3.5 px-5 text-center font-mono text-zinc-400">{order.quantity}</td>
                          <td className="py-3.5 px-5 text-right font-mono">
                            <div className="font-semibold text-zinc-100">₹{order.totalPrice.toLocaleString('en-IN')}</div>
                            <div className="text-[10px] text-zinc-500">₹{order.price.toLocaleString('en-IN')} each</div>
                          </td>
                          <td className="py-3.5 px-5 text-center font-mono text-[10px] text-zinc-400">
                            <div><span className="text-zinc-600">ORDERED:</span> {new Date(order.orderedDate).toLocaleDateString('en-IN')}</div>
                            <div><span className="text-zinc-600">DELIVERY:</span> {new Date(order.deliveryDate).toLocaleDateString('en-IN')}</div>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <StatusButton order={order} onToggle={toggleOrderStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Mobile cards (< md) ── */}
              <div className="md:hidden space-y-3">
                {orders.map((order) => (
                  <div key={order._id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4">
                    {/* Top row: image + name + status */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                        <img
                          src={order.productImage || 'https://picsum.photos/id/20/400/400'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-zinc-100 leading-snug line-clamp-2">{order.productName}</p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">{order._id}</p>
                      </div>
                      <StatusButton order={order} onToggle={toggleOrderStatus} />
                    </div>

                    {/* Detail grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-mono border-t border-zinc-800 pt-3">
                      <div>
                        <span className="text-zinc-500 text-[10px]">SIZE</span>
                        <p className="text-zinc-200 font-semibold">{order.size}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px]">COLOR</span>
                        <p className="text-zinc-300">{order.color}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px]">QTY</span>
                        <p className="text-zinc-300">{order.quantity}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px]">TOTAL</span>
                        <p className="text-zinc-100 font-semibold">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px]">ORDERED</span>
                        <p className="text-zinc-400">{new Date(order.orderedDate).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px]">DELIVERY</span>
                        <p className="text-zinc-400">{new Date(order.deliveryDate).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Extracted to avoid repetition between table and card views
const StatusButton = ({
  order,
  onToggle,
}: {
  order: Order;
  onToggle: (id: string, status: 'placed' | 'delivered') => void;
}) => (
  <button
    onClick={() => onToggle(order._id, order.orderStatus)}
    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-semibold uppercase border cursor-pointer transition-all active:scale-95 whitespace-nowrap ${
      order.orderStatus === 'delivered'
        ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'
        : 'bg-amber-500/5 text-amber-400 border-amber-500/20 hover:bg-amber-500/10'
    }`}
  >
    {order.orderStatus === 'delivered' ? (
      <><CheckCircle2 size={11} /> Delivered</>
    ) : (
      <><Clock size={11} /> Placed</>
    )}
  </button>
);

export default Orders;