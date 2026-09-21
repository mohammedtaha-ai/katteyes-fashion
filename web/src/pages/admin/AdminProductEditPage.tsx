import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useAdminProduct,
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
  const productId = isNew ? 0 : (Number(id) || 0)
  const navigate = useNavigate()

  const [newFiles, setNewFiles] = useState<File[]>([])
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({})
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const { data: prodData } = useAdminProduct(productId)
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

  const handleMutationError = (err: any) => {
    if (err?.response?.status === 422 && err.response.data?.errors) {
      setServerErrors(err.response.data.errors)
    } else {
      const msg =
        err?.response?.data?.message || err?.message || 'حدث خطأ أثناء حفظ المنتج'
      setServerErrors({ general: [msg] })
    }
  }

  const onSubmit = (data: FormData) => {
    setServerErrors({})
    setSuccessMsg(null)

    if (isNew && newFiles.length === 0) {
      setServerErrors({ images: ['يجب إضافة صورة واحدة على الأقل'] })
      return
    }

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

    if (isNew) {
      newFiles.forEach((f) => fd.append('images[]', f))
    }

    const onSaved = (savedId: number) => {
      if (!isNew && newFiles.length > 0) {
        const imgFd = new FormData()
        newFiles.forEach((f) => imgFd.append('images[]', f))
        appendImgs.mutate(
          { id: savedId, form: imgFd },
          {
            onSuccess: () => {
              setNewFiles([])
              setSuccessMsg('تم حفظ المنتج وتحديث الصور بنجاح')
              setTimeout(() => navigate('/admin/products'), 1000)
            },
            onError: handleMutationError,
          },
        )
      } else {
        setSuccessMsg(isNew ? 'تم إضافة المنتج بنجاح' : 'تم حفظ التعديلات بنجاح')
        setTimeout(() => navigate('/admin/products'), 1000)
      }
    }

    if (isNew) {
      createP.mutate(fd, {
        onSuccess: (res: any) => onSaved(res.data.data.id),
        onError: handleMutationError,
      })
    } else {
      updateP.mutate(
        { id: productId, form: fd },
        {
          onSuccess: () => onSaved(productId),
          onError: handleMutationError,
        },
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

  const getFieldError = (field: string) => {
    if (errors[field as keyof FormData]?.message) {
      return errors[field as keyof FormData]?.message
    }
    if (serverErrors[field]?.length) {
      return serverErrors[field][0]
    }
    const subKey = Object.keys(serverErrors).find(
      (k) => k.startsWith(`${field}.`) || k.startsWith(`${field}[`),
    )
    if (subKey && serverErrors[subKey]?.length) {
      return serverErrors[subKey][0]
    }
    return null
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-bold mb-4">
        {isNew ? 'منتج جديد' : 'تعديل منتج'}
      </h1>

      {successMsg && (
        <div
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm mb-4 flex items-center justify-between"
          data-testid="success-banner"
        >
          <span>{successMsg}</span>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="text-xs text-green-800 underline ms-2"
          >
            الانتقال لقائمة المنتجات
          </button>
        </div>
      )}

      {serverErrors.general && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm mb-4"
          data-testid="error-banner"
        >
          {serverErrors.general.join(', ')}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-md shadow-sm p-4 flex flex-col gap-3"
        data-testid="product-form"
      >
        <div>
          <input
            {...register('name')}
            placeholder="الاسم"
            className="border rounded p-2 text-sm w-full"
            data-testid="input-name"
          />
          {(errors.name || serverErrors.name) && (
            <p className="text-red-500 text-xs mt-1" data-testid="error-name">
              {getFieldError('name')}
            </p>
          )}
        </div>

        <div>
          <textarea
            {...register('description')}
            placeholder="الوصف"
            rows={3}
            className="border rounded p-2 text-sm w-full"
            data-testid="input-description"
          />
          {(errors.description || serverErrors.description) && (
            <p className="text-red-500 text-xs mt-1" data-testid="error-description">
              {getFieldError('description')}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              {...register('price')}
              type="number"
              placeholder="السعر"
              className="border rounded p-2 text-sm w-full"
              data-testid="input-price"
            />
            {(errors.price || serverErrors.price) && (
              <p className="text-red-500 text-xs mt-1" data-testid="error-price">
                {getFieldError('price')}
              </p>
            )}
          </div>
          <div>
            <input
              {...register('currency')}
              placeholder="YER"
              className="border rounded p-2 text-sm w-full"
              data-testid="input-currency"
            />
            {(errors.currency || serverErrors.currency) && (
              <p className="text-red-500 text-xs mt-1" data-testid="error-currency">
                {getFieldError('currency')}
              </p>
            )}
          </div>
        </div>

        <div>
          <select
            {...register('category_id', { valueAsNumber: true })}
            className="border rounded p-2 text-sm w-full"
            defaultValue=""
            data-testid="select-category"
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
          {(errors.category_id || serverErrors.category_id) && (
            <p className="text-red-500 text-xs mt-1" data-testid="error-category_id">
              {getFieldError('category_id')}
            </p>
          )}
        </div>

        <div>
          <input
            {...register('colors')}
            placeholder="الألوان (مفصولة بفواصل): أحمر,أزرق,أخضر"
            className="border rounded p-2 text-sm w-full"
            data-testid="input-colors"
          />
          {(errors.colors || serverErrors.colors || serverErrors['colors.0']) && (
            <p className="text-red-500 text-xs mt-1" data-testid="error-colors">
              {getFieldError('colors')}
            </p>
          )}
        </div>

        <div>
          <input
            {...register('sizes')}
            placeholder="المقاسات (مفصولة بفواصل): S,M,L,XL"
            className="border rounded p-2 text-sm w-full"
            data-testid="input-sizes"
          />
          {(errors.sizes || serverErrors.sizes || serverErrors['sizes.0']) && (
            <p className="text-red-500 text-xs mt-1" data-testid="error-sizes">
              {getFieldError('sizes')}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...register('is_active', {
                // RHF checkbox returns string "on" or boolean; coerce explicitly
                setValueAs: (v) => v === true || v === 'on' || v === '1',
              })}
              data-testid="input-is_active"
            />
            نشط
          </label>
          {(errors.is_active || serverErrors.is_active) && (
            <p className="text-red-500 text-xs mt-1" data-testid="error-is_active">
              {getFieldError('is_active')}
            </p>
          )}
        </div>

        <div>
          <ImageUploader
            images={product?.images ?? []}
            newFiles={newFiles}
            onNewFilesChange={(files) => {
              setNewFiles(files)
              if (files.length > 0 && serverErrors.images) {
                setServerErrors((prev) => {
                  const next = { ...prev }
                  delete next.images
                  return next
                })
              }
            }}
            onDelete={onDeleteImage}
            onReorder={onReorderImages}
          />
          {(serverErrors.images || serverErrors['images.0']) && (
            <p className="text-red-500 text-xs mt-1" data-testid="images-error">
              {getFieldError('images')}
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-2">
          <Button
            type="submit"
            disabled={createP.isPending || updateP.isPending || appendImgs.isPending}
            data-testid="submit-product"
          >
            {createP.isPending || updateP.isPending || appendImgs.isPending
              ? 'جاري الحفظ...'
              : 'حفظ'}
          </Button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}
