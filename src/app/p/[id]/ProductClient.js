'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowLeft, Minus, Plus, Check, Truck, Shield } from 'lucide-react';
import Link from 'next/link';

const APP_ID = 'pos-pro-mobile-v2';

export default function ProductClient() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'artifacts', APP_ID, 'public/data/products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    // Agregar el producto 'qty' veces
    // Nota: El addToCart simple del contexto suele agregar 1. 
    // Si tu contexto soporta cantidad, úsala. Si no, hacemos un loop o modificamos el contexto.
    // Asumiremos que el contexto suma 1, así que llamamos a updateQty o simplemente agregamos.
    // Para simplificar y ser compatible con tu contexto actual:
    for (let i = 0; i < qty; i++) {
        addToCart(product);
    }
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Producto no encontrado</h2>
        <Link href="/" className="text-indigo-600 hover:underline">Volver a la tienda</Link>
    </div>
  );

  const isOutOfStock = parseInt(product.stock) <= 0;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Botón Volver */}
      <button 
        onClick={() => router.back()} 
        className="mb-6 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Volver</span>
      </button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        {/* Columna Izquierda: Imagen */}
        <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            {product.image ? (
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ShoppingBag size={80} />
                </div>
            )}
            {isOutOfStock && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                    <span className="bg-red-500 text-white px-6 py-2 rounded-full text-lg font-bold shadow-xl">AGOTADO</span>
                </div>
            )}
        </div>

        {/* Columna Derecha: Información */}
        <div className="flex flex-col">
            <div>
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">
                    {product.category || 'General'}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-2 leading-tight">
                    {product.name}
                </h1>
                <div className="flex items-end gap-4 mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                        {new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(product.price)}
                    </span>
                    {product.oldPrice && (
                         <span className="text-xl text-gray-400 line-through mb-1">
                            {new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(product.oldPrice)}
                        </span>
                    )}
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-8">
                    {product.description || "Sin descripción disponible para este producto. Calidad garantizada."}
                </p>
            </div>

            <div className="mt-auto space-y-6">
                
                {/* Selector de Cantidad y Botón */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center border border-gray-200 rounded-xl w-fit">
                        <button 
                            onClick={() => setQty(q => Math.max(1, q - 1))}
                            disabled={isOutOfStock || qty <= 1}
                            className="p-3 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                        >
                            <Minus size={20}/>
                        </button>
                        <span className="w-12 text-center font-bold text-lg">{qty}</span>
                        <button 
                            onClick={() => setQty(q => q + 1)}
                            disabled={isOutOfStock}
                            className="p-3 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                        >
                            <Plus size={20}/>
                        </button>
                    </div>

                    <button 
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={`flex-1 py-3 px-6 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
                            ${added 
                                ? 'bg-green-600 text-white shadow-green-200 scale-105' 
                                : 'bg-gray-900 text-white hover:bg-indigo-600 shadow-indigo-200 hover:scale-[1.02] active:scale-95'
                            } 
                            ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-300 shadow-none' : ''}
                        `}
                    >
                        {added ? (
                            <>
                                <Check size={24} />
                                ¡Agregado!
                            </>
                        ) : (
                            <>
                                <ShoppingBag size={24} />
                                {isOutOfStock ? 'Sin Stock' : 'Agregar al Carrito'}
                            </>
                        )}
                    </button>
                </div>

                {/* Beneficios / Info Extra */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Truck size={18} />
                        </div>
                        <span>Envío a todo el país</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <Shield size={18} />
                        </div>
                        <span>Compra Segura</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}