import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useAdminProducts,
  useUpdateProduct,
  useDeleteProduct,
  useRestoreProduct,
} from '@/queries/use-products'
import { useAdminCategories } from '@/queries/use-categories'
import { formatCurrency } from '@/lib/utils'
import { Edit, Trash2, RotateCcw, Plus } from 'lucide-react'

const STATUS_FILTERS = [
  { label: 'الكل', value: '' },
  { label: 'نشط', value: 'active' },
  { label: 'معطل', value: 'inactive' },
]

export function AdminProductsPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  const { data, isLoading } = useAdminProducts({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
  })
  const updateP = useUpdateProduct()
  const deleteP = useDeleteProduct()
  const restoreP = useRestoreProduct()
  const { data: catData } = useAdminCategories()
  const cats = catData?.data?.data ?? []

  const products = data?.data?.data ?? []

  const toggleActive = (productId: number, currentActive: boolean) => {
    const fd = new FormData()
    fd.append('is_active', currentActive ? '0' : '1')
    updateP.mutate({ id: productId, form: fd })
  }

  const handleDelete = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      deleteP.mutate(id)
    }
  }

  const catName = (p: any) =>
    p.category?.name ?? cats.find((c: any) => c.id === p.category_id)?.name ?? '-'

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h1 className="text-lg font-bold">المنتجات</h1>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="bg-brand-accent text-white text-xs px-3 py-2 rounded flex items-center gap-1 self-start sm:self-auto hover:bg-amber-600 transition-colors"
          data-testid="add-product"
        >
          <Plus size={14} />
          إضافة
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm p-3 mb-4 flex flex-wrap items-center justify-between gap-3">
        {/* Status filter pills */}
        <div className="flex items-center gap-1.5" data-testid="status-filters">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? 'bg-brand text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
              data-testid={`filter-status-${f.value || 'all'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Category filter dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-zinc-200 rounded px-2 py-1 text-xs bg-white text-zinc-700"
            data-testid="category-filter"
          >
            <option value="">كل الأقسام</option>
            {cats.map((c: any) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
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
                <th className="p-2 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr
                  key={p.id}
                  className="border-t hover:bg-zinc-50"
                  data-testid={`admin-product-row-${p.id}`}
                >
                  <td className="p-2 font-medium">{p.name}</td>
                  <td className="p-2 text-zinc-500">{catName(p)}</td>
                  <td className="p-2">{formatCurrency(p.price, p.currency)}</td>
                  <td className="p-2">
                    <button
                      type="button"
                      onClick={() => toggleActive(p.id, p.is_active)}
                      disabled={updateP.isPending}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                        p.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                      data-testid={`toggle-active-${p.id}`}
                      title="اضغط لتغيير الحالة"
                    >
                      {p.is_active ? 'نشط' : 'معطل'}
                    </button>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/admin/products/${p.id}`)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        data-testid={`edit-${p.id}`}
                        aria-label="تعديل"
                        title="تعديل"
                      >
                        <Edit size={14} />
                      </button>
                      {p.deleted_at ? (
                        <button
                          onClick={() => restoreP.mutate(p.id)}
                          disabled={restoreP.isPending}
                          className="p-1 text-green-600 hover:text-green-800"
                          data-testid={`restore-${p.id}`}
                          aria-label="استعادة"
                          title="استعادة"
                        >
                          <RotateCcw size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleteP.isPending}
                          className="p-1 text-red-600 hover:text-red-800"
                          data-testid={`delete-${p.id}`}
                          aria-label="حذف"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
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