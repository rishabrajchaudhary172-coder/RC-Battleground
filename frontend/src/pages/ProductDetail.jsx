import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Plus, 
  Minus, 
  CheckCircle,
  MessageSquare,
  ArrowLeft,
  Edit2
} from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, refreshWishlistCount } = useCart();
  const { user, token } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Review form state
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (res.ok && data.product) {
        setProduct(data.product);
        if (data.product.images && data.product.images.length > 0) {
          setSelectedImage(data.product.images[0]);
        }
      } else {
        setProduct(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/product/${id}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {}
  };

  const checkWishlist = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const found = (data.wishlist || []).some((item) => item.product_id === parseInt(id, 10) || item.id === parseInt(id, 10));
        setIsWishlisted(found);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    checkWishlist();
  }, [id, token]);

  const handleToggleWishlist = async () => {
    if (!token) {
      alert('Please sign in to save items to your wishlist.');
      return;
    }
    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: product.id })
      });
      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.added);
        refreshWishlistCount();
      }
    } catch (err) {}
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please sign in to leave a review.');
      return;
    }
    if (!commentInput.trim()) return;

    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id,
          rating: ratingInput,
          comment: commentInput
        })
      });

      const data = await res.json();
      if (res.ok) {
        setReviewMsg('Thank you! Your review has been published.');
        setCommentInput('');
        fetchReviews();
        fetchProduct();
      } else {
        setReviewMsg(data.error || 'Failed to submit review');
      }
    } catch (err) {
      setReviewMsg('Server error submitting review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
        LOADING VEHICLE TELEMETRY...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold uppercase text-white font-mono">Vehicle Not Found</h2>
        <Link to="/catalog" className="mono-btn-secondary text-xs inline-block">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans space-y-16">
      
      {/* Breadcrumb / Back button */}
      <div>
        <Link to="/catalog" className="inline-flex items-center space-x-2 text-xs font-mono text-zinc-400 hover:text-white uppercase transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Main Product Specs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-w-4 aspect-h-3 h-[420px] bg-zinc-950 border border-zinc-800 overflow-hidden relative">
            <img
              src={selectedImage || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-black/90 text-white font-mono text-xs px-3 py-1 border border-zinc-800 uppercase">
              {product.category_name}
            </span>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 border shrink-0 bg-zinc-950 overflow-hidden ${selectedImage === img ? 'border-white ring-1 ring-white' : 'border-zinc-800 opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>LISTING BY: {product.seller_name}</span>
              <div className="flex items-center space-x-1 text-white">
                <Star className="w-4 h-4 fill-white text-white" />
                <span className="font-bold">{product.avg_rating}</span>
                <span className="text-zinc-500">({product.review_count} reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl font-black uppercase text-white tracking-wide leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center space-x-4 pt-2">
              <PriceDisplay product={product} size="lg" />
              <span className={`mono-badge ${product.stock > 0 ? 'bg-zinc-900 text-white border-zinc-700' : 'bg-red-950 text-red-300 border-red-800'}`}>
                {product.stock > 0 ? `${product.stock} IN STOCK` : 'OUT OF STOCK'}
              </span>
            </div>
          </div>

          <p className="text-zinc-300 text-sm leading-relaxed border-y border-zinc-900 py-4 font-sans">
            {product.description}
          </p>

          {/* Specifications Table */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400">Vehicle Specifications</h4>
              <div className="bg-zinc-950 border border-zinc-800 divide-y divide-zinc-900 font-mono text-xs">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between p-2.5">
                    <span className="text-zinc-500 uppercase">{key.replace('_', ' ')}</span>
                    <span className="text-white font-bold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-4 border-t border-zinc-900">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-zinc-800 bg-zinc-950">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-zinc-400 hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono text-sm px-4 font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}
                  className="px-3 py-2 text-zinc-400 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {user && user.role === 'admin' ? (
                <Link
                  to={`/admin/products?edit=${product.id}`}
                  className="flex-1 mono-btn-secondary py-3.5 text-xs font-bold flex items-center justify-center space-x-2 border-white text-white"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>EDIT PRODUCT TELEMETRY</span>
                </Link>
              ) : (
                <button
                  onClick={() => addToCart(product, quantity)}
                  disabled={product.stock <= 0}
                  className="flex-1 mono-btn-primary py-3.5 text-xs font-bold flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO SHOPPING CART</span>
                </button>
              )}

              <button
                onClick={handleToggleWishlist}
                className={`p-3.5 border transition-colors ${isWishlisted ? 'bg-white text-black border-white' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'}`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-black' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <div className="border-t border-zinc-800 pt-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
          <div>
            <h3 className="text-xl font-black uppercase text-white tracking-widest font-sans">
              RATINGS & REVIEWS ({reviews.length})
            </h3>
            <p className="text-xs font-mono text-zinc-400 mt-1">Verified driver feedback & track performance reviews</p>
          </div>

          <div className="flex items-center space-x-3 bg-zinc-950 border border-zinc-800 px-4 py-2 font-mono text-xs">
            <Star className="w-5 h-5 fill-white text-white" />
            <span className="text-xl font-bold text-white">{product.avg_rating}</span>
            <span className="text-zinc-500">/ 5.0 Rating</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Write Review Form */}
          <div className="bg-zinc-950 border border-zinc-800 p-6 space-y-4 font-mono text-xs">
            <h4 className="font-bold text-sm uppercase tracking-widest text-white flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Submit Driver Review</span>
            </h4>

            {reviewMsg && (
              <div className="p-3 bg-zinc-900 border border-zinc-700 text-white text-[11px]">
                {reviewMsg}
              </div>
            )}

            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Star Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        className={`p-1.5 border transition-colors ${ratingInput >= star ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}
                      >
                        <Star className={`w-4 h-4 ${ratingInput >= star ? 'fill-black' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 uppercase mb-1">Your Driver Review</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe handling, top speed, durability on track..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="w-full mono-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="w-full mono-btn-primary py-2.5 uppercase font-bold"
                >
                  {reviewSubmitting ? 'SUBMITTING...' : 'POST REVIEW'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3 text-zinc-400">
                <p>Sign in to submit your driver rating and review.</p>
                <Link to="/catalog" onClick={() => alert('Please click Sign In in the top right navbar.')} className="mono-btn-secondary text-[11px] inline-block">
                  SIGN IN TO REVIEW
                </Link>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12 border border-zinc-900 font-mono text-xs text-zinc-500 uppercase">
                No reviews yet for this vehicle. Be the first driver to review!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-zinc-950 border border-zinc-900 p-5 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{rev.reviewer_name}</span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-white text-white' : 'text-zinc-800'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans pt-1">
                    "{rev.comment}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
