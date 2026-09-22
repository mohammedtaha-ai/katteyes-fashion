import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb'

describe('Layout and Feedback Primitives', () => {
  it('renders Card with header and content using semantic classes', () => {
    render(
      <Card data-testid="test-card">
        <CardHeader>
          <CardTitle>لوحة التحكم</CardTitle>
          <CardDescription>نظرة عامة على المتجر</CardDescription>
        </CardHeader>
        <CardContent>المحتوى</CardContent>
        <CardFooter>تذييل البطاقة</CardFooter>
      </Card>
    )
    const card = screen.getByTestId('test-card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('bg-card')
    expect(card).toHaveClass('shadow-xs')
    expect(card).toHaveClass('rounded-2xl')
    expect(card).toHaveClass('border-border')
    expect(screen.getByText('لوحة التحكم')).toBeInTheDocument()
    expect(screen.getByText('نظرة عامة على المتجر')).toBeInTheDocument()
    expect(screen.getByText('المحتوى')).toBeInTheDocument()
    expect(screen.getByText('تذييل البطاقة')).toBeInTheDocument()
  })

  it('renders Separator with proper orientation', () => {
    const { rerender } = render(<Separator data-testid="sep" />)
    const sep = screen.getByTestId('sep')
    expect(sep).toBeInTheDocument()
    expect(sep).toHaveClass('bg-border')
    expect(sep).toHaveClass('h-[1px]')
    expect(sep).toHaveClass('w-full')

    rerender(<Separator data-testid="sep" orientation="vertical" />)
    expect(sep).toHaveClass('h-full')
    expect(sep).toHaveClass('w-[1px]')
  })

  it('renders Skeleton with pulse animation', () => {
    render(<Skeleton data-testid="skel" className="h-4 w-20" />)
    const skel = screen.getByTestId('skel')
    expect(skel).toBeInTheDocument()
    expect(skel).toHaveClass('animate-pulse')
    expect(skel).toHaveClass('bg-muted')
  })

  it('renders Breadcrumb with items', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">الرئيسية</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>الطلبات</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
    expect(screen.getByText('الرئيسية')).toBeInTheDocument()
    expect(screen.getByText('الطلبات')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument()
  })

  it('renders ScrollArea with content', () => {
    render(
      <ScrollArea data-testid="scroll-area" className="h-32 w-48">
        <div>محتوى قابل للتمرير</div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    )
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument()
    expect(screen.getByText('محتوى قابل للتمرير')).toBeInTheDocument()
  })
})
