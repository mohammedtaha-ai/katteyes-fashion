import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, GripVertical } from 'lucide-react'
import type { ProductImage } from '@/api/types'

interface Props {
  images: ProductImage[]
  newFiles: File[]
  onNewFilesChange: (files: File[]) => void
  onDelete: (imageId: number) => void
  onReorder: (orderedIds: number[]) => void
}

function SortableThumb({
  image,
  onDelete,
}: {
  image: ProductImage
  onDelete: (id: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-24 h-24 rounded overflow-hidden border bg-zinc-100 group"
      data-testid={`img-${image.id}`}
    >
      <img
        src={image.url}
        alt=""
        className="w-full h-full object-cover"
      />
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-0 end-0 bg-black/60 text-white p-1 cursor-grab active:cursor-grabbing"
        aria-label="اسحب لإعادة الترتيب"
      >
        <GripVertical size={12} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(image.id)}
        className="absolute top-0 start-0 bg-red-600 text-white p-1"
        aria-label="حذف الصورة"
        data-testid={`img-delete-${image.id}`}
      >
        <Trash2 size={12} />
      </button>
    </div>
  )
}

export function ImageUploader({
  images,
  newFiles,
  onNewFilesChange,
  onDelete,
  onReorder,
}: Props) {
  const [previews, setPreviews] = useState<string[]>([])
  const sensors = useSensors(useSensor(PointerSensor))

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length === 0) return
      const next = [...newFiles, ...accepted]
      onNewFilesChange(next)
      const newPreviews = accepted.map((f) => URL.createObjectURL(f))
      setPreviews((prev) => [...prev, ...newPreviews])
    },
    [newFiles, onNewFilesChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = images.findIndex((i) => i.id === active.id)
    const newIndex = images.findIndex((i) => i.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(images, oldIndex, newIndex)
    onReorder(reordered.map((i) => i.id))
  }

  return (
    <div>
      <label className="block text-xs font-bold mb-2">الصور</label>

      {/* Existing images (drag to reorder + delete) */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={images.map((i) => i.id)}
            strategy={rectSortingStrategy}
          >
            <div
              className="flex flex-wrap gap-2 mb-3"
              data-testid="image-grid"
            >
              {images.map((img) => (
                <SortableThumb
                  key={img.id}
                  image={img}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Pending new uploads preview */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3" data-testid="new-previews">
          {previews.map((src, i) => (
            <div
              key={i}
              className="relative w-24 h-24 rounded overflow-hidden border border-dashed border-brand-accent"
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
              <span className="absolute bottom-0 inset-x-0 bg-brand-accent text-white text-[10px] text-center">
                جديد
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded p-4 text-center cursor-pointer text-xs ${
          isDragActive ? 'border-brand-accent bg-amber-50' : 'border-zinc-300'
        }`}
        data-testid="dropzone"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>أفلت الصور هنا...</p>
        ) : (
          <p>اسحب الصور أو انقر للاختيار</p>
        )}
        {newFiles.length > 0 && (
          <p className="text-zinc-500 mt-1">
            {newFiles.length} صورة جديدة جاهزة للحفظ
          </p>
        )}
      </div>
    </div>
  )
}
