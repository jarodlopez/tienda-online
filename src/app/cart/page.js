'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext'; // Ruta absoluta
import { db } from '@/lib/firebase'; // Ruta absoluta
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Trash2, Plus, Minus, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const APP_ID = 'pos-pro-mobile-v2';

export default function CartPage() {
  const { cart, removeFromCart, updateQty, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState('review'); 
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        await addDoc(collection(db, 'artifacts', APP_ID, 'public/data/orders'), {
            items: cart,
            total: cartTotal,
            customer,
            status: 'pending',
            createdAt: serverTimestamp(),
            channel: 'ecommerce-web'
        });

        clearCart();
        setStep('success');

    } catch (err) {
        console.error(err);
        alert("Error al procesar pedido");
    } finally {
        setLoading(false);
    }
  };

  if(cart.length === 0 && step !== 'success') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h2>
        <Link href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold">Ir a comprar</Link>
    </div>
  );

  if (step === 'success') return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
              <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Pedido Enviado!</h2>
          <p className="text-gray-500 mb-8 max-w-md">Tu pedido ha sido registrado en nuestro sistema. Nos pondremos en contacto contigo pronto.</p>
          <Link href="/" className="text-indigo-600 font-bold hover:underline">Volver al inicio</Link>
      </div>
  );

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Resumen de Compra</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                {cart.map(item => (
                    <div key={item.key} className="flex gap-4 p-4 bg-white border rounded-xl shadow-sm">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                            {item.image && <img src={item.image} className="w-full h-full object-cover"/>}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{item.name}</h3>
                            {item.variant && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{item.variant}</span>}
                            <p className="text-indigo-600 font-bold mt-1">C${item.price}</p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                            <button onClick={() => removeFromCart(item.key)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                            <div className="flex items-center gap-3 bg-gray-50 px-2 py-1 rounded-lg border">
                                <button onClick={() => updateQty(item.key, -1)}><Minus size={14}/></button>
                                <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                                <button onClick={() => updateQty(item.key, 1)}><Plus size={14}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="h-fit space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-end mb-6 border-b pb-4">
                        <span className="text-gray-500">Total a Pagar</span>
                        <span className="text-3xl font-extrabold text-gray-900">
                           {new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'NIO' }).format(cartTotal)}
                        </span>
                    </div>

                    {step === 'review' ? (
                        <button onClick={() => setStep('form')} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-colors">
                            Continuar al Pago
                        </button>
                    ) : (
                        <form onSubmit={handleCheckout} className="space-y-4 animate-in slide-in-from-right">
                            <input required placeholder="Nombre Completo" className="w-full p-3 bg-gray-50 rounded-lg border"
                                value={customer.name} onChange={e=>setCustomer({...customer, name:e.target.value})}/>
                            <input required placeholder="Teléfono" type="tel" className="w-full p-3 bg-gray-50 rounded-lg border"
                                value={customer.phone} onChange={e=>setCustomer({...customer, phone:e.target.value})}/>
                            <textarea required placeholder="Dirección de Entrega" className="w-full p-3 bg-gray-50 rounded-lg border" rows="2"
                                value={customer.address} onChange={e=>setCustomer({...customer, address:e.target.value})}/>
                            
                            <button disabled={loading} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 flex items-center justify-center gap-2">
                                {loading ? 'Enviando...' : <><Send size={20}/> Confirmar Pedido</>}
                            </button>
                            <button type="button" onClick={() => setStep('review')} className="w-full text-sm text-gray-500 hover:underline">Volver</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    </main>
  );
}



