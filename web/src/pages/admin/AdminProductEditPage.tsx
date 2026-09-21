import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useAppendImages,
  useDeleteImage,
  useReorderImages,
} from '@/queries/use-products'
import { useAdminCategories } from '@/queries/use-categories'
import { Button } from '@/components/ui/Button'
import { ImageUploader } from '@/components/admin/ImageUploader'

const schema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'السعر غير صالح'),
  currency: z.string().min(1),
  is_active: z.boolean(),
  category_id: z.coerce.number().min(1, 'القسم مطلوب'),
  colors: z.string().optional(),
  sizes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function AdminProductEditPage() {
  const { id } = useParams()
  const isNew = id === 'new' || !id
  const productId = isNew ? null : Number(id)
  const navigate = useNavigate()
  const [newFiles, setNewFiles] = useState<File[]>([])

  const { data: prodData } = useProduct(isNew ? '' : String(productId))
  const { data: catData } = useAdminCategories()
  const createP = useCreateProduct()
  const updateP = useUpdateProduct()
  const appendImgs = useAppendImages()
  const deleteImg = useDeleteImage()
  const reorderImgs = useReorderImages()

  const cats = catData?.data?.data ?? []
  const product = prodData?.data?.data

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true, currency: 'YER' },
  })

  useEffect(() => {
    if (product && !isNew) {
      reset({
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        currency: product.currency,
        is_active: product.is_active,
        category_id:
          (product as any).category_id ?? (product.category?.id ?? 0),
        colors: (product.colors ?? []).join(','),
        sizes: (product.sizes ?? []).join(','),
      })
    }
  }, [product, isNew, reset])

  const onSubmit = (data: FormData) => {
    const fd = new FormData()
    fd.append('name', data.name)
    fd.append('description', data.description ?? '')
    fd.append('price', String(data.price))
    fd.append('currency', data.currency)
    fd.append('is_active', data.is_active ? '1' : '0')
    fd.append('category_id', String(data.category_id))
    ;(data.colors ?? '')
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
      .forEach((c) => fd.append('colors[]', c))
    ;(data.sizes ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => fd.append('sizes[]', s))

    const onSaved = (savedId: number) => {
      if (newFiles.length > 0) {
        const imgFd = new FormData()
        newFiles.forEach((f) => imgFd.append('images[]', f))
        appendImgs.mutate(
          { id: savedId, form: imgFd },
          {
            onSuccess: () => navigate('/admin/products'),
          },
        )
      } else {
        navigate('/admin/products')
      }
    }

    if (isNew) {
      createP.mutate(fd, {
        onSuccess: (res: any) => onSaved(res.data.data.id),
      })
    } else {
      updateP.mutate(
        { id: productId!, form: fd },
        { onSuccess: () => onSaved(productId!) },
      )
    }
  }

  const onDeleteImage = (imageId: number) => {
    if (!productId) return
    if (!confirm('هل أنت متأكد من حذف الصورة؟')) return
    deleteImg.mutate({ productId, imageId })
  }

  const onReorderImages = (orderedIds: number[]) => {
    if (!productId) return
    reorderImgs.mutate({ id: productId, ids: orderedIds })
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold mb-4">
        {isNew ? 'منتج جديد' : 'تعديل منتج'}
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-md shadow-sm p-4 flex flex-col gap-3"
        data-testid="product-form"
      >
        <input
          {...register('name')}
          placeholder="الاسم"
          className="border rounded p-2 text-sm"
        />
        {errors.name && (
          <p className="text-red-500 text-xs">{errors.name.message}</p>
        )}

        <textarea
          {...register('description')}
          placeholder="الوصف"
          rows={3}
          className="border rounded p-2 text-sm"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            {...register('price')}
            type="number"
            placeholder="السعر"
            className="border rounded p-2 text-sm"
          />
          <input
            {...register('currency')}
            placeholder="YER"
            className="border rounded p-2 text-sm"
          />
        </div>

        <select
          {...register('category_id', { valueAsNumber: true })}
          className="border rounded p-2 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            — اختر القسم —
          </option>
          {cats.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="text-red-500 text-xs">{errors.category_id.message}</p>
        )}

        <input
          {...register('colors')}
          placeholder="الألوان (مفصولة بفواصل): أحمر,أزرق,أخضر"
          className="border rounded p-2 text-sm"
        />

        <input
          {...register('sizes')}
          placeholder="المقاسات (مفصولة بفواصل): S,M,L,XL"
          className="border rounded p-2 text-sm"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            {...register('is_active', {
              // RHF checkbox returns string "on" or boolean; coerce explicitly
              setValueAs: (v) => v === true || v === 'on' || v === '1',
            })}
          />
          نشط
        </label>

        {!isNew && product && (
          <ImageUploader
            images={product.images}
            newFiles={newFiles}
            onNewFilesChange={setNewFiles}
            onDelete={onDeleteImage}
            onReorder={onReorderImages}
          />
        )}
        {isNew && (
          <p className="text-xs text-zinc-500 italic">
            سيتم إضافة الصور بعد حفظ المنتج.
          </p>
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={createP.isPending || updateP.isPending}
            data-testid="submit-product"
          >
            حفظ
          </Button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 text-sm text-zinc-600"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}
