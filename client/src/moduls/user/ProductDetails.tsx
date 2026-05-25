import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Heart, ChevronLeft, ChevronRight, Shield, RotateCcw, Truck, Minus, Plus } from 'lucide-react';
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

const colorMap: Record<string, string> = {
  black: '#18181b',
  white: '#fafafa',
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  pink: '#ec4899',
  gray: '#71717a',
  grey: '#71717a',
  navy: '#1e3a5f',
  brown: '#92400e',
  orange: '#f97316',
  beige: '#d4b896',
  cream: '#fffdd0',
  maroon: '#800000',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  indigo: '#6366f1',
  lime: '#84cc16',
};

const ProductDetails = ({ product, onClose }: ProductDetailsProps) => {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(0);
      setSelectedSize(null);
      setSelectedColor(null);
      setQuantity(1);
      setIsInWishlist(false);
      setTimeout(() => setVisible(true), 10);
      checkWishlistStatus();
    } else {
      setVisible(false);
    }
  }, [product]);

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
      console.error('Failed to check wishlist:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    setIsWishlistLoading(true);
    try {
      if (isInWishlist) {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/wishlist/${product._id}`,
          { withCredentials: true }
        );
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/wishlist`,
          { productId: product._id },
          { withCredentials: true }
        );
        setIsInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
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
    if (!selectedSize) return toast.error('Please select a size');
    if (!selectedColor) return toast.error('Please select a color');
    if (quantity > product.stock) return toast.error('Insufficient stock');

    setIsAddingToCart(true);
    try {
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
        toast.success('Added to cart');
        handleClose();
        navigate('/cart');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const images =
    product.images?.length
      ? product.images
      : [
          'https://picsum.photos/id/21/600/700',
          'https://picsum.photos/id/22/600/700',
          'https://picsum.photos/id/23/600/700',
        ];

  const prevImage = () => setActiveImage((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveImage((i) => (i + 1) % images.length);

  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () => setQuantity((q) => Math.min(product.stock, q + 1));

  const getColorHex = (color: string): string =>
    colorMap[color.toLowerCase()] ?? color;

  const isLightColor = (hex: string): boolean => {
    const c = hex.replace('#', '');
    if (c.length < 6) return false;
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 180;
  };

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="relative bg-zinc-950 border border-zinc-800 rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[95vh] sm:max-h-[92vh] overflow-hidden shadow-2xl flex flex-col transition-all duration-300"
        style={{
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(16px)',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors backdrop-blur-sm"
        >
          <X size={16} />
        </button>

        {/* Wishlist button */}
        <button
          onClick={toggleWishlist}
          disabled={isWishlistLoading}
          className="absolute top-3 right-12 z-20 p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
        >
          <Heart
            size={16}
            className={`transition-all ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-zinc-400'}`}
          />
        </button>

        {/* Main layout: stacked on mobile, side-by-side on md+ */}
        <div className="flex flex-col md:flex-row h-full overflow-hidden">

          {/* ── Image Gallery ── */}
          <div className="md:w-[52%] bg-zinc-900 relative flex-shrink-0 h-56 sm:h-72 md:h-auto">
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={images[activeImage]}
                alt={product.productName}
                className="w-full h-full object-cover"
              />

              {/* Gender badge */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold capitalize border border-zinc-700 text-white">
                {product.for}
              </div>

              {/* Unavailable badge */}
              {!product.isActive && (
                <div className="absolute bottom-3 left-3 bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold px-3 py-1 rounded-full">
                  Unavailable
                </div>
              )}

              {/* Prev / Next arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-xl bg-black/50 hover:bg-black/80 text-white transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-xl bg-black/50 hover:bg-black/80 text-white transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip — shown only on md+ at the bottom of the image panel */}
            {images.length > 1 && (
              <div className="hidden md:flex absolute bottom-3 left-1/2 -translate-x-1/2 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? 'border-violet-500 scale-110'
                        : 'border-zinc-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Dot indicators for mobile */}
            {images.length > 1 && (
              <div className="flex md:hidden justify-center gap-1.5 py-2 bg-zinc-900">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`rounded-full transition-all ${
                      activeImage === i
                        ? 'w-4 h-1.5 bg-violet-500'
                        : 'w-1.5 h-1.5 bg-zinc-600 hover:bg-zinc-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="md:w-[48%] overflow-y-auto p-4 sm:p-6 md:p-7 flex flex-col gap-4 md:gap-5">

            {/* Brand + Name + Type */}
            <div>
              <p className="text-violet-400 text-xs font-bold tracking-[0.2em] uppercase mb-1">
                {product.brandName}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                {product.productName}
              </h2>
              <p className="text-zinc-500 text-sm capitalize mt-1">{product.productType}</p>
            </div>

            {/* Price + Stock */}
            <div className="flex items-end justify-between">
              <p className="text-2xl sm:text-3xl font-bold text-white">
                ₹{product.price.toLocaleString('en-IN')}
              </p>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  product.stock === 0
                    ? 'bg-red-500/10 text-red-400'
                    : product.stock <= 5
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-emerald-500/10 text-emerald-400'
                }`}
              >
                {product.stock === 0
                  ? 'Out of Stock'
                  : product.stock <= 5
                  ? `Only ${product.stock} left`
                  : `${product.stock} in stock`}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-zinc-400 text-sm leading-relaxed border-t border-zinc-800 pt-4">
                {product.description}
              </p>
            )}

            {/* ── Color Selector ── */}
            {product.colors?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-zinc-300 text-sm font-semibold">Color</p>
                  {selectedColor && (
                    <span className="text-zinc-400 text-xs capitalize">{selectedColor}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color) => {
                    const hex = getColorHex(color);
                    const light = isLightColor(hex);
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        title={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all active:scale-95 ${
                          isSelected
                            ? 'border-violet-500 scale-110 shadow-lg shadow-violet-500/30'
                            : light
                            ? 'border-zinc-600 hover:border-zinc-400'
                            : 'border-zinc-700 hover:border-zinc-500'
                        }`}
                        style={{ backgroundColor: hex }}
                      >
                        {isSelected && (
                          <span
                            className={`flex items-center justify-center w-full h-full text-xs font-bold ${
                              light ? 'text-black' : 'text-white'
                            }`}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Size Selector ── */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-zinc-300 text-sm font-semibold">Size</p>
                  {selectedSize && (
                    <span className="text-violet-400 text-xs font-medium">{selectedSize} selected</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[42px] h-10 px-3 rounded-xl border text-sm font-semibold transition-all active:scale-95 ${
                        selectedSize === size
                          ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/20'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Quantity Selector ── */}
            {product.stock > 0 && (
              <div>
                <p className="text-zinc-300 text-sm font-semibold mb-2.5">Quantity</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decreaseQty}
                    disabled={quantity <= 1}
                    className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-white font-bold text-base tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQty}
                    disabled={quantity >= product.stock}
                    className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    <Plus size={14} />
                  </button>
                  <span className="text-zinc-500 text-xs">
                    Max {product.stock}
                  </span>
                </div>
              </div>
            )}

            {/* ── Validation hint ── */}
            {product.stock > 0 && (!selectedSize || !selectedColor) && (
              <div className="flex gap-2 flex-wrap">
                {!selectedColor && product.colors?.length > 0 && (
                  <span className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    Select a color
                  </span>
                )}
                {!selectedSize && product.sizes?.length > 0 && (
                  <span className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    Select a size
                  </span>
                )}
              </div>
            )}

            {/* ── Add to Cart ── */}
            <div className="flex gap-3 pt-1">
              <button
                disabled={product.stock === 0 || isAddingToCart}
                onClick={addToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors shadow-lg shadow-violet-600/20 text-sm sm:text-base"
              >
                <ShoppingBag size={17} />
                {isAddingToCart
                  ? 'Adding...'
                  : product.stock === 0
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </button>
            </div>

            {/* ── Trust Badges ── */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 border-t border-zinc-800 pt-4">
              {[
                { icon: Truck, label: 'Free Shipping', sub: 'Orders over ₹999' },
                { icon: RotateCcw, label: 'Easy Returns', sub: '7-day policy' },
                { icon: Shield, label: 'Secure Pay', sub: '100% protected' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    <Icon size={14} className="text-violet-400" />
                  </div>
                  <p className="text-white text-[11px] sm:text-xs font-medium leading-tight">{label}</p>
                  <p className="text-zinc-500 text-[9px] sm:text-[10px] leading-tight">{sub}</p>
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