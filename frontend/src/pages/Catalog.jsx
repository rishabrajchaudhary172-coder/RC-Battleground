import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  Heart, 
  Star, 
  SlidersHorizontal, 
  Check, 
  ShoppingBag,
  RefreshCw,
  Edit2
} from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [maxPrice, setMaxPrice] = useState(600);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  const { addToCart, refreshWishlistCount } = useCart();
  const { token, user } = useAuth();
  const [wishlistProductIds, setWishlistProductIds] = useState(new Set());

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  // Sync state with search params if changed
  useEffect(() => {
    if (searchParams.get('category')) setSelectedCategory(searchParams.get('category'));
    if (searchParams.get('search')) setSearchQuery(searchParams.get('search'));
  }, [searchParams]);

  // Fetch wishlist ids for logged in user
  const fetchWishlistIds = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const ids = new Set((data.wishlist || []).map((item) => item.product_id || item.id));
        setWishlistProductIds(ids);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchWishlistIds();
  }, [token]);

  // Fetch Products based on current filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (maxPrice < 600) params.append('maxPrice', maxPrice);
      if (inStockOnly) params.append('inStock', 'true');
      if (sortBy) params.append('sort', sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, maxPrice, inStockOnly, sortBy]);

  const toggleWishlist = async (productId) => {
    if (!token) {
      alert('Please sign in to add items to your wishlist.');
      return;
    }

    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId })
      });
      if (res.ok) {
        fetchWishlistIds();
        refreshWishlistCount();
      }
    } catch (err) {
      console.error('Toggle wishlist error:', err);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setMaxPrice(600);
    setInStockOnly(false);
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-8">
      {/* Header Title */}
      <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">
            RC VEHICLE CATALOG & TELEMETRY
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-wide">
            EXPLORE VEHICLES ({products.length})
          </h1>
        </div>

        {/* Sort selector */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          <span className="text-zinc-500 uppercase">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-white px-3 py-2 focus:outline-none focus:border-white uppercase"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="space-y-6 lg:border-r border-zinc-900 lg:pr-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-white flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center space-x-1 uppercase underline"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase text-zinc-400">Search Vehicle</label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Model, scale, keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full mono-input pl-10 text-xs"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase text-zinc-400">Categories</label>
            <div className="space-y-1.5 font-mono text-xs">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-2 transition-colors flex justify-between items-center border ${!selectedCategory ? 'bg-white text-black font-bold border-white' : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-700'}`}
              >
                <span>ALL CATEGORIES</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-2 transition-colors flex justify-between items-center border ${selectedCategory === cat.slug ? 'bg-white text-black font-bold border-white' : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-700'}`}
                >
                  <span className="uppercase">{cat.name}</span>
                  <span className="text-[10px] font-bold">({cat.product_count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 pt-2 border-t border-zinc-900">
            <div className="flex justify-between items-center text-xs font-mono">
              <label className="uppercase text-zinc-400">Max Price</label>
              <span className="text-white font-bold">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="50"
              max="600"
              step="25"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
              className="w-full accent-white bg-zinc-900 cursor-pointer"
            />
          </div>

          {/* Stock Filter Checkbox */}
          <div className="pt-2 border-t border-zinc-900">
            <label className="flex items-center space-x-2 text-xs font-mono text-zinc-300 cursor-pointer uppercase">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-white bg-zinc-900 border-zinc-700"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="py-24 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
              LOADING TELEMETRY & INVENTORY...
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center border border-zinc-900 bg-zinc-950 space-y-4">
              <div className="font-mono text-sm uppercase text-zinc-400 font-bold">No vehicles match your search criteria</div>
              <button onClick={handleResetFilters} className="mono-btn-secondary text-xs">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const isWishlisted = wishlistProductIds.has(product.id);
                return (
                  <div key={product.id} className="mono-card group flex flex-col justify-between relative">
                    <div>
                      <div className="relative aspect-w-4 aspect-h-3 h-52 bg-zinc-900 overflow-hidden border-b border-zinc-800">
                        <img
                          src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Wishlist Button */}
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className={`absolute top-3 right-3 p-2 border transition-all ${isWishlisted ? 'bg-white text-black border-white' : 'bg-black/80 text-zinc-400 border-zinc-800 hover:text-white'}`}
                          title="Save to Wishlist"
                        >
                          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-black' : ''}`} />
                        </button>

                        <span className="absolute bottom-3 left-3 bg-zinc-950/90 text-zinc-300 font-mono text-[10px] px-2 py-0.5 border border-zinc-800 uppercase">
                          {product.category_name}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                          <span className={product.stock > 0 ? 'text-zinc-400 font-mono' : 'text-red-400 font-bold font-mono uppercase bg-red-950/80 px-1.5 py-0.5 border border-red-800'}>
                            {product.stock > 0 ? `${product.stock} IN STOCK` : 'OUT OF STOCK'}
                          </span>
                          <div className="flex items-center space-x-1 text-white">
                            <Star className="w-3 h-3 fill-white text-white" />
                            <span>{product.avg_rating} ({product.review_count})</span>
                          </div>
                        </div>

                        <Link to={`/product/${product.id}`} className="block">
                          <h3 className="font-bold text-xs text-white uppercase tracking-wide group-hover:underline line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center justify-between border-t border-zinc-900/50 mt-2">
                      <div>
                        <div className="text-[10px] font-mono text-zinc-500 uppercase">Price</div>
                        <PriceDisplay product={product} size="sm" />
                      </div>

                      {product.stock <= 0 ? (
                        <span className="py-1.5 px-2.5 text-[10px] font-bold font-mono text-red-400 bg-red-950/60 border border-red-800 uppercase tracking-wide">
                          OUT OF STOCK
                        </span>
                      ) : user && user.role === 'admin' ? (
                        <Link
                          to={`/admin/products?edit=${product.id}`}
                          className="mono-btn-secondary py-2 px-3 text-[11px] font-bold flex items-center space-x-1 border-white text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>EDIT</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => addToCart(product)}
                          className="mono-btn-primary py-2 px-3 text-[11px] font-bold flex items-center space-x-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>ADD</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
