import React, { useState, useEffect, useRef } from 'react';
import { Search, Edit3, Trash2, Plus, X, Upload, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';
import Sidebar from './Sidebar';
import { toast } from 'react-hot-toast';

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
  const [showSearch, setShowSearch] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState(blankFormState);

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let sortField = 'createdAt';
      let sortOrder = -1;
      if (sortBy === 'price-low') { sortField = 'price'; sortOrder = 1; }
      else if (sortBy === 'price-high') { sortField = 'price'; sortOrder = -1; }

      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products`, {
        params: {
          search: searchTerm, page: currentPage, limit: itemsPerPage,
          sortField, sortOrder,
          productType: selectedCategory === 'All' ? '' : selectedCategory,
          for: selectedGender === 'All' ? '' : selectedGender.toLowerCase(),
        },
        withCredentials: true,
      });

      const d = res.data;
      setProducts(d.data || d.products || []);
      const total = d.total || d.data?.length || 0;
      setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to fetch products');
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCategory, selectedGender, sortBy]);
  useEffect(() => { fetchProducts(); }, [currentPage, searchTerm, selectedCategory, selectedGender, sortBy]);

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete({ id: product._id, name: product.productName });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${productToDelete.id}`, { withCredentials: true });
      toast.success('Product deleted successfully');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setEditingProductId(null);
    setFormData(blankFormState);
    setUploadedImages([]);
    setSelectedFile(null);
    setPreviewUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode('edit');
    setEditingProductId(product._id);
    setFormData({
      productName: product.productName, productType: product.productType,
      brandName: product.brandName, for: product.for,
      description: product.description, price: product.price.toString(),
      stock: product.stock.toString(),
      sizes: product.sizes?.join(', ') || '',
      colors: product.colors?.join(', ') || '',
    });
    setUploadedImages(product.images || []);
    setSelectedFile(null);
    setPreviewUrl(product.images?.[0] || '');
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image size cannot exceed 5MB'); return; }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImagePreview = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadedImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim()) return toast.error('Product name is required');
    if (!formData.brandName.trim()) return toast.error('Brand name is required');
    if (!formData.price || Number(formData.price) <= 0) return toast.error('Please enter a valid price');
    if (!formData.stock || Number(formData.stock) < 0) return toast.error('Please enter stock level');
    if (!formData.description.trim()) return toast.error('Description is required');
    if (modalMode === 'add' && !selectedFile) return toast.error('Please upload a product image');

    try {
      setFormSubmitting(true);
      const payload = new FormData();
      payload.append('productName', formData.productName.trim());
      payload.append('productType', formData.productType);
      payload.append('brandName', formData.brandName.trim());
      payload.append('for', formData.for);
      payload.append('description', formData.description.trim());
      payload.append('price', formData.price);
      payload.append('stock', formData.stock);
      payload.append('sizes', JSON.stringify(formData.sizes.split(',').map(s => s.trim()).filter(Boolean)));
      payload.append('colors', JSON.stringify(formData.colors.split(',').map(c => c.trim()).filter(Boolean)));
      if (selectedFile) payload.append('image', selectedFile);
      else if (modalMode === 'edit' && uploadedImages.length > 0) payload.append('images', JSON.stringify(uploadedImages));

      const headers = { 'Content-Type': 'multipart/form-data' };
      if (modalMode === 'add') {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products`, payload, { headers, withCredentials: true });
        toast.success('Product added successfully!');
      } else {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${editingProductId}`, payload, { headers, withCredentials: true });
        toast.success('Product updated successfully!');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Smart page numbers
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [];
    if (currentPage <= 3) pages.push(1, 2, 3, 4, '...', totalPages);
    else if (currentPage >= totalPages - 2) pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    else pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    return pages;
  };

  const typeLabel = (t: string) => t === 'tshirt' ? 'T-Shirt' : t.charAt(0).toUpperCase() + t.slice(1);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white font-sans">
      <Sidebar />

      <div className="flex-1 min-w-0 overflow-y-auto pt-14 md:pt-0">

        {/* Header */}
        <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-30">
          <div className="px-4 sm:px-8">
            <div className="flex items-center justify-between py-4 gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xl sm:text-2xl font-bold tracking-tighter text-violet-500">Haxord</span>
                <span className="text-xs px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-400 font-mono tracking-wider">ADMIN</span>
              </div>

              {/* Desktop search */}
              <div className="hidden md:block flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 text-zinc-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* Mobile search toggle */}
              <button
                onClick={() => setShowSearch(s => !s)}
                className="md:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 transition-colors"
              >
                {showSearch ? <X size={16} /> : <Search size={16} />}
              </button>
            </div>

            {/* Mobile search bar */}
            {showSearch && (
              <div className="md:hidden pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-zinc-500" size={15} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-600"
                  />
                </div>
              </div>
            )}

            {/* Category filters — scrollable on mobile */}
            <div className="flex items-center gap-2 pb-4 overflow-x-auto scrollbar-hide border-t border-zinc-900 pt-3">
              {['All', 'shirt', 'tshirt', 'pant', 'hat', 'hoodie'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-violet-600 text-white'
                      : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400'
                  }`}
                >
                  {typeLabel(cat)}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main content */}
        <div className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-6 gap-3">
            <div>
              <h1 className="text-base sm:text-xl font-bold text-white">Products</h1>
              <p className="text-zinc-500 text-xs mt-0.5">Page {currentPage} of {totalPages}</p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium text-xs shadow-lg shadow-violet-600/10 transition-all active:scale-[0.98] shrink-0"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-zinc-900/40 rounded-xl animate-pulse border border-zinc-800/50" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-sm text-zinc-500">No products found.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 text-xs font-semibold tracking-wider uppercase font-mono">
                        <th className="py-4 px-5">Product</th>
                        <th className="py-4 px-5">Type</th>
                        <th className="py-4 px-5">Gender</th>
                        <th className="py-4 px-5 text-right">Price</th>
                        <th className="py-4 px-5 text-center">Stock</th>
                        <th className="py-4 px-5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40 text-xs text-zinc-300">
                      {products.map((product) => (
                        <tr key={product._id} className="hover:bg-zinc-900/40 transition-colors group">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                                <img src={product.images?.[0] || 'https://picsum.photos/id/20/400/400'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-zinc-100 truncate max-w-[200px]">{product.productName}</p>
                                <p className="text-[10px] text-violet-400 font-mono uppercase tracking-wider mt-0.5">{product.brandName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 capitalize font-mono text-zinc-400 text-xs">{typeLabel(product.productType)}</td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium font-mono border uppercase ${
                              product.for === 'men' ? 'bg-blue-500/5 text-blue-400 border-blue-500/10' : 'bg-pink-500/5 text-pink-400 border-pink-500/10'
                            }`}>
                              {product.for}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right font-mono font-semibold text-zinc-100">₹{product.price.toLocaleString('en-IN')}</td>
                          <td className="py-3.5 px-5 text-center">
                            <span className={`font-mono text-xs ${product.stock <= 5 ? 'text-amber-500' : 'text-zinc-400'}`}>{product.stock}</span>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => openEditModal(product)} className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors">
                                <Edit3 size={13} />
                              </button>
                              <button onClick={() => handleDeleteProduct(product)} className="p-1.5 bg-zinc-900 border border-red-950/50 text-red-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Desktop pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-800 bg-zinc-900/20 text-xs text-zinc-400 font-mono">
                    <span>Page {currentPage} of {totalPages}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 transition-all disabled:pointer-events-none">
                        <ChevronLeft size={13} /> Prev
                      </button>
                      <div className="flex gap-1">
                        {getPageNumbers().map((page, idx) =>
                          page === '...' ? (
                            <span key={`d${idx}`} className="w-8 text-center text-zinc-600">…</span>
                          ) : (
                            <button key={page} onClick={() => setCurrentPage(page as number)} className={`w-8 h-8 rounded-lg transition-all ${currentPage === page ? 'bg-violet-600 text-white font-semibold' : 'hover:bg-zinc-800'}`}>{page}</button>
                          )
                        )}
                      </div>
                      <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 transition-all disabled:pointer-events-none">
                        Next <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {products.map((product) => (
                  <div key={product._id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-3.5">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                        <img src={product.images?.[0] || 'https://picsum.photos/id/20/400/400'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-zinc-100 leading-snug truncate">{product.productName}</p>
                        <p className="text-[10px] text-violet-400 font-mono uppercase mt-0.5">{product.brandName}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-zinc-100 font-mono">₹{product.price.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{typeLabel(product.productType)}</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                            product.for === 'men' ? 'bg-blue-500/5 text-blue-400 border-blue-500/10' : 'bg-pink-500/5 text-pink-400 border-pink-500/10'
                          }`}>{product.for}</span>
                          <span className={`text-[10px] font-mono ${product.stock <= 5 ? 'text-amber-400' : 'text-zinc-500'}`}>{product.stock} units</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button onClick={() => openEditModal(product)} className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-colors">
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => handleDeleteProduct(product)} className="p-2 bg-zinc-900 border border-red-950/50 text-red-500 hover:bg-red-950/30 rounded-xl transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Mobile pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 disabled:opacity-40 transition-all">
                      <ChevronLeft size={15} />
                    </button>
                    <span className="text-xs text-zinc-400 font-mono px-2">{currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 disabled:opacity-40 transition-all">
                      <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-2xl bg-zinc-900 border border-zinc-800 sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
              <h2 className="text-sm font-bold text-zinc-100">
                {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition-all">
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">Product Name</label>
                  <input type="text" name="productName" required value={formData.productName} onChange={handleInputChange} placeholder="Enter product name..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-700" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">Brand Name</label>
                  <input type="text" name="brandName" required value={formData.brandName} onChange={handleInputChange} placeholder="e.g. HAXORD" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-700" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">Product Type</label>
                  <select name="productType" required value={formData.productType} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-300">
                    <option value="tshirt">T-Shirt</option>
                    <option value="shirt">Shirt</option>
                    <option value="pant">Pant</option>
                    <option value="hat">Hat</option>
                    <option value="hoodie">Hoodie</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">Gender</label>
                  <select name="for" required value={formData.for} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-300">
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-zinc-500 font-mono text-sm">₹</span>
                    <input type="number" name="price" required min="1" value={formData.price} onChange={handleInputChange} placeholder="999" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-8 pr-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-700" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">Stock</label>
                  <input type="number" name="stock" required min="0" value={formData.stock} onChange={handleInputChange} placeholder="100" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-700" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">Sizes (comma separated)</label>
                  <input type="text" name="sizes" value={formData.sizes} onChange={handleInputChange} placeholder="S, M, L, XL, XXL" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-700" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">Colors (comma separated)</label>
                  <input type="text" name="colors" value={formData.colors} onChange={handleInputChange} placeholder="Black, White, Navy" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-700" />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono">Description</label>
                  <textarea name="description" required rows={3} value={formData.description} onChange={handleInputChange} placeholder="Describe materials, style, fabric..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-700 resize-none" />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 font-mono block">Product Image</label>
                  {previewUrl ? (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-zinc-200 font-mono truncate">{selectedFile ? selectedFile.name : 'Existing image'}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Cloudinary URL'}</p>
                        </div>
                      </div>
                      <button type="button" onClick={removeImagePreview} className="p-2 bg-red-950/20 text-red-500 hover:bg-red-950/40 rounded-lg border border-red-950/30 transition-all shrink-0">
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="border border-dashed border-zinc-800 hover:border-violet-500/50 bg-zinc-950/40 hover:bg-zinc-950/80 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                      <div className="p-3 bg-zinc-900 group-hover:bg-violet-950/20 rounded-xl border border-zinc-800 group-hover:border-violet-500/20 text-zinc-400 group-hover:text-violet-400 transition-all">
                        <Upload size={18} />
                      </div>
                      <p className="text-xs font-medium text-zinc-400">Click to upload (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={formSubmitting} className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-medium transition-all disabled:opacity-60 disabled:pointer-events-none">
                  {formSubmitting && <Loader2 size={13} className="animate-spin" />}
                  {modalMode === 'add' ? 'Add Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-zinc-900 border border-zinc-800 sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">Delete Product</h3>
                <p className="text-xs text-zinc-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-zinc-300">
              Delete <span className="font-semibold text-violet-400">"{productToDelete.name}"</span> from inventory?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => { setIsDeleteModalOpen(false); setProductToDelete(null); }} className="px-4 py-2.5 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-medium transition-all">
                Cancel
              </button>
              <button type="button" onClick={confirmDeleteProduct} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-medium transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListing;