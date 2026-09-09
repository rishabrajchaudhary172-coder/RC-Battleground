import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import PriceDisplay from '../../components/PriceDisplay';
import { Plus, Edit2, Trash2, Search, X, Check, Package, Image as ImageIcon, Upload, Layers } from 'lucide-react';

export default function AdminProducts() {
  const { token } = useAuth();
  const { usdToNpr, nprToUsd } = useCurrency();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    price_usd: '',
    price_npr: '',
    stock: '',
    seller_name: 'RC Battleground Official',
    is_featured: false,
    images: [],
    imagesText: '',
    specs: { scale: '1/10', drivetrain: '4WD', motor: 'Brushless' }
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      setProducts(prodData.products || []);
      setCategories(catData.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  useEffect(() => {
    if (editId && products.length > 0) {
      const prod = products.find(p => p.id === parseInt(editId, 10));
      if (prod) {
        handleOpenEditModal(prod);
      }
    }
  }, [editId, products]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    const defaultUsd = 299.99;
    const defaultNpr = Math.round(usdToNpr(defaultUsd));
    const initialSpecs = [
      { id: 1, key: 'scale', value: '1/10' },
      { id: 2, key: 'drivetrain', value: '4WD' },
      { id: 3, key: 'motor', value: 'Brushless' }
    ];
    setFormData({
      name: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      description: '',
      price_usd: defaultUsd.toString(),
      price_npr: defaultNpr.toString(),
      stock: '10',
      seller_name: 'RC Battleground Official',
      is_featured: false,
      images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=80'],
      imagesText: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=80',
      specEntries: initialSpecs
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    const usd = product.price_usd || product.price || 0;
    const npr = product.price_npr || Math.round(usdToNpr(usd));
    const specsObj = product.specs || { scale: '1/10', drivetrain: '4WD', motor: 'Brushless' };
    const specEntries = Object.entries(specsObj).map(([k, v], idx) => ({
      id: Date.now() + idx,
      key: k,
      value: (v || '').toString()
    }));

    setFormData({
      name: product.name,
      category_id: product.category_id || '',
      description: product.description,
      price_usd: usd.toString(),
      price_npr: npr.toString(),
      stock: product.stock.toString(),
      seller_name: product.seller_name || 'RC Battleground Official',
      is_featured: product.is_featured || false,
      images: product.images || [],
      imagesText: product.images ? product.images.join('\n') : '',
      specEntries: specEntries.length > 0 ? specEntries : [
        { id: 1, key: 'scale', value: '1/10' },
        { id: 2, key: 'drivetrain', value: '4WD' },
        { id: 3, key: 'motor', value: 'Brushless' }
      ]
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleAddSpecRow = (keyName = '', defaultValue = '') => {
    setFormData((prev) => ({
      ...prev,
      specEntries: [
        ...prev.specEntries,
        { id: Date.now() + Math.random(), key: keyName, value: defaultValue }
      ]
    }));
  };

  const handleUpdateSpecRow = (id, keyName, value) => {
    setFormData((prev) => ({
      ...prev,
      specEntries: prev.specEntries.map((row) =>
        row.id === id ? { ...row, key: keyName, value } : row
      )
    }));
  };

  const handleRemoveSpecRow = (id) => {
    setFormData((prev) => ({
      ...prev,
      specEntries: prev.specEntries.filter((row) => row.id !== id)
    }));
  };

  const handlePriceUsdChange = (val) => {
    const usd = parseFloat(val);
    if (!isNaN(usd)) {
      const npr = Math.round(usdToNpr(usd));
      setFormData(prev => ({ ...prev, price_usd: val, price_npr: npr.toString() }));
    } else {
      setFormData(prev => ({ ...prev, price_usd: val }));
    }
  };

  const handlePriceNprChange = (val) => {
    const npr = parseFloat(val);
    if (!isNaN(npr)) {
      const usd = nprToUsd(npr).toFixed(2);
      setFormData(prev => ({ ...prev, price_npr: val, price_usd: usd }));
    } else {
      setFormData(prev => ({ ...prev, price_npr: val }));
    }
  };

  const handleImageFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target.result;
        setFormData((prev) => {
          const newImages = [...prev.images, dataUrl];
          return {
            ...prev,
            images: newImages,
            imagesText: newImages.join('\n')
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: newImages,
        imagesText: newImages.join('\n')
      };
    });
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProductsAndCategories();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product');
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    // Combine images from textarea and uploaded files
    const textUrls = formData.imagesText
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const allImages = Array.from(new Set([...formData.images, ...textUrls]));
    const usdVal = parseFloat(formData.price_usd);
    const nprVal = parseFloat(formData.price_npr);

    if (isNaN(usdVal) || usdVal < 0) {
      setErrorMsg('Please enter a valid price');
      setSubmitting(false);
      return;
    }

    // Convert specEntries array into clean key-value specs object
    const specsObj = {};
    (formData.specEntries || []).forEach((row) => {
      const cleanKey = (row.key || '').trim().toLowerCase().replace(/\s+/g, '_');
      if (cleanKey && row.value.trim()) {
        specsObj[cleanKey] = row.value.trim();
      }
    });

    const payload = {
      name: formData.name,
      category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
      description: formData.description,
      price: usdVal,
      price_usd: usdVal,
      price_npr: nprVal,
      stock: parseInt(formData.stock, 10) || 0,
      seller_name: formData.seller_name,
      is_featured: formData.is_featured,
      images: allImages.length > 0 ? allImages : ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=80'],
      specs: specsObj
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setModalOpen(false);
        fetchProductsAndCategories();
      } else {
        setErrorMsg(data.error || 'Failed to save product');
      }
    } catch (err) {
      setErrorMsg('Server error saving product listing');
    } finally {
      setSubmitting(false);
    }
  };

  // Category Modal & Manager State
  const [catManagerOpen, setCatManagerOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catFormData, setCatFormData] = useState({ name: '', description: '', image_url: '' });
  const [submittingCat, setSubmittingCat] = useState(false);
  const [catErrorMsg, setCatErrorMsg] = useState('');
  const [catSuccessMsg, setCatSuccessMsg] = useState('');

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatFormData({ name: '', description: '', image_url: '' });
    setCatErrorMsg('');
    setCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCatFormData({
      name: cat.name || '',
      description: cat.description || '',
      image_url: cat.image_url || ''
    });
    setCatErrorMsg('');
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catFormData.name.trim()) return;
    setSubmittingCat(true);
    setCatErrorMsg('');

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: catFormData.name.trim(),
          description: catFormData.description.trim(),
          image_url: catFormData.image_url.trim() || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80'
        })
      });

      const data = await res.json();
      if (res.ok && data.category) {
        setCatModalOpen(false);
        setCatFormData({ name: '', description: '', image_url: '' });
        setCatSuccessMsg(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
        setTimeout(() => setCatSuccessMsg(''), 4000);
        await fetchProductsAndCategories();
        if (!editingCategory) {
          setFormData(prev => ({ ...prev, category_id: data.category.id }));
        }
      } else {
        setCatErrorMsg(data.error || 'Failed to save category');
      }
    } catch (err) {
      setCatErrorMsg('Server error saving category');
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${catId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        setCatSuccessMsg(`Category "${catName}" deleted successfully!`);
        setTimeout(() => setCatSuccessMsg(''), 4000);
        await fetchProductsAndCategories();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch (err) {
      alert('Server error deleting category');
    }
  };

  const handleCatImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setCatFormData(prev => ({ ...prev, image_url: uploadEvent.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seller_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category_name && p.category_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 font-sans">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
        <div>
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">
            PRODUCT & SELLER MANAGEMENT
          </div>
          <h1 className="text-3xl font-black uppercase text-white tracking-wide font-mono">
            RC VEHICLES INVENTORY ({products.length})
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCatManagerOpen(true)}
            className="mono-btn-secondary py-2.5 px-4 font-mono text-xs font-bold flex items-center space-x-2 border-zinc-700 text-zinc-200 hover:border-amber-500/50 hover:text-white"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>MANAGE CATEGORIES ({categories.length})</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="mono-btn-primary py-2.5 px-4 font-mono text-xs font-bold flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW RC VEHICLE</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md flex items-center">
          <input
            type="text"
            placeholder="Search by vehicle name, seller, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full mono-input pl-10 text-xs"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
          LOADING INVENTORY...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 border border-zinc-900 bg-zinc-950 text-center font-mono text-xs text-zinc-500 uppercase">
          No vehicles match search criteria.
        </div>
      ) : (
        <div className="border border-zinc-800 overflow-x-auto bg-zinc-950 font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900 text-zinc-400 uppercase text-[11px]">
                <th className="p-3.5">Image</th>
                <th className="p-3.5">Vehicle Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Seller</th>
                <th className="p-3.5">Price (NPR / USD)</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Featured</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-zinc-900/50">
                  <td className="p-3.5">
                    <img
                      src={prod.images && prod.images.length > 0 ? prod.images[0] : 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=100&q=80'}
                      alt=""
                      className="w-12 h-12 object-cover bg-zinc-900 border border-zinc-800"
                    />
                  </td>
                  <td className="p-3.5 font-bold text-white max-w-xs truncate">
                    {prod.name}
                  </td>
                  <td className="p-3.5 text-zinc-300">{prod.category_name || 'Uncategorized'}</td>
                  <td className="p-3.5 text-zinc-400">{prod.seller_name}</td>
                  <td className="p-3.5 font-bold text-white">
                    <PriceDisplay usd={prod.price_usd || prod.price} npr={prod.price_npr} size="sm" />
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 font-bold border ${prod.stock > 0 ? 'bg-zinc-900 text-white border-zinc-700' : 'bg-red-950 text-red-300 border-red-800'}`}>
                      {prod.stock}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {prod.is_featured ? (
                      <span className="bg-white text-black font-bold px-1.5 py-0.5 text-[10px]">YES</span>
                    ) : (
                      <span className="text-zinc-600">NO</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(prod)}
                      className="p-1.5 text-zinc-400 hover:text-white border border-zinc-800 bg-zinc-900"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                      className="p-1.5 text-red-400 hover:text-white border border-zinc-800 bg-zinc-900"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setModalOpen(false)} />

          <div className="relative bg-zinc-950 border border-zinc-800 text-white w-full max-w-2xl p-6 sm:p-8 shadow-2xl z-10 font-sans max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h3 className="font-mono font-bold text-base uppercase tracking-widest">
                {editingProduct ? 'EDIT RC VEHICLE LISTING' : 'ADD NEW RC VEHICLE LISTING'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 font-mono text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Vehicle Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mono-input"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-zinc-400 uppercase">Category *</label>
                    <button
                      type="button"
                      onClick={() => setCatModalOpen(true)}
                      className="text-[10px] text-zinc-300 font-bold hover:underline flex items-center space-x-1 uppercase"
                    >
                      <Plus className="w-3 h-3 text-white" />
                      <span>NEW CATEGORY</span>
                    </button>
                  </div>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full mono-input"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price in NPR & USD Dual Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Price (Rs. / NPR) *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="e.g. 39999"
                    value={formData.price_npr}
                    onChange={(e) => handlePriceNprChange(e.target.value)}
                    className="w-full mono-input border-emerald-800 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Price ($ / USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 299.99"
                    value={formData.price_usd}
                    onChange={(e) => handlePriceUsdChange(e.target.value)}
                    className="w-full mono-input"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full mono-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Seller / Brand Name</label>
                <input
                  type="text"
                  value={formData.seller_name}
                  onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                  className="w-full mono-input"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Description *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full mono-input"
                />
              </div>

              {/* Vehicle Specifications Editor */}
              <div className="space-y-3 border-t border-zinc-900 pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-zinc-400 uppercase font-bold">Vehicle Specifications</label>
                    <span className="text-[10px] text-zinc-500">Edit key-value specifications shown on product page</span>
                  </div>

                  {/* Presets Toolbar */}
                  <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                    <button type="button" onClick={() => handleAddSpecRow('scale', '1/10')} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 px-2 py-0.5 text-zinc-300 uppercase">+ Scale</button>
                    <button type="button" onClick={() => handleAddSpecRow('drivetrain', '4WD')} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 px-2 py-0.5 text-zinc-300 uppercase">+ Drivetrain</button>
                    <button type="button" onClick={() => handleAddSpecRow('motor', 'Brushless')} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 px-2 py-0.5 text-zinc-300 uppercase">+ Motor</button>
                    <button type="button" onClick={() => handleAddSpecRow('max_speed', '65+ MPH')} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 px-2 py-0.5 text-zinc-300 uppercase">+ Max Speed</button>
                    <button type="button" onClick={() => handleAddSpecRow('battery', '3S 11.1V LiPo')} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 px-2 py-0.5 text-zinc-300 uppercase">+ Battery</button>
                  </div>
                </div>

                <div className="space-y-2 bg-zinc-950 p-3 border border-zinc-900">
                  {formData.specEntries && formData.specEntries.length === 0 ? (
                    <div className="text-zinc-600 text-center py-2 text-[11px] uppercase">No vehicle specifications added yet</div>
                  ) : (
                    formData.specEntries.map((row) => (
                      <div key={row.id} className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Spec Key (e.g. scale)"
                          value={row.key}
                          onChange={(e) => handleUpdateSpecRow(row.id, e.target.value, row.value)}
                          className="w-1/3 mono-input py-1.5 text-[11px] uppercase"
                        />
                        <input
                          type="text"
                          placeholder="Spec Value (e.g. 1/10 or Brushless)"
                          value={row.value}
                          onChange={(e) => handleUpdateSpecRow(row.id, row.key, e.target.value)}
                          className="flex-1 mono-input py-1.5 text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecRow(row.id)}
                          className="p-1.5 text-red-400 hover:text-white border border-zinc-800 bg-zinc-900"
                          title="Remove Spec Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}

                  <button
                    type="button"
                    onClick={() => handleAddSpecRow('', '')}
                    className="mono-btn-secondary w-full py-1.5 text-[11px] font-bold flex items-center justify-center space-x-1 mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD CUSTOM SPECIFICATION ROW</span>
                  </button>
                </div>
              </div>

              {/* PNG / JPG File Upload and Image Previews */}
              <div className="space-y-3 border-t border-zinc-900 pt-3">
                <div className="flex justify-between items-center">
                  <label className="block text-zinc-400 uppercase">Product Images (PNG, JPG, WEBP)</label>
                  <label className="mono-btn-secondary py-1.5 px-3 text-[11px] font-bold flex items-center space-x-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>UPLOAD PNG / JPG FILES</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      multiple
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Thumbnail Previews */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-zinc-900 p-3 border border-zinc-800">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-w-1 aspect-h-1 h-16 bg-zinc-950 border border-zinc-800 overflow-hidden">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-0.5 right-0.5 p-1 bg-red-950/90 text-red-300 hover:text-white border border-red-800 text-[10px]"
                          title="Remove Image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-zinc-500 uppercase text-[10px] mb-1">Or Enter Web Image URLs (One per line)</label>
                  <textarea
                    rows={2}
                    value={formData.imagesText}
                    onChange={(e) => {
                      const text = e.target.value;
                      const urls = text.split('\n').map(u => u.trim()).filter(u => u.length > 0);
                      setFormData(prev => ({ ...prev, imagesText: text, images: urls }));
                    }}
                    placeholder="https://..."
                    className="w-full mono-input text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer uppercase text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 accent-white bg-zinc-900"
                  />
                  <span>Highlight as Featured Product on Homepage</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="mono-btn-secondary py-2.5 px-5"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="mono-btn-primary py-2.5 px-6 font-bold"
                >
                  {submitting ? 'SAVING...' : 'SAVE PRODUCT LISTING'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {catManagerOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setCatManagerOpen(false)} />

          <div className="relative bg-zinc-950 border border-zinc-800 text-white w-full max-w-3xl p-6 sm:p-8 shadow-2xl z-10 font-sans space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div>
                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                  ADMIN CONTROL PANEL
                </div>
                <h3 className="font-mono font-bold text-lg uppercase tracking-wider flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>VEHICLE CATEGORIES MANAGER</span>
                </h3>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleOpenAddCategory}
                  className="mono-btn-primary py-2 px-3 text-xs font-bold flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD CATEGORY</span>
                </button>
                <button onClick={() => setCatManagerOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {catSuccessMsg && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 font-mono text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{catSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="font-mono text-xs text-zinc-400 uppercase tracking-wider flex justify-between items-center">
                <span>ALL CATEGORIES ({categories.length})</span>
                <span className="text-[11px] text-zinc-500">Edit specs, cover images, or delete category types</span>
              </div>

              {categories.length === 0 ? (
                <div className="py-12 border border-zinc-900 bg-zinc-900/30 text-center font-mono text-xs text-zinc-500">
                  No categories found. Click "Add Category" to create one.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-4 bg-zinc-900/50 border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={cat.image_url || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=200&q=80'}
                          alt={cat.name}
                          className="w-14 h-14 object-cover bg-zinc-950 border border-zinc-800 flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-mono font-bold text-sm text-white">{cat.name}</h4>
                            <span className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold">
                              {cat.product_count ?? products.filter(p => p.category_id === cat.id || p.category_slug === cat.slug).length} Products
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                            {cat.description || 'No description provided.'}
                          </p>
                          <div className="text-[10px] font-mono text-zinc-500 mt-1">
                            Slug: <code className="text-zinc-400">{cat.slug}</code>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          className="mono-btn-secondary py-1.5 px-3 text-xs font-mono flex items-center space-x-1 border-zinc-700 text-zinc-200 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>EDIT</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="mono-btn-danger py-1.5 px-3 text-xs font-mono flex items-center space-x-1 bg-red-950/30 text-red-400 border border-red-900 hover:bg-red-900/50 hover:text-red-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>DELETE</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-900 flex justify-end">
              <button
                onClick={() => setCatManagerOpen(false)}
                className="mono-btn-secondary py-2 px-5 text-xs font-mono font-bold"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setCatModalOpen(false)} />

          <div className="relative bg-zinc-950 border border-zinc-800 text-white w-full max-w-md p-6 sm:p-8 shadow-2xl z-10 font-sans space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h3 className="font-mono font-bold text-base uppercase tracking-widest flex items-center space-x-2">
                {editingCategory ? <Edit2 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-emerald-400" />}
                <span>{editingCategory ? 'EDIT VEHICLE CATEGORY' : 'ADD NEW VEHICLE CATEGORY'}</span>
              </h3>
              <button onClick={() => setCatModalOpen(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {catErrorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 font-mono text-xs">
                {catErrorMsg}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-zinc-400 uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drag Racers or Boats & Marine"
                  value={catFormData.name}
                  onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                  className="w-full mono-input"
                />
              </div>

              <div>
                <label className="block text-zinc-400 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of this vehicle category..."
                  value={catFormData.description}
                  onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })}
                  className="w-full mono-input"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-zinc-400 uppercase">Cover Image (PNG / JPG)</label>
                  <label className="text-[10px] text-zinc-300 font-bold hover:underline cursor-pointer flex items-center space-x-1">
                    <Upload className="w-3 h-3 text-white" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleCatImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="https://..."
                  value={catFormData.image_url}
                  onChange={(e) => setCatFormData({ ...catFormData, image_url: e.target.value })}
                  className="w-full mono-input text-[11px]"
                />
                {catFormData.image_url && (
                  <div className="mt-2 h-24 bg-zinc-900 border border-zinc-800 overflow-hidden">
                    <img src={catFormData.image_url} alt="Category preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="mono-btn-secondary py-2.5 px-5"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={submittingCat}
                  className="mono-btn-primary py-2.5 px-6 font-bold uppercase"
                >
                  {submittingCat ? (editingCategory ? 'SAVING...' : 'CREATING...') : (editingCategory ? 'SAVE CHANGES' : 'CREATE CATEGORY')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
