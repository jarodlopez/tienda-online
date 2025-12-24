import { Suspense } from 'react'
import ProductClient from './ProductClient'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center">Cargando...</div>}>
      <ProductClient />
    </Suspense>
  )
}