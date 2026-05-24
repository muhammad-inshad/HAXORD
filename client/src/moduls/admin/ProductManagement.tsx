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
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5; // Fixed at 5

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState(blankFormState);
  
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Custom Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

      const responseData = res.data;

      // Set products
      setProducts(responseData.data || responseData.products || []);

      // Calculate total pages using backend 'total'
      const totalItems = responseData.total || responseData.data?.length || 0;
      setTotalPages(Math.max(1, Math.ceil(totalItems / itemsPerPage)));

    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to fetch products matrix from backend');
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedGender, sortBy]);

  // Fetch when page or filters change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory, selectedGender, sortBy]);

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete({ id: product._id, name: product.productName });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${productToDelete.id}`, {
        withCredentials: true 
      });
      toast.success('Product deleted successfully');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product record');
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
    setSelectedFile(null);
    setPreviewUrl(product.images?.[0] || '');
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size cannot exceed 5MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImagePreview = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productName.trim()) return toast.error('Product title is required');
    if (!formData.brandName.trim()) return toast.error('Brand designation is required');
    if (!formData.price || Number(formData.price) <= 0) return toast.error('Please input a valid price');
    if (!formData.stock || Number(formData.stock) < 0) return toast.error('Please input stock level');
    if (!formData.description.trim()) return toast.error('Product description is required');
    if (modalMode === 'add' && !selectedFile) {
      return toast.error('An image upload is required to create a cluster product');
    }

    try {
      setFormSubmitting(true);

      const formDataPayload = new FormData();
      formDataPayload.append('productName', formData.productName.trim());
      formDataPayload.append('productType', formData.productType);
      formDataPayload.append('brandName', formData.brandName.trim());
      formDataPayload.append('for', formData.for);
      formDataPayload.append('description', formData.description.trim());
      formDataPayload.append('price', formData.price);
      formDataPayload.append('stock', formData.stock);

      const sizesArray = formData.sizes.split(',').map(item => item.trim()).filter(Boolean);
      const colorsArray = formData.colors.split(',').map(item => item.trim()).filter(Boolean);

      formDataPayload.append('sizes', JSON.stringify(sizesArray));
      formDataPayload.append('colors', JSON.stringify(colorsArray));

      if (selectedFile) {
        formDataPayload.append('image', selectedFile);
      } else if (modalMode === 'edit' && uploadedImages.length > 0) {
        formDataPayload.append('images', JSON.stringify(uploadedImages));
      }

      if (modalMode === 'add') {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products`, formDataPayload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        toast.success('Product cluster record registered successfully!');
      } else {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${editingProductId}`, formDataPayload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        toast.success('Product cluster record updated successfully!');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product matrix record');
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
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/10' 
                      : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400'
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
                5 items per page — Page {currentPage} of {totalPages}
              </p>
            </div>
            
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium text-xs shadow-lg shadow-violet-600/10 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus size={16} />
              Add Cluster Record
            </button>
          </div>

          {loading ? (
            <div className="text-center py-32 text-zinc-650 font-mono text-xs tracking-widest animate-pulse">
              SYNCING WITH BACKEND STACK INFRASTRUCTURE...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
              <p className="text-sm text-zinc-500">No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden backdrop-blur-sm shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400 text-xxs font-semibold tracking-wider uppercase font-mono">
                      <th className="py-4 px-6">Product Details</th>
                      <th className="py-4 px-6">Type</th>
                      <th className="py-4 px-6">Gender</th>
                      <th className="py-4 px-6 text-right">Price</th>
                      <th className="py-4 px-6 text-center">Stock</th>
                      <th className="py-4 px-6 text-center">Actions</th>
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
                              <p className="text-xxs text-violet-400 font-mono uppercase tracking-wider mt-0.5">{product.brandName}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-6 capitalize font-mono text-zinc-400 text-xxs">
                          {product.productType === 'tshirt' ? 'T-Shirt' : product.productType}
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
                              className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              className="p-1.5 bg-zinc-900 border border-red-950/50 text-red-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-900/20 text-xs text-zinc-400 font-mono">
                  <div>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, products.length)} 
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 disabled:opacity-40 transition-all cursor-pointer disabled:pointer-events-none"
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg transition-all cursor-pointer ${
                            currentPage === page ? 'bg-violet-600 text-white font-semibold' : 'hover:bg-zinc-800'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 disabled:opacity-40 transition-all cursor-pointer disabled:pointer-events-none"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] transform transition-all duration-300 scale-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
              <div>
                <h2 className="text-base font-bold tracking-tight text-zinc-100">
                  {modalMode === 'add' ? 'Add New Product Cluster' : 'Edit Product Record'}
                </h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800/80 transition-all active:scale-95 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Product Name */}
                <div className="md:col-span-2 space-y-1.5">
                  <label htmlFor="productName" className="text-xxs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Product Name</label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    required
                    value={formData.productName}
                    onChange={handleInputChange}
                    placeholder="Enter premium product title..."
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-700"
                  />
                </div>

                {/* Brand Name */}
                <div className="space-y-1.5">
                  <label htmlFor="brandName" className="text-xxs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Brand Name</label>
                  <input
                    type="text"
                    id="brandName"
                    name="brandName"
                    required
                    value={formData.brandName}
                    onChange={handleInputChange}
                    placeholder="e.g. HAXORD"
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-700"
                  />
                </div>

                {/* Product Type */}
                <div className="space-y-1.5">
                  <label htmlFor="productType" className="text-xxs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Product Type</label>
                  <select
                    id="productType"
                    name="productType"
                    required
                    value={formData.productType}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-300 cursor-pointer"
                  >
                    <option value="tshirt">T-Shirt</option>
                    <option value="shirt">Shirt</option>
                    <option value="pant">Pant</option>
                    <option value="hat">Hat</option>
                    <option value="hoodie">Hoodie</option>
                  </select>
                </div>

                {/* Target Gender */}
                <div className="space-y-1.5">
                  <label htmlFor="for" className="text-xxs font-semibold uppercase tracking-wider text-zinc-400 font-mono">For Gender</label>
                  <select
                    id="for"
                    name="for"
                    required
                    value={formData.for}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-300 cursor-pointer"
                  >
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                  </select>
                </div>

                {/* Price (INR) */}
                <div className="space-y-1.5">
                  <label htmlFor="price" className="text-xxs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Price (INR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-zinc-500 font-mono text-sm">₹</span>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      required
                      min="1"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="999"
                      className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl py-3 pl-8 pr-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-700"
                    />
                  </div>
                </div>

                {/* Stock Units */}
                <div className="space-y-1.5">
                  <label htmlFor="stock" className="text-xxs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Stock Units</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="100"
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-700"
                  />
                </div>

                {/* Available Sizes */}
                <div className="space-y-1.5">
                  <label htmlFor="sizes" className="text-xxs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Sizes (Comma Separated)</label>
                  <input
                    type="text"
                    id="sizes"
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleInputChange}
                    placeholder="S, M, L, XL, XXL"
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-700"
                  />
                </div>

                {/* Available Colors */}
                <div className="md:col-span-2 space-y-1.5">
                  <label htmlFor="colors" className="text-xxs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Colors (Comma Separated)</label>
                  <input
                    type="text"
                    id="colors"
                    name="colors"
                    value={formData.colors}
                    onChange={handleInputChange}
                    placeholder="Black, White, Charcoal, Heather Gray"
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-700"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-1.5">
                  <label htmlFor="description" className="text-xxs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter premium description describing materials, style details, fabric blend..."
                    className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-violet-500 transition-all text-zinc-200 placeholder:text-zinc-700 resize-none"
                  />
                </div>

                {/* Image Upload Area */}
                <div className="md:col-span-2 space-y-2">
                  <span className="text-xxs font-semibold uppercase tracking-wider text-zinc-400 font-mono block">Product Imagery</span>
                  
                  {previewUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 p-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-200 font-mono truncate max-w-xs">
                            {selectedFile ? selectedFile.name : 'Existing Product Image'}
                          </p>
                          <p className="text-xxs text-zinc-550 font-mono">
                            {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Cloudinary URL'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeImagePreview}
                        className="mr-2 p-2 bg-red-950/20 text-red-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg border border-red-950/30 transition-all active:scale-95 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-zinc-800 hover:border-violet-500/50 bg-zinc-950/40 hover:bg-zinc-950/80 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 group"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="p-3 bg-zinc-900 group-hover:bg-violet-950/20 rounded-xl border border-zinc-800 group-hover:border-violet-500/20 text-zinc-400 group-hover:text-violet-400 transition-all">
                        <Upload size={18} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-zinc-350">Click to upload product image</p>
                        <p className="text-xxs text-zinc-600 mt-1 font-mono">Supports PNG, JPG, JPEG (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-850 text-white rounded-xl text-xs font-medium shadow-lg shadow-violet-600/15 transition-all active:scale-95 disabled:pointer-events-none cursor-pointer"
                >
                  {formSubmitting && <Loader2 size={14} className="animate-spin" />}
                  {modalMode === 'add' ? 'Create Record' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4 transform transition-all duration-300 scale-100">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Confirm Deletion</h3>
                <p className="text-xs text-zinc-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300">
              Are you sure you want to delete the product <span className="font-semibold text-violet-400 font-mono">"{productToDelete.name}"</span> from the master inventory collection?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                className="px-4 py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-medium shadow-lg shadow-red-600/15 transition-all active:scale-95 cursor-pointer"
              >
                Delete Cluster Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductListing;