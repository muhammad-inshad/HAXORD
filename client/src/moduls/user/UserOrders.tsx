import React, { useEffect, useState } from 'react';
import { Package, ArrowLeft, Eye, X, Calendar, Tag } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface PurchasedItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price?: number;
  quantity?: number;
  size?: string;
  color?: string;
  createdAt?: string;
}

const UserOrders = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<PurchasedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PurchasedItem | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/userorders`,
        { withCredentials: true }
      );

      console.log(res, "hi inshad");
      setItems(res.data.data || res.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openModal = (item: PurchasedItem) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-violet-500 border-zinc-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
        <div className="p-6 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
          <Package size={64} className="text-zinc-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
        <p className="text-zinc-500 text-center max-w-xs mb-8">
          You haven't placed any orders yet.
        </p>
        <button
          onClick={() => navigate('/productlist')}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-medium flex items-center gap-2 transition-all"
        >
          <ArrowLeft size={18} /> Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-zinc-900 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
            <p className="text-zinc-500 mt-1 font-mono text-sm">
              {items.length} ITEMS PURCHASED
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => openModal(item)}
              className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden hover:border-violet-500/30 transition-all duration-200 group cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-56 bg-zinc-950">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 text-xs font-mono rounded-full border border-zinc-700">
                  QTY: {item.quantity || 1}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-1">
                  {item.color || 'Standard'}
                </p>
                <h3 className="font-semibold text-lg leading-tight mb-3 line-clamp-2">
                  {item.productName}
                </h3>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-zinc-500">Price</p>
                    <p className="font-bold text-lg">₹{(item.price || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <button className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300">
                    <Eye size={16} /> View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== DETAIL MODAL ==================== */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-xl font-bold">Order Details</h2>
              <button
                onClick={closeModal}
                className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-auto max-h-[calc(90vh-130px)]">
              <div className="flex justify-center mb-6">
                <div className="w-72 h-72 rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl">
                  <img
                    src={selectedItem.productImage}
                    alt={selectedItem.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-violet-400 font-bold mb-1">PRODUCT NAME</p>
                  <h3 className="text-2xl font-semibold leading-tight">{selectedItem.productName}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500">PRICE</p>
                    <p className="text-xl font-bold text-white">
                      ₹{(selectedItem.price || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">QUANTITY</p>
                    <p className="text-xl font-bold">{selectedItem.quantity || 1}</p>
                  </div>
                </div>

                {(selectedItem.size || selectedItem.color) && (
                  <div className="flex gap-6">
                    {selectedItem.size && (
                      <div>
                        <p className="text-xs text-zinc-500">SIZE</p>
                        <p className="font-medium">{selectedItem.size}</p>
                      </div>
                    )}
                    {selectedItem.color && (
                      <div>
                        <p className="text-xs text-zinc-500">COLOR</p>
                        <p className="font-medium">{selectedItem.color}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedItem.createdAt && (
                  <div>
                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                      <Calendar size={14} /> PURCHASED ON
                    </p>
                    <p className="font-medium">
                      {new Date(selectedItem.createdAt).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

        
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;