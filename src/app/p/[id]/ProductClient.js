'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useParams } from 'next/navigation'

export default function ProductClient() {
  const params = useParams()
  const { id } = params

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      const docRef = doc(db, 'artifacts/pos-pro-mobile-v2/public/data/products', id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) setProduct(docSnap.data())
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  if (loading) return <div>Loading...</div>

  if (!product) return <div>Producto no encontrado</div>

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price}</p>
      <img src={product.image} alt={product.name} />
    </div>
  )
}