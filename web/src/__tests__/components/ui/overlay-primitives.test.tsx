import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

beforeAll(() => {
  window.HTMLElement.prototype.hasPointerCapture = () => false
  window.HTMLElement.prototype.setPointerCapture = () => {}
  window.HTMLElement.prototype.releasePointerCapture = () => {}
  window.HTMLElement.prototype.scrollIntoView = () => {}
})

describe('Overlay and A11y Primitives', () => {
  it('renders Avatar with fallback initials', () => {
    render(
      <Avatar>
        <AvatarFallback>KT</AvatarFallback>
      </Avatar>
    )
    expect(screen.getByText('KT')).toBeInTheDocument()
  })

  it('opens Dialog on click, manages focus, and restores focus to trigger on Escape dismiss', async () => {
    const user = userEvent.setup()
    render(
      <Dialog>
        <DialogTrigger asChild>
          <button data-testid="dialog-trigger">افتح النافذة</button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>عنوان النافذة</DialogTitle>
          <button data-testid="dialog-inner-btn">زر داخلي</button>
        </DialogContent>
      </Dialog>
    )

    const trigger = screen.getByTestId('dialog-trigger')
    await user.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('عنوان النافذة')).toBeInTheDocument()

    // Test Escape dismiss and focus restoration
    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(trigger).toHaveFocus()
  })

  it('opens Sheet drawer and dismisses via Escape key', async () => {
    const user = userEvent.setup()
    render(
      <Sheet>
        <SheetTrigger asChild>
          <button>عرض التفاصيل</button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetTitle>تفاصيل الطلب</SheetTitle>
        </SheetContent>
      </Sheet>
    )

    await user.click(screen.getByRole('button', { name: 'عرض التفاصيل' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('تفاصيل الطلب')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('opens DropdownMenu and navigates with keyboard', async () => {
    const user = userEvent.setup()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button>الإجراءات</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>تعديل</DropdownMenuItem>
          <DropdownMenuItem>حذف</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    await user.click(screen.getByRole('button', { name: 'الإجراءات' }))
    const item = screen.getByRole('menuitem', { name: 'تعديل' })
    expect(item).toBeInTheDocument()

    // Test keyboard navigation
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'حذف' })).toHaveFocus()
  })

  it('renders accessible Tooltip with trigger and content', () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger asChild>
            <button aria-label="مساعدة">?</button>
          </TooltipTrigger>
          <TooltipContent>معلومات إضافية</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    expect(screen.getByRole('button', { name: 'مساعدة' })).toBeInTheDocument()
    expect(screen.getByRole('tooltip')).toHaveTextContent('معلومات إضافية')
  })
})
