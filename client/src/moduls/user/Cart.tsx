import React, { useEffect, useState } from 'react';
import { Trash2, Minus, Plus, Shield, Truck, RotateCcw, ArrowLeft, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface CartItem {
  id: string;
  productName: string;
  brandName: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  size?: string;
  color?: string;
}

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ─── Fetch Cart Data From API ──────────────────────────────────────────────
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching cart pipeline initialized...");
      
      const result = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/cart`,
        { withCredentials: true }
      );
      
      console.log("Database Node Stream Response:", result.data);

      const rawData = result.data?.cart || [];

      if (Array.isArray(rawData)) {
        const formattedItems = rawData.map((item: any) => {

          const nestedProduct = item.productId || item.product || {};
          
     
          const productName = item.productName || nestedProduct.productName || nestedProduct.name || "Premium Item";
          const brandName = item.brandName || nestedProduct.brandName || nestedProduct.brand || "Brand Node";
          
          
          const price = Number(item.price) || Number(nestedProduct.price) || 0;
          const stock = Number(item.stock) || Number(nestedProduct.stock) || 10;
          const quantity = Number(item.quantity) || 1;

       
          let image = item.productImage || item.image || nestedProduct.image;
          if (!image && Array.isArray(nestedProduct.images) && nestedProduct.images.length > 0) {
            image = nestedProduct.images[0];
          }
          if (!image) {
            image = 'https://picsum.photos/id/21/300/400';
          }

          return {
            // Checks cart item entry ID first, falls back to structural product schema ID
            id: item._id || item.id || nestedProduct._id || nestedProduct.id || String(Math.random()),
            productName,
            brandName,
            price,
            image,
            quantity,
            stock,
            size: item.size || nestedProduct.size || "M",
            color: item.color || nestedProduct.color || "Standard Black"
          };
        });

        console.log("Formatted Frontend App State Matrix:", formattedItems);
        setCartItems(formattedItems);
      }
    } catch (error) {
      console.error("Cart retrieval pipeline failure:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

const handleCheckout = async () => {
  try {
    console.log("Initializing checkout...");

    const result = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/checkout`,
      { price: total },
      { withCredentials: true }
    );

    if (result.data.success) {
 
      navigate("/");

    }
  } catch (error: any) {
    console.error("Checkout failed:", error);
    alert(error.response?.data?.message || "Checkout failed. Please try again.");
  }
};
  // ─── Update Quantity Inline handler ─────────────────────────────────────────
  const updateQuantity = async (id: string, targetQty: number, maxStock: number) => {
    // 1. Enforce boundaries: never less than 1, never more than max stock
    const validatedQty = Math.max(1, Math.min(maxStock, targetQty));

    // 2. Find the current item to see if anything actually changed
    const currentItem = cartItems.find(item => item.id === id);
    if (!currentItem || currentItem.quantity === validatedQty) return;

    try {
      // Optimistically update frontend UI instantly
      setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: validatedQty } : item));
      
      // Sync change to server nodes
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/cart/${id}`, 
        { quantity: validatedQty }, 
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Failed syncing quantity to server nodes:", error);
      fetchCart(); // Revert back to server data state if database pipeline breaks
    }
  };

  // ─── Remove Item handler ────────────────────────────────────────────────────
  const removeItem = async (id: string) => {
    try {
      // Optimistic layout extraction
      setCartItems(prev => prev.filter(item => item.id !== id));
      
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/cart/${id}`, 
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Failed removing item entry from schema matrix:", error);
      fetchCart(); // Revert data to match DB if update fails
    }
  };

  // ─── Layout Pricing Metrics ─────────────────────────────────────────────────
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  // ─── Conditional Rendering States ───────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-violet-500 border-zinc-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 border border-zinc-900">
        <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 mb-4 animate-bounce">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2">Your cart infrastructure is empty</h2>
        <p className="text-zinc-500 text-sm max-w-xs text-center mb-6">Looks like you haven't committed any items to your inventory tree yet.</p>
        <button 
          onClick={() => navigate('/productlist')} 
          className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all shadow-lg shadow-violet-600/20 flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 selection:bg-violet-500/30">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ─── Left Column: Items List (2/3 width) ────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Shopping Cart</h1>
              <p className="text-xs font-mono text-zinc-500 mt-0.5">MANAGING {cartItems.length} ACTIVE NODE ENTRIES</p>
            </div>
            <button 
              onClick={() => navigate(-1)} 
              className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Catalog
            </button>
          </div>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900 backdrop-blur-sm relative group hover:border-zinc-800 transition-all duration-200"
              >
                {/* Product Thumbnail image */}
                <div className="w-20 h-24 md:w-24 md:h-28 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-800">
                  <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                </div>

                {/* Details Meta layout */}
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-xxs font-bold uppercase tracking-wider text-violet-400">{item.brandName}</p>
                        <h3 className="text-sm md:text-base font-semibold text-white mt-0.5 line-clamp-1">{item.productName}</h3>
                      </div>
                      
                      {/* Trash Button */}
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Variant tags info bundle */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
                        SIZE: {item.size}
                      </span>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
                        COLOR: {item.color}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Actions & Realtime Pricing metrics */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-800 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.stock)}
                        className="w-7 h-7 rounded-md bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-zinc-800/60"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold font-mono text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.stock)}
                        className="w-7 h-7 rounded-md bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-zinc-800/60"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Price display metrics */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-zinc-500 font-mono">₹{item.price}/each</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock warning limit trigger notification */}
                {item.stock <= item.quantity && (
                  <div className="absolute -bottom-2 right-4 bg-amber-500/10 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded text-amber-400 font-medium">
                    Max Stock Limit Reached
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Right Column: Order Summary (1/3 width) ─────────────────────── */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-md flex flex-col gap-5 sticky top-6">
            <h2 className="text-lg font-bold text-white tracking-tight border-b border-zinc-800 pb-3">Order Summary</h2>
            
            {/* Invoice Line-Item Elements */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal ({cartItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span className="font-mono text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping Base Rate</span>
                <span className="font-mono text-white">
                  {shipping === 0 ? <span className="text-emerald-400 font-sans text-xs font-semibold">FREE</span> : `₹${shipping}`}
                </span>
              </div>
              
              {shipping > 0 && (
                <p className="text-[10px] text-zinc-500 font-medium bg-zinc-950/40 p-2 rounded-lg border border-zinc-900">
                  💡 Add <span className="text-violet-400 font-mono font-bold">₹{999 - subtotal}</span> more to unlock Free Shipping.
                </p>
              )}
              
              <div className="border-t border-zinc-800 pt-3 flex justify-between text-base font-bold text-white">
                <span>Total Amount</span>
                <span className="font-mono text-violet-400 text-lg">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* ─── BUY NOW / CHECKOUT CTA BUTTON ─── */}
            <button  onClick={()=>handleCheckout()} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-lg shadow-violet-600/20 active:scale-[0.99] tracking-wide mt-2">
              Proceed to Checkout
            </button>

            {/* Trust Info Footer Badges */}
            <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 pt-4 mt-2">
              {[
                { icon: Truck, label: 'Fast Delivery' },
                { icon: RotateCcw, label: '7-Day Return' },
                { icon: Shield, label: 'Secure Pay' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1">
                  <div className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                    <Icon size={12} className="text-violet-400" />
                  </div>
                  <p className="text-zinc-400 text-[9px] font-medium leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;