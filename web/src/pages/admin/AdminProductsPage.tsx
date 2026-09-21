import { useNavigate } from 'react-router-dom'
import { useProducts, useDeleteProduct, useRestoreProduct } from '@/queries/use-products'
import { useAdminCategories } from '@/queries/use-categories'
import { formatCurrency } from '@/lib/utils'
import { Edit, Trash2, RotateCcw, Plus } from 'lucide-react'

export function AdminProductsPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useProducts()
  const deleteP = useDeleteProduct()
  const restoreP = useRestoreProduct()
  const { data: catData } = useAdminCategories()
  const cats = catData?.data?.data ?? []

  const products = data?.data?.data ?? []

  const catName = (id?: number) => cats.find((c: any) => c.id === id)?.name

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">المنتجات</h1>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="bg-brand-accent text-white text-xs px-3 py-2 rounded flex items-center gap-1"
          data-testid="add-product"
        >
          <Plus size={14} />
          إضافة
        </button>
      </div>

      {isLoading ? (
        <p className="text-zinc-500">جاري التحميل...</p>
      ) : products.length === 0 ? (
        <p className="text-zinc-500">لا توجد منتجات بعد.</p>
      ) : (
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-xs" data-testid="admin-products-table">
            <thead className="bg-zinc-100 text-zinc-600">
              <tr>
                <th className="p-2 text-right">الاسم</th>
                <th className="p-2 text-right">القسم</th>
                <th className="p-2 text-right">السعر</th>
                <th className="p-2 text-right">الحالة</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-t"
                  data-testid={`admin-product-row-${p.id}`}
                >
                  <td className="p-2">{p.name}</td>
                  <td className="p-2 text-zinc-500">
                    {catName((p as any).category_id) ?? '-'}
                  </td>
                  <td className="p-2">{formatCurrency(p.price, p.currency)}</td>
                  <td className="p-2">
                    {p.is_active ? (
                      <span className="text-green-600">نشط</span>
                    ) : (
                      <span className="text-zinc-400">معطل</span>
                    )}
                  </td>
                  <td className="p-2 flex gap-1">
                    <button
                      onClick={() => navigate(`/admin/products/${p.id}`)}
                      className="p-1 text-blue-600"
                      data-testid={`edit-${p.id}`}
                      aria-label="تعديل"
                    >
                      <Edit size={14} />
                    </button>
                    {(p as any).deleted_at ? (
                      <button
                        onClick={() => restoreP.mutate(p.id)}
                        className="p-1 text-green-600"
                        data-testid={`restore-${p.id}`}
                        aria-label="استعادة"
                      >
                        <RotateCcw size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => deleteP.mutate(p.id)}
                        className="p-1 text-red-600"
                        data-testid={`delete-${p.id}`}
                        aria-label="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}