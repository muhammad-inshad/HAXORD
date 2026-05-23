import { useEffect, useState } from 'react';
import { Heart, Trash2, ArrowLeft, ShoppingCart, PackageCheck, PackageX } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FRONTEND_URL } from '../../constance/frontend/url';

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface Product {
  _id: string;
  productName: string;
  brandName: string;
  price: number;
  images: string[];
  stock: number;
  isActive: boolean;
  description: string;
  productType: string;
  for: string;
}

interface WishlistItem {
  _id: string;
  userId: string;
  productId: Product;
  createdAt: string;
}

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // ─── Fetch Wishlist Data From API ───────────────────────────────────────────
  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const result = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/wishlist`,
        { withCredentials: true }
      );

      if (result.data?.success && Array.isArray(result.data.data)) {
        setWishlistItems(result.data.data);
      }
    } catch (error) {
      console.error("Wishlist retrieval failed:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // ─── Remove Item Handler ────────────────────────────────────────────────────
  const removeFromWishlist = async (productId: string) => {
    const previousItems = [...wishlistItems];
    try {
      setRemovingId(productId);
      // Optimistic removal
      setWishlistItems(prev => prev.filter(item => item.productId._id !== productId));

      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/wishlist/${productId}`,
        { withCredentials: true }
      );

      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Failed to remove wishlist item:", error);
      setWishlistItems(previousItems);
      toast.error("Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  // ─── Get Stock Badge ────────────────────────────────────────────────────────
  const getStockBadge = (stock: number, isActive: boolean) => {
    if (!isActive) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
          <PackageX size={10} /> UNAVAILABLE
        </span>
      );
    }
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
          <PackageX size={10} /> OUT OF STOCK
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <PackageCheck size={10} /> ONLY {stock} LEFT
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
        <PackageCheck size={10} /> IN STOCK
      </span>
    );
  };

  // ─── Loading State ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-violet-500 border-zinc-800 rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Empty State ────────────────────────────────────────────────────────────
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 border border-zinc-900">
        <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 mb-4 animate-bounce">
          <Heart size={40} />
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2">Your wishlist is empty</h2>
        <p className="text-zinc-500 text-sm max-w-xs text-center mb-6">You haven't saved any items to your wishlist yet. Start exploring and save what you love.</p>
        <button
          onClick={() => navigate(FRONTEND_URL.PRODUCT_LIST)}
          className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all shadow-lg shadow-violet-600/20 flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Explore Products
        </button>
      </div>
    );
  }

  // ─── Main Wishlist View ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 selection:bg-violet-500/30">
      <div className="max-w-6xl mx-auto">

        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Wishlist</h1>
            <p className="text-xs font-mono text-zinc-500 mt-0.5">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'ITEM' : 'ITEMS'} SAVED
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        {/* ─── Wishlist Grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlistItems.map((item) => {
            const product = item.productId;
            const image =
              product.images && product.images.length > 0
                ? product.images[0]
                : 'https://picsum.photos/id/21/300/400';

            return (
              <div
                key={item._id}
                className="group rounded-2xl bg-zinc-900/40 border border-zinc-900 backdrop-blur-sm overflow-hidden hover:border-zinc-700 hover:scale-[1.02] transition-all duration-300"
              >
                {/* Product Image */}
                <div className="relative w-full h-56 overflow-hidden bg-zinc-900">
                  <img
                    src={image}
                    alt={product.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Remove Button Overlay */}
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    disabled={removingId === product._id}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-zinc-950/70 backdrop-blur-sm border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3">
                  {/* Brand & Name */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-violet-400 font-mono">
                      {product.brandName}
                    </p>
                    <h3 className="text-sm font-semibold text-white mt-0.5 line-clamp-1">
                      {product.productName}
                    </h3>
                  </div>

                  {/* Price & Stock */}
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-white font-mono">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                    {getStockBadge(product.stock, product.isActive)}
                  </div>

                  {/* Product Type Tag */}
                  <div className="flex flex-wrap gap-1.5">
                    {product.productType && (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {product.productType.toUpperCase()}
                      </span>
                    )}
                    {product.for && (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {product.for.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => navigate(FRONTEND_URL.PRODUCT_LIST)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-600/20 active:scale-[0.98] tracking-wide"
                  >
                    <ShoppingCart size={15} /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Wishlist;
