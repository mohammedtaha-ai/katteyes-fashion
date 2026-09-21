import { render, screen, fireEvent } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import { ImageUploader } from '@/components/admin/ImageUploader'
import type { ProductImage } from '@/api/types'

const sampleImages: ProductImage[] = [
  { id: 1, url: '/a.webp', sort_order: 0 },
  { id: 2, url: '/b.webp', sort_order: 1 },
]

// Helper: wrap with DndContext so useSortable has a parent context (required by @dnd-kit/sortable)
const renderWithDnd = (ui: React.ReactNode) =>
  render(<DndContext>{ui}</DndContext>)

it('renders dropzone with prompt', () => {
  renderWithDnd(
    <ImageUploader
      images={[]}
      newFiles={[]}
      onNewFilesChange={() => {}}
      onDelete={() => {}}
      onReorder={() => {}}
    />,
  )
  expect(screen.getByTestId('dropzone')).toBeInTheDocument()
  expect(screen.getByText(/اسحب الصور أو انقر/)).toBeInTheDocument()
})

it('renders existing images with delete buttons', () => {
  renderWithDnd(
    <ImageUploader
      images={sampleImages}
      newFiles={[]}
      onNewFilesChange={() => {}}
      onDelete={() => {}}
      onReorder={() => {}}
    />,
  )
  expect(screen.getByTestId('img-1')).toBeInTheDocument()
  expect(screen.getByTestId('img-2')).toBeInTheDocument()
  expect(screen.getByTestId('img-delete-1')).toBeInTheDocument()
  expect(screen.getByTestId('img-delete-2')).toBeInTheDocument()
})

it('calls onDelete when delete button clicked', () => {
  let deleted = 0
  renderWithDnd(
    <ImageUploader
      images={sampleImages}
      newFiles={[]}
      onNewFilesChange={() => {}}
      onDelete={(id) => (deleted = id)}
      onReorder={() => {}}
    />,
  )
  fireEvent.click(screen.getByTestId('img-delete-2'))
  expect(deleted).toBe(2)
})

it('shows pending count when newFiles present', () => {
  const fakeFile = new File(['x'], 'test.png', { type: 'image/png' })
  renderWithDnd(
    <ImageUploader
      images={[]}
      newFiles={[fakeFile]}
      onNewFilesChange={() => {}}
      onDelete={() => {}}
      onReorder={() => {}}
    />,
  )
  expect(screen.getByText(/1 صورة جديدة/)).toBeInTheDocument()
})
