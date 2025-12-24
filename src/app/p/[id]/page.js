'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '../../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { signInAnonymously } from "firebase/auth";
import Link from 'next/link';
import { ShoppingCart, ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useRouter } from 'next/navigation';

const APP_ID = 'pos-pro-mobile-v2';

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      if (!auth.currentUser) await signInAnonymously(auth);
      const docRef = doc(db, 'artifacts', APP_ID, 'public/data/products', params.id);
      
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
           const data = docSnap.data();
           setProduct({ id: docSnap.id, ...data });
           // Si solo hay una variante o no hay variantes, preseleccionar
           if(data.variants && data.variants.length > 0) {
              setSelectedVariant(null);
           }
        } else {
           setProduct(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    };
    init();
  }, [params.id]);

  const handleAdd = () => {
    if(product.variants && product.variants.length > 0 && !selectedVariant) {
        alert("Por favor selecciona una opción");
        return;
    }
    addToCart(product, selectedVariant);
    router.push('/cart'); // Redirigir al carrito o abrir el drawer
  };

  const currentPrice = selectedVariant ? (selectedVariant.price || product?.price) : product?.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product?.stock;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!product) return <div className="p-10 text-center">Producto no encontrado</div>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-6 gap-2 font-medium">
         <ArrowLeft size={18} /> Volver a la tienda
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden grid md:grid-cols-2 gap-0 md:gap-8">
         {/* Imagen */}
         <div className="bg-gray-100 aspect-square relative">
            {product.image && <img src={product.image} className="w-full h-full object-cover" />}
            {parseInt(currentStock) <= 0 && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                   <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">AGOTADO</span>
                </div>
            )}
         </div>

         {/* Info */}
         <div className="p-6 md:p-8 flex flex-col justify-center">
            <span className="text-indigo-600 font-bold uppercase tracking-wider text-xs mb-2">{product.category}</span>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-4xl font-bold text-indigo-700 mb-6">
                {new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(currentPrice)}
            </p>

            {/* Selector Variantes */}
            {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Opciones Disponibles:</label>
                    <div className="flex flex-wrap gap-2">
                        {product.variants.map((v, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedVariant(v)}
                                className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                                    selectedVariant === v 
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200' 
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                {v.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Stock Indicator */}
            <div className="flex items-center gap-2 mb-6 text-sm">
                {parseInt(currentStock) > 0 ? (
                    <span className="flex items-center gap-1 text-green-600 font-bold"><Check size={16}/> En Stock ({currentStock} disp.)</span>
                ) : (
                    <span className="flex items-center gap-1 text-red-500 font-bold"><AlertTriangle size={16}/> Agotado</span>
                )}
            </div>

            <button
                onClick={handleAdd}
                disabled={parseInt(currentStock) <= 0}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
                <ShoppingCart size={24}/> Agregar al Carrito
            </button>
         </div>
      </div>
    </main>
  );
}
