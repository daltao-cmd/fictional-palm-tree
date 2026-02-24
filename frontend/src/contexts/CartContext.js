import { createContext, useContext, useState } from 'react';
const CartContext = createContext(null);
export function CartProvider({ children }) {
  const [cart, setCart] = useState({ storeId: null, storeName: '', items: [] });
  const addItem = (product, storeId, storeName) => {
    setCart((prev) => {
      if (prev.storeId && prev.storeId !== storeId) {
        if (!window.confirm(`Limpar carrinho de "${prev.storeName}" e adicionar de "${storeName}"?`)) return prev;
        return { storeId, storeName, items: [{ ...product, quantity: 1 }] };
      }
      const existing = prev.items.find((i) => i.id === product.id);
      if (existing) return { ...prev, storeId, storeName, items: prev.items.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) };
      return { storeId, storeName, items: [...prev.items, { ...product, quantity: 1 }] };
    });
  };
  const removeItem = (productId) => setCart((prev) => { const items = prev.items.filter((i) => i.id !== productId); return items.length === 0 ? { storeId: null, storeName: '', items: [] } : { ...prev, items }; });
  const updateQuantity = (productId, quantity) => { if (quantity < 1) { removeItem(productId); return; } setCart((prev) => ({ ...prev, items: prev.items.map((i) => i.id === productId ? { ...i, quantity } : i) })); };
  const clearCart = () => setCart({ storeId: null, storeName: '', items: [] });
  const total = cart.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  return <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, total, count }}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
