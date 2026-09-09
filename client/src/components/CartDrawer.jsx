import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import PriceDisplay from './PriceDisplay';

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQuantity, removeFromCart, cartTotal, cartItemCount } = useCart();
  const navigate = useNavigate();

  if (!cartOpen) return null;

  const handleCheckoutClick = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={() => setCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-800 text-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-white" />
              <h2 className="font-mono font-bold text-sm uppercase tracking-widest">
                Shopping Cart ({cartItemCount})
              </h2>
            </div>
            <button 
              onClick={() => setCartOpen(false)}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-mono text-xs uppercase text-zinc-400">Your cart is currently empty</p>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    navigate('/catalog');
                  }}
                  className="mono-btn-secondary text-xs"
                >
                  Explore RC Vehicles
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product_id} className="flex space-x-4 border-b border-zinc-900 pb-4">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=200&q=80'}
                    alt={item.name}
                    className="w-20 h-20 object-cover bg-zinc-900 border border-zinc-800 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-xs line-clamp-2 uppercase font-sans tracking-wide">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-zinc-500 hover:text-white transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-mono text-xs text-zinc-400 mt-1">
                        <PriceDisplay usd={item.price} size="sm" showSecondary={false} />
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center border border-zinc-800 bg-zinc-900">
                        <button
                          onClick={() => updateQuantity(item.product_id, -1)}
                          className="px-2 py-1 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs px-2.5 font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, 1)}
                          className="px-2 py-1 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="font-mono font-bold text-xs text-white">
                        <PriceDisplay usd={item.price * item.quantity} size="sm" showSecondary={false} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 space-y-4">
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <PriceDisplay usd={cartTotal} size="sm" showSecondary={false} />
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Trackside Shipping</span>
                  <span className="text-white font-bold">{cartTotal > 150 ? 'FREE' : <PriceDisplay usd={14.99} size="sm" showSecondary={false} />}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-2 border-t border-zinc-800 text-sm">
                  <span>Estimated Total</span>
                  <PriceDisplay usd={cartTotal + (cartTotal > 150 ? 0 : 14.99)} size="sm" showSecondary={false} />
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full mono-btn-primary py-3 flex items-center justify-center space-x-2 text-xs font-bold"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
