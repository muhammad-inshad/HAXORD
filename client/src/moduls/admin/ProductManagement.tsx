import React, { useState, useEffect, useRef } from 'react';
import { Search, Edit3, Trash2, Plus, X, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import Sidebar from './Sidebar';

interface Product {
  _id: string;
  productName: string;
  productType: 'shirt' | 'tshirt' | 'pant' | 'hat' | 'hoodie';
  brandName: string;
  for: 'men' | 'women';
  description: string;
  price: number;
  stock: number;
  sizes: string[];
  colors: string[];
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const blankFormState = {
  productName: '',
  productType: 'tshirt' as 'shirt' | 'tshirt' | 'pant' | 'hat' | 'hoodie',
  brandName: '',
  for: 'men' as 'men' | 'women',
  description: '',
  price: '',
  stock: '',
  sizes: '', 
  colors: '', 
};

const ProductListing = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State Strings
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5; // Adjusted from 50 to 10 for better viewable tracking

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState(blankFormState);
  
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state data streams from Backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      let sortField = 'createdAt';
      let sortOrder = -1;

      if (sortBy === 'price-low') {
        sortField = 'price';
        sortOrder = 1;
      } else if (sortBy === 'price-high') {
        sortField = 'price';
        sortOrder = -1;
      }

      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products`, {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: itemsPerPage,
          sortField,
          sortOrder,
          productType: selectedCategory === 'All' ? '' : selectedCategory,
          for: selectedGender === 'All' ? '' : selectedGender.toLowerCase(),
        },
        withCredentials: true,
      });

      // Backend response structures usually contain data array + pagination metadata
      if (res.data.success || res.data.data) {
        setProducts(res.data.data || []);
        // Safely check for back-end dynamic count parameters like totalPages or totalDocs
        setTotalPages(res.data.totalPages || Math.ceil((res.data.totalDocs || res.data.count || 1) / itemsPerPage) || 1);
      } else {
        setProducts(res.data || []);
      }
     
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset back to page 1 whenever search, filtering, or sorting properties mutate
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedGender, sortBy]);

  // Re-fetch dataset on lifecycle dependency changes
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory, selectedGender, sortBy]);

  // Execute true DELETE routing sequence
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to completely purge this product record?')) return;
    
    try {
      setProducts(prev => prev.filter(p => p._id !== productId));
      
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${productId}`, {
        withCredentials: true 
      });
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product node:', error);
      fetchProducts(); 
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingProductId(null);
    setFormData(blankFormState);
    setUploadedImages([]); 
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode('edit');
    setEditingProductId(product._id);
    setFormData({
      productName: product.productName,
      productType: product.productType,
      brandName: product.brandName,
      for: product.for,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      sizes: product.sizes ? product.sizes.join(', ') : '',
      colors: product.colors ? product.colors.join(', ') : '',
    });
    setUploadedImages(product.images || []); 
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedImages((prev) => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImagePreview = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormSubmitting(true);

      const processedPayload = {
        productName: formData.productName.trim(),
        productType: formData.productType,
        brandName: formData.brandName.trim(),
        for: formData.for,
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        sizes: formData.sizes.split(',').map(item => item.trim()).filter(Boolean),
        colors: formData.colors.split(',').map(item => item.trim()).filter(Boolean),
        images: uploadedImages 
      };

      if (modalMode === 'add') {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products`, processedPayload, { withCredentials: true });
      } else {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${editingProductId}`, processedPayload, { withCredentials: true });
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Database payload transmission failure:', error);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white font-sans selection:bg-violet-500/30">
      <Sidebar />

      <div className="flex-1 min-w-0 overflow-y-auto">
        <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-40">
          <div className="mx-auto px-8">
            <div className="flex items-center justify-between py-5">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold tracking-tighter text-violet-500">Haxord</span>
                <span className="text-xs px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-400 font-mono tracking-wider ml-2">ADMIN</span>
              </div>

              <div className="flex-1 max-w-xl mx-8">
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 text-zinc-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search master inventories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl py-3 pl-12 pr-5 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pb-5 flex-wrap border-t border-zinc-900 pt-4">
              {['All', 'shirt', 'tshirt', 'pant', 'hat', 'hoodie'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                    selectedCategory === cat 
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/10' 
                      : 'bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400'
                  }`}
                >
                  {cat === 'tshirt' ? 'T-Shirt' : cat}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Product Collection Matrix</h1>
              <p className="text-zinc-500 text-xs mt-1">
                Connected to Database Cluster — <span className="text-violet-400 font-mono font-medium">Page {currentPage} of {totalPages}</span>
              </p>
            </div>
            
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium text-xs shadow-lg shadow-violet-600/10 transition-all active:scale-[0.98]"
            >
              <Plus size={16} />
              Add Cluster Record
            </button>
          </div>

          {loading ? (
            <div className="text-center py-32 text-zinc-600 font-mono text-xs tracking-widest animate-pulse">
              SYNCING WITH BACKEND STACK INFRASTRUCTURE...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
              <p className="text-sm text-zinc-500">Zero active document entries found matching conditions.</p>
            </div>
          ) : (
            <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden backdrop-blur-sm shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 text-xxs font-semibold tracking-wider uppercase font-mono">
                      <th className="py-4 px-6">Identified Document details</th>
                      <th className="py-4 px-6">Product Enum</th>
                      <th className="py-4 px-6">Gender Layer</th>
                      <th className="py-4 px-6 text-right">Price Matrix</th>
                      <th className="py-4 px-6 text-center">Available Stock</th>
                      <th className="py-4 px-6 text-center">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40 text-xs text-zinc-300">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-zinc-900/40 transition-colors group">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 border border-zinc-800">
                              <img
                                src={product.images?.[0] || 'https://picsum.photos/id/20/400/400'}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-zinc-100 truncate max-w-xs">{product.productName}</p>
                              <p className="text-xxs text-violet-400 font-mono uppercase tracking-wider mt-0.5 font-semibold">{product.brandName}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-6 capitalize font-mono text-zinc-400 text-xxs">
                          {product.productType}
                        </td>

                        <td className="py-3.5 px-6">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xxs font-medium font-mono border uppercase ${
                            product.for === 'men' 
                              ? 'bg-blue-500/5 text-blue-400 border-blue-500/10' 
                              : 'bg-pink-500/5 text-pink-400 border-pink-500/10'
                          }`}>
                            {product.for}
                          </span>
                        </td>

                        <td className="py-3.5 px-6 text-right font-mono font-semibold text-zinc-100">
                          ₹{product.price.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-6 text-center">
                          <span className={`font-mono font-medium text-xs ${product.stock <= 5 ? 'text-amber-500' : 'text-zinc-400'}`}>
                            {product.stock} units
                          </span>
                        </td>

                        <td className="py-3.5 px-6">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditModal(product)}
                              className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors"
                              title="Edit Node"
                            >
                              <Edit3 size={14} />
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="p-1.5 bg-zinc-900 border border-red-950 text-red-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                              title="Delete Record Cluster"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* DOM UI Pagination Bar Matrix */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/20 text-xs text-zinc-400 font-mono">
                <div>
                  Showing page <span className="text-zinc-100 font-semibold">{currentPage}</span> of <span className="text-zinc-100 font-semibold">{totalPages}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:text-white disabled:opacity-40 disabled:hover:bg-zinc-900 disabled:hover:text-zinc-400 transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                    Prev
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-center font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-violet-600 text-white'
                            : 'hover:bg-zinc-800 border border-transparent'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:text-white disabled:opacity-40 disabled:hover:bg-zinc-900 disabled:hover:text-zinc-400 transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
              <div>
                <h2 className="text-base font-bold tracking-tight text-zinc-100">
                  {modalMode === 'add' ? 'Instantiate Database Model Node' : 'Mutation Registry Protocol'}
                </h2>
                <p className="text-xxs text-zinc-500 mt-0.5 font-mono">Collection Space ID: Product Schema Configuration</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-900/30">
              <div>
                <label className="block text-xxs font-semibold text-zinc-500 uppercase tracking-wider mb-2 font-mono">images ([String Base64 - FileReader Buffer])</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {uploadedImages.map((imgUrl, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 group">
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImagePreview(index)}
                        className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-zinc-400 hover:text-white rounded-md transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border border-dashed border-zinc-800 hover:border-violet-500/50 bg-zinc-950 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all text-zinc-500 hover:text-zinc-300"
                  >
                    <Upload size={16} />
                    <span className="text-[10px] font-mono uppercase tracking-tight">Upload local</span>
                  </div>
                </div>

                <input 
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xxs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">productName (String)</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={e => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500 text-white transition-all placeholder:text-zinc-700"
                    placeholder="Premium Overland Hoodie v2"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">brandName (String)</label>
                  <input
                    type="text"
                    required
                    value={formData.brandName}
                    onChange={e => setFormData({ ...formData, brandName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500 text-white transition-all placeholder:text-zinc-700"
                    placeholder="Haxord Labwear"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xxs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">productType (Enum / String)</label>
                  <select
                    value={formData.productType}
                    onChange={e => setFormData({ ...formData, productType: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-violet-500 text-zinc-200 transition-all cursor-pointer"
                  >
                    <option value="shirt">shirt</option>
                    <option value="tshirt">tshirt</option>
                    <option value="pant">pant</option>
                    <option value="hat">hat</option>
                    <option value="hoodie">hoodie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xxs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">for (Enum / String)</label>
                  <select
                    value={formData.for}
                    onChange={e => setFormData({ ...formData, for: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-violet-500 text-zinc-200 transition-all cursor-pointer"
                  >
                    <option value="men">men</option>
                    <option value="women">women</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xxs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">price (Number)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500 text-white transition-all font-mono"
                    placeholder="2499"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">stock (Number)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500 text-white transition-all font-mono"
                    placeholder="45"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xxs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 font-mono">description (String)</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs focus:outline-none focus:border-violet-500 text-white transition-all resize-none placeholder:text-zinc-700"
                  placeholder="Insert core item contextual information log streams..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xxs font-semibold text-zinc-500 uppercase tracking-wider font-mono">sizes ([String])</label>
                    <span className="text-xxs text-zinc-600 font-mono">comma separated</span>
                  </div>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={e => setFormData({ ...formData, sizes: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500 text-white transition-all placeholder:text-zinc-700"
                    placeholder="S, M, L, XL, XXL"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xxs font-semibold text-zinc-500 uppercase tracking-wider font-mono">colors ([String])</label>
                    <span className="text-xxs text-zinc-600 font-mono">comma separated</span>
                  </div>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={e => setFormData({ ...formData, colors: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-violet-500 text-white transition-all placeholder:text-zinc-700"
                    placeholder="JetBlack, Charcoal, Slate"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/40 text-white rounded-lg text-xs font-medium transition-all shadow-md shadow-violet-600/10"
                >
                  {formSubmitting ? 'Syncing Storage Blocks...' : modalMode === 'add' ? 'Commit Create' : 'Commit Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListing;