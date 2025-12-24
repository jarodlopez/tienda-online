'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '../../../lib/firebase'; // Nota los ../
import { collection, query, onSnapshot } from 'firebase/firestore';
import { signInAnonymously } from "firebase/auth";
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

const APP_ID = 'pos-pro-mobile-v2';

export default function CategoryPage({ params }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Decodificar la URL (ej: Ropa%20Hombre -> Ropa Hombre)
  const categoryName = decodeURIComponent(params.category);

  useEffect(() => {
    const init = async () => {
      if (!auth.currentUser) await signInAnonymously(auth);
      const q = query(collection(db, 'artifacts', APP_ID, 'public/data/products'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                  .filter(p => p.active !== false && (p.category === categoryName || p.cat === categoryName));
        setProducts(list);
        setLoading(false);
      });
      return () => unsubscribe();
    };
    init();
  }, [categoryName]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
         <Link href="/" className="p-2 bg-white rounded-full border hover:bg-gray-50"><ArrowLeft size={20}/></Link>
         <h1 className="text-3xl font-bold text-gray-800">{categoryName}</h1>
      </div>

      {products.length === 0 ? (
         <div className="text-center py-20 text-gray-400">
           <ShoppingBag size={64} className="mx-auto mb-4 opacity-50"/>
           <p>No hay productos en esta categoría.</p>
         </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
            <Link key={product.id} href={`/p/${product.id}`} className="group">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag size={40}/></div>
                    )}
                    {parseInt(product.stock) <= 0 && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">AGOTADO</span>
                      </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-gray-800 leading-tight truncate">{product.name}</h3>
                    <div className="mt-3 flex justify-between items-center">
                    <span className="text-lg font-extrabold text-indigo-700">
                        {new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(product.price)}
                    </span>
                    <span className="bg-gray-50 p-2 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <ArrowRight size={18} />
                    </span>
                    </div>
                </div>
                </div>
            </Link>
            ))}
        </div>
      )}
    </main>
  );
}
