import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useProduct } from '@/queries/use-products'
import { useCartStore } from '@/stores/cart-store'
import { ProductSlider } from '@/components/product/ProductSlider'
import { OptionPicker } from '@/components/product/OptionPicker'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

export function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useProduct(slug ?? '')
  const addItem = useCartStore((s) => s.addItem)
  const [color, setColor] = useState<string>('')
  const [size, setSize] = useState<string>('')

  if (isLoading) {
    return <p className="text-center py-12">جاري التحميل...</p>
  }
  const product = data?.data?.data
  if (!product) {
    return <p className="text-center py-12">المنتج غير موجود</p>
  }

  const colorOpts = product.colors.length ? product.colors : ['الافتراضي']
  const sizeOpts = product.sizes.length ? product.sizes : ['مقاس واحد']
  const selColor = color || colorOpts[0]
  const selSize = size || sizeOpts[0]

  const handleAdd = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      currency: product.currency,
      img: product.images[0]?.url ?? '',
      color: selColor,
      size: selSize,
    })
    navigate('/cart')
  }

  return (
    <main className="bg-white">
      <div className="container max-w-6xl mx-auto p-2 grid md:grid-cols-2 gap-4">
        <ProductSlider images={product.images} />
        <div className="p-4 flex flex-col gap-3">
          {product.category?.name && (
            <div className="text-xs text-brand-accent font-bold">
              {product.category.name}
            </div>
          )}
          <h1 className="text-lg font-black">{product.name}</h1>
          <div
            className="text-xl text-brand-accent font-bold"
            data-testid="detail-price"
          >
            {formatCurrency(product.price, product.currency)}
          </div>
          <p className="text-xs text-zinc-500 border-y border-zinc-200 py-2 leading-relaxed">
            <b>وصف المنتج:</b>
            <br />
            {product.description ?? 'لا يوجد وصف'}
          </p>
          <OptionPicker
            label="اختر اللون:"
            options={colorOpts}
            value={selColor}
            onChange={setColor}
          />
          <OptionPicker
            label="اختر المقاس:"
            options={sizeOpts}
            value={selSize}
            onChange={setSize}
          />
          <Button onClick={handleAdd} className="mt-2" data-testid="add-to-cart">
            <ShoppingBag size={16} className="ms-2" />
            أضف إلى حقيبة التسوق
          </Button>
        </div>
      </div>
    </main>
  )
}
