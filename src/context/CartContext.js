'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cargar carrito de localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Guardar en localStorage al cambiar
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, variant = null, qty = 1) => {
    setCart(prev => {
      const itemKey = variant ? `${product.id}-${variant.name}` : product.id;
      const existing = prev.find(item => item.key === itemKey);
      
      const price = variant ? (parseFloat(variant.price) || parseFloat(product.price)) : parseFloat(product.price);

      if (existing) {
        return prev.map(item => 
          item.key === itemKey ? { ...item, qty: item.qty + qty } : item
        );
      }

      return [...prev, {
        key: itemKey,
        id: product.id,
        name: product.name,
        price: price,
        image: product.image || product.img,
        variant: variant ? variant.name : null,
        qty: qty
      }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (key) => {
    setCart(prev => prev.filter(item => item.key !== key));
  };

  const updateQty = (key, delta) => {
    setCart(prev => prev.map(item => {
      if (item.key === key) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, isCartOpen, setIsCartOpen, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
