import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingBag, Trash2, ArrowRight, Edit2 } from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';

export default function Wishlist() {
  const { token, user } = useAuth();
  const { addToCart, refreshWishlistCount } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!token) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistItems(data.wishlist || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  const handleRemove = async (productId) => {
    try {
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchWishlist();
        refreshWishlistCount();
      }
    } catch (err) {}
  };

  if (!token) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4 font-mono">
        <Heart className="w-12 h-12 text-zinc-600 mx-auto" />
        <h2 className="text-xl font-bold uppercase text-white">YOUR WISHLIST IS LOCKED</h2>
        <p className="text-xs text-zinc-400">Please sign in to view and save your favorite RC vehicles.</p>
        <Link to="/catalog" className="mono-btn-primary text-xs inline-block">
          EXPLORE CATALOG
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-8">
      <div className="border-b border-zinc-800 pb-6 flex items-center justify-between">
        <div>
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">SAVED TELEMETRY & GEAR</div>
          <h1 className="text-3xl font-black uppercase text-white tracking-wide">
            MY WISHLIST ({wishlistItems.length})
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center font-mono text-xs text-zinc-500 uppercase">
          LOADING WISHLIST...
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center py-20 border border-zinc-900 bg-zinc-950 space-y-4 font-mono">
          <p className="text-sm text-zinc-400 uppercase">Your wishlist is currently empty</p>
          <Link to="/catalog" className="mono-btn-secondary text-xs inline-block">
            Browse RC Vehicles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.wishlist_id || item.id} className="mono-card group flex flex-col justify-between">
              <div>
                <div className="relative aspect-w-4 aspect-h-3 h-52 bg-zinc-900 overflow-hidden border-b border-zinc-800">
                  <img
                    src={item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-3 right-3 p-2 bg-black/80 text-zinc-400 hover:text-white border border-zinc-800"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">
                    {item.category_name}
                  </div>
                  <Link to={`/product/${item.id}`} className="block">
                    <h3 className="font-bold text-xs text-white uppercase tracking-wide group-hover:underline line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-zinc-900/50 mt-2">
                <div className="font-mono text-base font-bold text-white"><PriceDisplay usd={item.price} /></div>
                {user && user.role === 'admin' ? (
                  <Link
                    to={`/admin/products?edit=${item.product_id || item.id}`}
                    className="mono-btn-secondary py-2 px-3 text-[11px] font-bold flex items-center space-x-1 border-white text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>EDIT</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => addToCart(item)}
                    className="mono-btn-primary py-2 px-3 text-[11px] font-bold flex items-center space-x-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>MOVE TO CART</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
