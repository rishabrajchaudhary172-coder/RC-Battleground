import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('rc_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('rc_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync Wishlist Count when user logged in
  const fetchWishlistCount = async () => {
    if (!token || !user) {
      setWishlistCount(0);
      return;
    }
    try {
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistCount(data.wishlist ? data.wishlist.length : 0);
      }
    } catch (err) {
      console.error('Fetch wishlist count error:', err);
    }
  };

  useEffect(() => {
    fetchWishlistCount();
  }, [token, user]);

  const addToCart = (product, quantity = 1) => {
    if (user && user.role === 'admin') {
      alert('Administrators cannot add products to cart or place order bookings. Please use a buyer account to purchase.');
      return;
    }
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product_id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex].quantity = Math.min(newQty, product.stock || 99);
        return updated;
      } else {
        return [
          ...prev,
          {
            product_id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image: product.images && product.images.length > 0 ? product.images[0] : '',
            stock: product.stock,
            quantity: Math.min(quantity, product.stock || 99)
          }
        ];
      }
    });
    setCartOpen(true);
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: Math.min(newQty, item.stock || 99) } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartItemCount,
        cartOpen,
        setCartOpen,
        wishlistCount,
        refreshWishlistCount: fetchWishlistCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
