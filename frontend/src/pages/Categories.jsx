import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-muted">Loading categories...</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
      <div className="space-y-3 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-primary">Categories</h1>
        <p className="text-muted text-base leading-relaxed">
          Browse RC cars, batteries, parts, deal vehicles, and more. Each category is curated for performance and quality.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/catalog?category=${cat.slug}`}
            className="card group overflow-hidden hover:border-accent transition-all duration-300"
          >
            <div className="h-52 overflow-hidden bg-surface-hover">
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80'}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-primary uppercase tracking-wide">{cat.name}</h2>
                <span className="text-xs font-mono text-muted border border-border px-2 py-0.5">
                  {cat.product_count || 0} items
                </span>
              </div>
              <p className="text-sm text-muted line-clamp-2 leading-relaxed">{cat.description}</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent uppercase tracking-wider mt-2 group-hover:gap-2 transition-all">
                Browse <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
