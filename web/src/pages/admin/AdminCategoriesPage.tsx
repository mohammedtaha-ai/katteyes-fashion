import { useState } from 'react'
import { Edit, Trash2, RotateCcw, Plus } from 'lucide-react'
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useRestoreCategory,
} from '@/queries/use-categories'

export function AdminCategoriesPage() {
  const [nameInput, setNameInput] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const { data, isLoading } = useAdminCategories(true)
  const createC = useCreateCategory()
  const updateC = useUpdateCategory()
  const deleteC = useDeleteCategory()
  const restoreC = useRestoreCategory()

  const cats = data?.data?.data ?? []

  const onAdd = () => {
    if (!nameInput.trim()) return
    createC.mutate(
      { name: nameInput, slug: '' } as any,
      { onSuccess: () => setNameInput('') },
    )
  }

  const onSaveEdit = (id: number) => {
    if (!editName.trim()) return
    updateC.mutate(
      { id, payload: { name: editName, slug: '' } as any },
      { onSuccess: () => setEditingId(null) },
    )
  }

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">الأقسام</h1>

      <div className="bg-white rounded-md shadow-sm p-3 mb-3 flex gap-2">
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="اسم قسم جديد"
          className="border rounded p-2 text-sm flex-1"
          data-testid="new-category-name"
        />
        <button
          onClick={onAdd}
          disabled={createC.isPending}
          className="bg-brand-accent text-white px-3 py-2 text-xs rounded flex items-center gap-1"
          data-testid="add-category"
        >
          <Plus size={14} />
          إضافة
        </button>
      </div>

      {isLoading ? (
        <p className="text-zinc-500">جاري التحميل...</p>
      ) : (
        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-zinc-100 text-zinc-600">
              <tr>
                <th className="p-2 text-right">الاسم</th>
                <th className="p-2 text-right">Slug</th>
                <th className="p-2 text-right">الحالة</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody data-testid="categories-tbody">
              {cats.map((c: any) => (
                <tr key={c.id} className="border-t">
                  <td className="p-2">
                    {editingId === c.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border rounded p-1 text-xs"
                      />
                    ) : (
                      c.name
                    )}
                  </td>
                  <td className="p-2 text-zinc-500">{c.slug}</td>
                  <td className="p-2">
                    {c.deleted_at ? (
                      <span className="text-zinc-400">محذوف</span>
                    ) : c.is_active ? (
                      <span className="text-green-600">نشط</span>
                    ) : (
                      <span className="text-zinc-400">معطل</span>
                    )}
                  </td>
                  <td className="p-2 flex gap-1">
                    {editingId === c.id ? (
                      <button
                        onClick={() => onSaveEdit(c.id)}
                        className="text-blue-600 text-xs"
                      >
                        حفظ
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(c.id)
                          setEditName(c.name)
                        }}
                        className="p-1 text-blue-600"
                        data-testid={`edit-cat-${c.id}`}
                        aria-label="تعديل"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                    {c.deleted_at ? (
                      <button
                        onClick={() => restoreC.mutate(c.id)}
                        className="p-1 text-green-600"
                        data-testid={`restore-cat-${c.id}`}
                        aria-label="استعادة"
                      >
                        <RotateCcw size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => deleteC.mutate(c.id)}
                        className="p-1 text-red-600"
                        data-testid={`delete-cat-${c.id}`}
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