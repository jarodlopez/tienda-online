'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCart(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, variant = null) => {
    // Validación de stock (lógica de negocio para evitar overselling en eCommerce)
    const currentStock = variant ? variant.stock : product.stock;
    if (parseInt(currentStock) <= 0) {
      alert("Producto agotado");
      return;
    }

    const key = variant ? `\( {product.id}- \){variant.name}` : product.id;
    const existing = cart.find(item => item.key === key);
    if (existing) {
      updateQty(key, 1);
    } else {
      setCart([...cart, { ...product, variant, qty: 1, key }]);
    }
  };

  const removeFromCart = (key) => {
    setCart(cart.filter(item => item.key !== key));
  };

  const updateQty = (key, delta) => {
    setCart(cart.map(item => 
      item.key === key ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);