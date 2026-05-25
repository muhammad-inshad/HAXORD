import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Moon, Sun, LogOut, X, ChevronLeft, ChevronRight, Heart, Menu } from 'lucide-react';
import { useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';
import axios from 'axios';
import ProductDetails from './ProductDetails';
import toast from 'react-hot-toast';
import { FRONTEND_URL } from '../../constance/frontend/url';

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

interface Address {
  fullName: string;
  phone: string;
  houseName: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const ProductListing = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [addressModal, setAddressModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [addressForm, setAddressForm] = useState<Address>({
    fullName: '',
    phone: '',
    houseName: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [submitting, setSubmitting] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('user');
    dispatch(logout());
    navigate('/');
  };

  const openAddressModal = () => {
    setAddressForm({ fullName: '', phone: '', houseName: '', city: '', state: '', pincode: '', country: 'India' });
    setAddressModal(true);
    setShowProfileModal(false);
  };

  const closeAddressModal = () => setAddressModal(false);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/address`, addressForm, { withCredentials: true });
      toast.success('Address added successfully!');
      closeAddressModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/products`, {
          params: {
            page: currentPage,
            limit: 8,
            productType: selectedCategory === 'All' ? undefined : mapCategoryToBackend(selectedCategory),
            for: selectedGender === 'All' ? undefined : selectedGender.toLowerCase(),
          },
          withCredentials: true,
        });
        setProducts(res.data.data || []);
        setTotalProducts(res.data.total || 0);
        setTotalPages(Math.ceil((res.data.total || 0) / 8));
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, selectedGender, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedGender]);

  const mapCategoryToBackend = (category: string): string => {
    const map: { [key: string]: string } = {
      'T-Shirts': 'tshirt', 'Shirts': 'shirt', 'Pants': 'pant', 'Hats': 'hat', 'Hoodies': 'hoodie',
    };
    return map[category] || category.toLowerCase();
  };

  const goToCart = () => navigate('/cart');
  const orderpage = () => { navigate(FRONTEND_URL.USERORDER); setShowProfileModal(false); };
  const wishlist = () => { navigate(FRONTEND_URL.WISHLIST); setShowProfileModal(false); };

  const filteredProducts = products
    .filter(p =>
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brandName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build visible page numbers (max 5 shown)
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <span className="text-2xl sm:text-4xl font-bold tracking-tighter text-violet-500 shrink-0">Haxord</span>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-xl mx-6 lg:mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-zinc-500" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl py-3 pl-11 pr-5 text-sm focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile search toggle */}
              <button
                onClick={() => setShowSearch(s => !s)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors"
              >
                {showSearch ? <X size={18} /> : <Search size={18} />}
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                onClick={goToCart}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors"
              >
                <ShoppingBag size={18} />
              </button>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <div
                  className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-700 cursor-pointer"
                  onClick={() => setShowProfileModal(!showProfileModal)}
                >
                  <img src="https://i.pravatar.cc/128?u=muhammad" alt="Profile" className="w-full h-full object-cover" />
                </div>

                {showProfileModal && (
                  <div className="absolute right-0 mt-3 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl z-50 p-3">
                    <div className="flex flex-col items-center mb-3 border-b border-zinc-800 pb-3">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden mb-2 border border-zinc-700">
                        <img src="https://i.pravatar.cc/128?u=muhammad" alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-white font-semibold text-sm">My Profile</h4>
                    </div>
                    <button onClick={orderpage} className="w-full flex items-center gap-2 text-left px-3 py-2.5 hover:bg-zinc-800 rounded-xl text-sm mb-1">
                      <ShoppingBag size={16} /> My Orders
                    </button>
                    <button onClick={wishlist} className="w-full flex items-center gap-2 text-left px-3 py-2.5 hover:bg-zinc-800 rounded-xl text-sm mb-1">
                      <Heart size={16} /> Wishlist
                    </button>
                    <button onClick={openAddressModal} className="w-full text-left px-3 py-2.5 hover:bg-zinc-800 rounded-xl text-sm mb-1">
                      ➕ Add Address
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-sm py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors mt-1">
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showSearch && (
            <div className="md:hidden pb-3">
              <div className="relative">
                <Search className="absolute left-4 top-3 text-zinc-500" size={16} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Categories & Filters */}
          <div className="pb-4">
            {/* Category pills — scrollable on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide">
              {['All', 'T-Shirts', 'Shirts', 'Pants', 'Hats', 'Hoodies'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                    selectedCategory === cat ? 'bg-violet-600 text-white' : 'bg-zinc-900 hover:bg-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Filters row */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-400 text-sm">For</span>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-full px-3 py-1.5 text-sm focus:outline-none"
                >
                  <option value="All">All</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-full px-3 py-1.5 text-sm focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Address Modal */}
      {addressModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-700 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-zinc-800">
              <h2 className="text-xl font-semibold">Add New Address</h2>
              <button onClick={closeAddressModal} className="text-zinc-400 hover:text-white transition-colors">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleAddAddress} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Full Name</label>
                  <input type="text" name="fullName" value={addressForm.fullName} onChange={handleInputChange} required className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Phone Number</label>
                  <input type="tel" name="phone" value={addressForm.phone} onChange={handleInputChange} required className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">House Name / Address</label>
                <input type="text" name="houseName" value={addressForm.houseName} onChange={handleInputChange} required className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">City</label>
                  <input type="text" name="city" value={addressForm.city} onChange={handleInputChange} required className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">State</label>
                  <input type="text" name="state" value={addressForm.state} onChange={handleInputChange} required className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Pincode</label>
                  <input type="text" name="pincode" value={addressForm.pincode} onChange={handleInputChange} required className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Country</label>
                  <select name="country" value={addressForm.country} onChange={handleInputChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500">
                    <option value="India">India</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeAddressModal} className="flex-1 py-3 rounded-2xl border border-zinc-700 hover:bg-zinc-800 text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 rounded-2xl font-medium text-sm disabled:opacity-70 transition-colors">
                  {submitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <p className="text-zinc-400 text-sm mb-5">
          Showing <span className="text-white font-medium">{filteredProducts.length}</span> of {totalProducts} products
        </p>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded-2xl sm:rounded-3xl overflow-hidden animate-pulse">
                <div className="w-full h-48 sm:h-72 bg-zinc-800" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-5 bg-zinc-800 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-zinc-400">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => setSelectedProduct(product)}
                className="group bg-zinc-900 rounded-2xl sm:rounded-3xl overflow-hidden hover:scale-[1.03] transition-all duration-300 cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={product.images?.[0] || 'https://picsum.photos/id/20/400/400'}
                    alt={product.productName}
                    className="w-full h-44 sm:h-72 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 px-2 py-0.5 rounded-full text-xs font-medium capitalize">
                    {product.for}
                  </div>
                </div>
                <div className="p-3 sm:p-5">
                  <p className="text-violet-400 text-xs font-semibold tracking-widest truncate">{product.brandName}</p>
                  <h3 className="font-medium mt-1 mb-1.5 text-sm sm:text-base line-clamp-2 leading-snug">{product.productName}</h3>
                  <p className="text-lg sm:text-2xl font-semibold">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-10">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 rounded-xl text-sm transition-colors"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Prev</span>
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span key={`dots-${idx}`} className="w-8 text-center text-zinc-500 text-sm">…</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page as number)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-sm font-medium transition-colors ${
                      currentPage === page ? 'bg-violet-600 text-white' : 'bg-zinc-900 hover:bg-zinc-800'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 rounded-xl text-sm transition-colors"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <ProductDetails product={selectedProduct} onClose={() => setSelectedProduct(null)} />

      {/* Footer */}
      <footer className="bg-black py-10 sm:py-16 border-t border-zinc-800 mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl sm:text-3xl font-bold text-violet-500">Haxord</span>
            <p className="mt-2 text-zinc-400 text-sm">Modern fashion for every mood, season, and story.</p>
          </div>
          {[
            { title: 'SHOP', links: ['Men', 'Women', 'Kids', 'Sale'] },
            { title: 'HELP', links: ['Orders', 'Returns', 'Sizing Guide', 'Contact'] },
            { title: 'COMPANY', links: ['About', 'Careers', 'Privacy', 'Terms'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-semibold mb-3 text-sm">{title}</h4>
              <ul className="space-y-1.5 text-sm text-zinc-400">
                {links.map(l => <li key={l}>{l}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default ProductListing;