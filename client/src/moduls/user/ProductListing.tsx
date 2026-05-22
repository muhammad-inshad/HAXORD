import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Moon, Sun, LogOut, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';
import axios from 'axios';
import ProductDetails from './ProductDetails';
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

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Address Form State
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

  // Handle Logout
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
    setAddressForm({
      fullName: '',
      phone: '',
      houseName: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    });
    setAddressModal(true);
  };

  const closeAddressModal = () => setAddressModal(false);

  // Add New Address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/address`,
        addressForm,
        { withCredentials: true }
      );
      toast.success('Address added successfully!');
      closeAddressModal();
    } catch (error: any) {
      console.error('Failed to add address:', error);
      toast.error(error.response?.data?.message || 'Failed to add address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: value }));
  };

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Products with Pagination
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/products`, {
          params: {
            page: currentPage,
            limit: 5,                    // ← Limit set to 5
            productType: selectedCategory === 'All' ? undefined : mapCategoryToBackend(selectedCategory),
            for: selectedGender === 'All' ? undefined : selectedGender.toLowerCase(),
          },
          withCredentials: true,
        });

        setProducts(res.data.data || []);
        setTotalProducts(res.data.total || 0);
        setTotalPages(Math.ceil((res.data.total || 0) / 5)); // Calculate total pages
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedGender, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedGender]);

  const mapCategoryToBackend = (category: string): string => {
    const map: { [key: string]: string } = {
      'T-Shirts': 'tshirt',
      'Shirts': 'shirt',
      'Pants': 'pant',
      'Hats': 'hat',
      'Hoodies': 'hoodie',
    };
    return map[category] || category.toLowerCase();
  };

  const goToCart = () => navigate("/cart");

  // Filter & Sort (Client-side - only on current page data)
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brandName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  // Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Pagination Handlers
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar - Same as before */}
      <nav className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold tracking-tighter text-violet-500">Haxord</span>
            </div>

            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-zinc-500" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl py-3 pl-12 pr-5 text-sm focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button onClick={() => setDarkMode(!darkMode)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-900 hover:bg-zinc-800 transition-colors">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button onClick={goToCart} className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-zinc-900 hover:bg-zinc-800 transition-colors">
                <ShoppingBag size={20} />
              </button>

              <div className="relative" ref={profileRef}>
                <div className="w-9 h-9 rounded-2xl overflow-hidden border border-zinc-700 cursor-pointer" onClick={() => setShowProfileModal(!showProfileModal)}>
                  <img src="https://i.pravatar.cc/128?u=muhammad" alt="Profile" className="w-full h-full object-cover" />
                </div>

                {showProfileModal && (
                  <div className="absolute right-0 mt-3 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl z-50 p-4">
                    <div className="flex flex-col items-center mb-4 border-b border-zinc-800 pb-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden mb-3 border border-zinc-700">
                        <img src="https://i.pravatar.cc/128?u=muhammad" alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <h4 className="text-white font-semibold">My Profile</h4>
                    </div>

                    <button onClick={openAddressModal} className="w-full text-left px-4 py-3 hover:bg-zinc-800 rounded-xl text-sm mb-1">
                      ➕ Add Address
                    </button>

                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-sm py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors mt-2">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Categories & Filters */}
          <div className="flex items-center gap-3 pb-6 flex-wrap">
            {['All', 'T-Shirts', 'Shirts', 'Pants', 'Hats', 'Hoodies'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-3xl text-sm font-medium transition-all ${
                  selectedCategory === cat ? 'bg-violet-600 text-white' : 'bg-zinc-900 hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-3xl px-4 py-2 text-sm">
                <span className="text-zinc-400">For</span>
                <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-3xl px-4 py-2 text-sm focus:outline-none">
                  <option value="All">All</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                </select>
              </div>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-3xl px-4 py-2 text-sm focus:outline-none">
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Address Modal - Unchanged */}
      {addressModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
          {/* ... Address Modal Content (same as before) ... */}
          <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-700 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
              <h2 className="text-2xl font-semibold">Add New Address</h2>
              <button onClick={closeAddressModal} className="text-zinc-400 hover:text-white transition-colors">
                <X size={26} />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="p-6 space-y-5">
              {/* Form fields remain the same */}
              {/* ... (copy from your previous code) ... */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Full Name</label>
                  <input type="text" name="fullName" value={addressForm.fullName} onChange={handleInputChange} required className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Phone Number</label>
                  <input type="tel" name="phone" value={addressForm.phone} onChange={handleInputChange} required className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-violet-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">House Name / Address Line</label>
                <input type="text" name="houseName" value={addressForm.houseName} onChange={handleInputChange} required className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-violet-500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">City</label>
                  <input type="text" name="city" value={addressForm.city} onChange={handleInputChange} required className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">State</label>
                  <input type="text" name="state" value={addressForm.state} onChange={handleInputChange} required className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-violet-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Pincode</label>
                  <input type="text" name="pincode" value={addressForm.pincode} onChange={handleInputChange} required className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Country</label>
                  <select name="country" value={addressForm.country} onChange={handleInputChange} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-violet-500">
                    <option value="India">India</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={closeAddressModal} className="flex-1 py-3.5 rounded-2xl border border-zinc-700 hover:bg-zinc-800">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3.5 bg-violet-600 hover:bg-violet-700 rounded-2xl font-medium disabled:opacity-70">
                  {submitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <p className="text-zinc-400 mb-6">
          Showing <span className="text-white font-medium">{filteredProducts.length}</span> of {totalProducts} products
        </p>

        {loading ? (
          <div className="text-center py-20 text-zinc-400">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => setSelectedProduct(product)}
                className="group bg-zinc-900 rounded-3xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="relative">
                  <img src={product.images?.[0] || 'https://picsum.photos/id/20/400/400'} alt={product.productName} className="w-full h-80 object-cover" />
                  <div className="absolute top-3 right-3 bg-black/70 px-3 py-1 rounded-full text-xs font-medium capitalize">{product.for}</div>
                </div>
                <div className="p-5">
                  <p className="text-violet-400 text-sm font-semibold tracking-widest">{product.brandName}</p>
                  <h3 className="font-medium mt-1 mb-2 line-clamp-2">{product.productName}</h3>
                  <p className="text-2xl font-semibold">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 rounded-2xl transition-colors"
            >
              <ChevronLeft size={18} /> Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-10 h-10 rounded-2xl font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-violet-600 text-white'
                      : 'bg-zinc-900 hover:bg-zinc-800'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-5 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 rounded-2xl transition-colors"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-zinc-400">No products found</p>
          </div>
        )}
      </div>

      <ProductDetails product={selectedProduct} onClose={() => setSelectedProduct(null)} />

      {/* Footer */}
      <footer className="bg-black py-16 border-t border-zinc-800 mt-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <span className="text-3xl font-bold text-violet-500">Haxord</span>
            <p className="mt-3 text-zinc-400 text-sm">Modern fashion for every mood, season, and story.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">SHOP</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>Men</li><li>Women</li><li>Kids</li><li>Sale</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">HELP</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>Orders</li><li>Returns</li><li>Sizing Guide</li><li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">COMPANY</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>About</li><li>Careers</li><li>Privacy</li><li>Terms</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductListing;