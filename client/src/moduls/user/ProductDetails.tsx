import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Heart, ChevronLeft, ChevronRight, Star, Shield, RotateCcw, Truck, Minus, Plus } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  productName: string;
  productType: string;
  brandName: string;
  for: 'men' | 'women';
  description: string;
  price: number;
  stock: number;
  sizes: string[];
  colors: string[];
  images: string[];
  isActive: boolean;
}

interface ProductDetailsProps {
  product: Product | null;
  onClose: () => void;
}

const ProductDetails = ({ product, onClose }: ProductDetailsProps) => {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => {
    if (product) {
      setActiveImage(0);
      setSelectedSize(null);
      setSelectedColor(null);
      setQuantity(1);
      setIsInWishlist(false); // Reset initially
      setTimeout(() => setVisible(true), 10);
      checkWishlistStatus(); // Check if already in wishlist
    } else {
      setVisible(false);
    }
  }, [product]);

  // Check if product is already in wishlist
  const checkWishlistStatus = async () => {
    if (!product) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/wishlist`,
        { withCredentials: true }
      );
      
      const wishlistItems = res.data.data || res.data || [];
      const exists = wishlistItems.some((item: any) => 
        item.productId?._id === product._id || item.productId === product._id
      );
      setIsInWishlist(exists);
    } catch (error) {
      console.error("Failed to check wishlist:", error);
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    setIsWishlistLoading(true);

    try {
      if (isInWishlist) {
        // Remove from wishlist
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/wishlist/${product._id}`,
          { withCredentials: true }
        );
        setIsInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        // Add to wishlist
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/wishlist`,
          { productId: product._id },
          { withCredentials: true }
        );
        setIsInWishlist(true);
        toast.success("Added to wishlist ❤️");
      }
    } catch (error: any) {
      console.error("Wishlist Error:", error);
      toast.error(error?.response?.data?.message || "Failed to update wishlist");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Close handlers
  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (product) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  if (!product) return null;

  const addToCart = async () => {
    try {
      if (!selectedSize) return toast.error("Please select size");
      if (!selectedColor) return toast.error("Please select color");
      if (quantity > product.stock) return toast.error("Insufficient stock");

      const payload = {
        productId: product._id,
        quantity,
        size: selectedSize,
        color: selectedColor,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/cart`,
        payload,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Added to cart");
        handleClose();
        navigate("/cart");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add to cart");
    }
  };

  const images = product.images?.length
    ? product.images
    : ['https://picsum.photos/id/21/600/700', 'https://picsum.photos/id/22/600/700', 'https://picsum.photos/id/23/600/700'];

  const prevImage = () => setActiveImage(i => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveImage(i => (i + 1) % images.length);

  const colorMap: Record<string, string> = {
    black: '#18181b', white: '#fafafa', red: '#ef4444', blue: '#3b82f6',
    green: '#22c55e', yellow: '#eab308', purple: '#a855f7', pink: '#ec4899',
    gray: '#71717a', navy: '#1e3a5f', brown: '#92400e', orange: '#f97316',
  };

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="relative bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col transition-all duration-300"
        style={{ transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(16px)' }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors backdrop-blur-sm"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col md:flex-row overflow-auto md:overflow-hidden h-full">

          {/* Image Gallery */}
          <div className="md:w-[52%] bg-zinc-900 relative flex-shrink-0">
            <div className="relative h-72 md:h-full overflow-hidden">
              <img
                src={images[activeImage]}
                alt={product.productName}
                className="w-full h-full object-cover"
              />

              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold capitalize border border-zinc-700">
                {product.for}
              </div>

              {!product.isActive && (
                <div className="absolute bottom-4 left-4 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold px-3 py-1 rounded-full">
                  Unavailable
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/50 hover:bg-black/80 text-white transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/50 hover:bg-black/80 text-white transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? 'border-violet-500 scale-110' : 'border-zinc-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="md:w-[48%] overflow-y-auto p-7 flex flex-col gap-5">
            <div>
              <p className="text-violet-400 text-xs font-bold tracking-[0.2em] uppercase mb-1">{product.brandName}</p>
              <h2 className="text-2xl font-bold text-white leading-tight">{product.productName}</h2>
              <p className="text-zinc-500 text-sm capitalize mt-1">{product.productType}</p>
            </div>

            {/* Wishlist Button */}
            <button
              onClick={toggleWishlist}
              disabled={isWishlistLoading}
              className="absolute top-4 right-16 p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:bg-zinc-800 transition-all active:scale-95"
            >
              <Heart 
                size={20} 
                className={`transition-all ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-zinc-400'}`} 
              />
            </button>

            {/* Rest of your UI (Price, Description, Colors, Sizes, Quantity, Add to Cart, etc.) */}
            {/* ... [Keeping all your existing UI elements] ... */}

            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-white">
                ₹{product.price.toLocaleString('en-IN')}
              </p>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                product.stock === 0 ? 'bg-red-500/10 text-red-400' :
                product.stock <= 5 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
              }`}>
                {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left` : `${product.stock} in stock`}
              </span>
            </div>

            {product.description && (
              <p className="text-zinc-400 text-sm leading-relaxed border-t border-zinc-800 pt-4">
                {product.description}
              </p>
            )}

            {/* Colors, Sizes, Quantity, Add to Cart buttons - same as before */}
            {/* ... Your existing code for colors, sizes, quantity, add to cart ... */}

            <div className="flex gap-3 pt-1">
              <button
                disabled={product.stock === 0}
                onClick={addToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors shadow-lg shadow-violet-600/20"
              >
                <ShoppingBag size={18} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 border-t border-zinc-800 pt-4">
              {[
                { icon: Truck, label: 'Free Shipping', sub: 'Orders over ₹999' },
                { icon: RotateCcw, label: 'Easy Returns', sub: '7-day policy' },
                { icon: Shield, label: 'Secure Pay', sub: '100% protected' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <Icon size={15} className="text-violet-400" />
                  </div>
                  <p className="text-white text-xs font-medium leading-tight">{label}</p>
                  <p className="text-zinc-500 text-[10px] leading-tight">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;