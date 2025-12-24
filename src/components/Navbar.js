'use client';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ShoppingCart, Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { cart, setIsCartOpen } = useCart();
  const [term, setTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if(term.trim()) router.push(`/?search=${term}`);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <ShoppingBag size={20} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent hidden sm:block">
              Mi Tienda
            </span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
             <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
             <input 
               value={term}
               onChange={(e) => setTerm(e.target.value)}
               type="text" 
               placeholder="Buscar productos..." 
               className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm"
             />
          </form>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ShoppingCart size={24} className="text-gray-700" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm animate-bounce">
                {cart.reduce((a,c) => a + c.qty, 0)}
              </span>
            )}
          </button>
        </div>
      </nav>
  );
}
