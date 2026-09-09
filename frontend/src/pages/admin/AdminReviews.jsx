import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Star, Search, Trash2, CheckCircle2, AlertCircle, MessageSquare, Award } from 'lucide-react';

export default function AdminReviews() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const url = selectedRating ? `/api/reviews/all?rating=${selectedRating}` : '/api/reviews/all';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedRating, token]);

  const handleToggleFeatured = async (id) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/reviews/${id}/feature`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReviews = reviews.filter(
    (r) =>
      r.reviewer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
        <div>
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">
            CUSTOMER FEEDBACK & MODERATION
          </div>
          <h1 className="text-3xl font-black uppercase text-white tracking-wide font-mono">
            REVIEW COLLECTION ({reviews.length})
          </h1>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          <span className="text-zinc-500 uppercase">Filter Rating:</span>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-white px-3 py-2 uppercase focus:outline-none"
          >
            <option value="">ALL RATINGS</option>
            <option value="5">5 STARS ★★★★★</option>
            <option value="4">4 STARS ★★★★☆</option>
            <option value="3">3 STARS ★★★☆☆</option>
            <option value="2">2 STARS ★★☆☆☆</option>
            <option value="1">1 STAR ★☆☆☆☆</option>
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md flex items-center">
          <input
            type="text"
            placeholder="Search by reviewer, vehicle name, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full mono-input pl-10 text-xs"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
        </div>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
          FETCHING REVIEW COLLECTION...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-16 border border-zinc-900 bg-zinc-950 text-center font-mono text-xs text-zinc-500 uppercase">
          No customer reviews match search filter criteria.
        </div>
      ) : (
        <div className="border border-zinc-800 overflow-x-auto bg-zinc-950 font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900 text-zinc-400 uppercase text-[11px]">
                <th className="p-3.5">Reviewer</th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Rating</th>
                <th className="p-3.5">Review Comment</th>
                <th className="p-3.5">Featured Showcase</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredReviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-zinc-900/50">
                  <td className="p-3.5">
                    <div className="text-white font-bold">{rev.reviewer_name}</div>
                    <div className="text-[10px] text-zinc-500">{rev.reviewer_email}</div>
                  </td>
                  <td className="p-3.5 font-bold text-white max-w-xs truncate">
                    {rev.product_name}
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-white">{rev.rating}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < rev.rating ? 'fill-white text-white' : 'text-zinc-800'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-zinc-300 max-w-md line-clamp-2">
                    "{rev.comment}"
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => handleToggleFeatured(rev.id)}
                      disabled={updatingId === rev.id}
                      className={`px-2 py-1 font-bold text-[10px] uppercase border transition-colors ${
                        rev.is_featured ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {rev.is_featured ? 'FEATURED ON HOME' : 'FEATURE ON HOME'}
                    </button>
                  </td>
                  <td className="p-3.5 text-zinc-500">{new Date(rev.created_at).toLocaleDateString()}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="p-1.5 text-red-400 hover:text-white border border-zinc-800 bg-zinc-900"
                      title="Delete Review"
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
    </div>
  );
}
