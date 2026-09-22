import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

beforeAll(() => {
  window.HTMLElement.prototype.hasPointerCapture = () => false
  window.HTMLElement.prototype.setPointerCapture = () => {}
  window.HTMLElement.prototype.releasePointerCapture = () => {}
  window.HTMLElement.prototype.scrollIntoView = () => {}
})

describe('Form and Interactive Primitives', () => {
  it('renders canonical Button with destructive variant and focus ring', () => {
    render(<Button variant="destructive">حذف</Button>)
    const btn = screen.getByRole('button', { name: 'حذف' })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveClass('bg-destructive')
    expect(btn).toHaveClass('focus-visible:ring-2')
  })

  it('renders Badge with semantic status variants', () => {
    render(
      <div>
        <Badge variant="success">مكتمل</Badge>
        <Badge variant="warning">منخفض</Badge>
        <Badge variant="destructive">ملغي</Badge>
      </div>
    )
    expect(screen.getByText('مكتمل')).toHaveClass('bg-success/15')
    expect(screen.getByText('منخفض')).toHaveClass('bg-warning/15')
    expect(screen.getByText('ملغي')).toHaveClass('bg-destructive/15')
  })

  it('links Label to Input for accessibility', () => {
    render(
      <div>
        <Label htmlFor="sku-input">رمز المنتج</Label>
        <Input id="sku-input" placeholder="SKU-001" />
      </div>
    )
    const input = screen.getByLabelText('رمز المنتج')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'SKU-001')
  })

  it('switches tabs interactively via user click', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">القسم الأول</TabsTrigger>
          <TabsTrigger value="tab2">القسم الثاني</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">محتوى 1</TabsContent>
        <TabsContent value="tab2">محتوى 2</TabsContent>
      </Tabs>
    )

    expect(screen.getByText('محتوى 1')).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'القسم الثاني' }))
    expect(screen.getByText('محتوى 2')).toBeInTheDocument()
  })

  it('opens Select dropdown and picks an item via userEvent', async () => {
    const user = userEvent.setup()
    render(
      <Select defaultValue="opt1">
        <SelectTrigger aria-label="اختر القسم">
          <SelectValue placeholder="اختر" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opt1">الفساتين</SelectItem>
          <SelectItem value="opt2">الأحذية</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByRole('combobox', { name: 'اختر القسم' })
    await user.click(trigger)
    const option = await screen.findByRole('option', { name: 'الأحذية' })
    await user.click(option)
    expect(screen.getByText('الأحذية')).toBeInTheDocument()
  })
})
