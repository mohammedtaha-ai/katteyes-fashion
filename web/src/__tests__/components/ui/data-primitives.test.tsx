import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  ChartStyle,
  type ChartConfig,
} from '@/components/ui/chart'

beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

describe('Data and Visualization Primitives', () => {
  describe('Table primitive', () => {
    it('renders styled semantic Table with header, body, footer, and caption', () => {
      render(
        <Table data-testid="test-table">
          <TableCaption>قائمة الطلبات الأخيرة</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="th-product">المنتج</TableHead>
              <TableHead>السعر</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow data-testid="table-row">
              <TableCell data-testid="td-product">فستان كلاسيكي</TableCell>
              <TableCell>25,000 YER</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>المجموع</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )

      expect(screen.getByText('فستان كلاسيكي')).toBeInTheDocument()
      expect(screen.getByText('25,000 YER')).toBeInTheDocument()
      expect(screen.getByText('قائمة الطلبات الأخيرة')).toBeInTheDocument()
      expect(screen.getByText('المجموع')).toBeInTheDocument()

      const row = screen.getByTestId('table-row')
      expect(row).toHaveClass('border-b')
      expect(row).toHaveClass('hover:bg-muted/50')

      // RTL alignment check (text-start)
      const th = screen.getByTestId('th-product')
      expect(th).toHaveClass('text-start')
      expect(th).toHaveClass('text-muted-foreground')

      const td = screen.getByTestId('td-product')
      expect(td).toHaveClass('p-4')
      expect(td).toHaveClass('align-middle')
    })
  })

  describe('Chart primitives', () => {
    it('renders ChartContainer with config and injects custom color CSS variables', () => {
      const config: ChartConfig = {
        sales: {
          label: 'المبيعات',
          color: 'hsl(var(--primary))',
        },
        visitors: {
          label: 'الزوار',
          color: '#e11d48',
        },
      }

      render(
        <ChartContainer config={config} className="h-40 w-full" data-testid="chart-box">
          <div data-testid="mock-chart">رسم بياني</div>
        </ChartContainer>
      )

      const chartBox = screen.getByTestId('chart-box')
      expect(chartBox).toBeInTheDocument()
      expect(screen.getByTestId('mock-chart')).toBeInTheDocument()

      // Verify style tag or inline style sets the CSS variables
      expect(chartBox.innerHTML).toContain('--color-sales')
      expect(chartBox.innerHTML).toContain('--color-visitors')
    })

    it('renders ChartTooltipContent when payload is provided', () => {
      const config: ChartConfig = {
        sales: {
          label: 'المبيعات',
          color: 'hsl(var(--primary))',
        },
      }

      render(
        <ChartContainer config={config}>
          <ChartTooltipContent
            active={true}
            payload={[
              {
                name: 'sales',
                value: 120,
                dataKey: 'sales',
                color: 'hsl(var(--primary))',
              },
            ]}
            label="يناير"
          />
        </ChartContainer>
      )

      expect(screen.getByText('يناير')).toBeInTheDocument()
      expect(screen.getByText('المبيعات')).toBeInTheDocument()
      expect(screen.getByText('120')).toBeInTheDocument()
    })

    it('renders ChartLegendContent with config items', () => {
      const config: ChartConfig = {
        sales: {
          label: 'المبيعات',
          color: '#3b82f6',
        },
      }

      render(
        <ChartContainer config={config}>
          <ChartLegendContent
            payload={[
              {
                value: 'sales',
                dataKey: 'sales',
                color: '#3b82f6',
              },
            ]}
          />
        </ChartContainer>
      )

      expect(screen.getByText('المبيعات')).toBeInTheDocument()
    })

    it('renders ChartStyle with theme colors', () => {
      const config: ChartConfig = {
        revenue: {
          label: 'الإيرادات',
          theme: {
            light: '#22c55e',
            dark: '#16a34a',
          },
        },
      }

      const { container } = render(<ChartStyle id="test-chart" config={config} />)
      const styleEl = container.querySelector('style')
      expect(styleEl).not.toBeNull()
      expect(styleEl?.innerHTML).toContain('--color-revenue: #22c55e;')
      expect(styleEl?.innerHTML).toContain('.dark [data-chart=test-chart]')
    })
  })
})
