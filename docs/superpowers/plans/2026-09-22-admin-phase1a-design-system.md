# Katteyes Admin Phase 1A — Design System & Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the foundational Katteyes Admin Design System, including semantic CSS variable tokens, standard shadcn `components.json` configuration, and the complete suite of atomic UI primitives with strict RTL, accessibility, and React 19 compatibility.

**Architecture:** Configure semantic tokens in `src/index.css` mapped through `tailwind.config.js` to ensure the UI remains brand-agnostic with Katteyes luxury amber (`#D97706` / `32 95% 44%`) as canonical primary. Implement all shadcn UI primitives in `src/components/ui/` using Radix UI primitives, Lucide React, and CVA, verifying isolation with zero regressions across existing storefront and admin pages.

**Tech Stack:** React 19, Vite, Tailwind CSS, Radix UI Primitives, Lucide React, Class Variance Authority (CVA), Recharts v3, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-22-admin-redesign-phase1-design.md`

## Global Constraints
- Canonical Brand Primary: `#D97706` (`32 95% 44%`).
- Zero hardcoded color names (e.g. `amber-600` or `zinc-900`) inside reusable UI primitives; all use semantic tokens (`bg-primary`, `text-foreground`, `bg-card`, `border-border`, etc.).
- Dedicated Sidebar semantic variables must be defined (`--sidebar-background`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-border`, etc.).
- Use standard shadcn convention `--destructive` / `--destructive-foreground` for hazardous actions, while retaining `--success`, `--warning`, `--info` as status tokens.
- Directional icon mirroring applies exclusively to directional icons (`ChevronLeft`, `ChevronRight`, `ArrowLeft`, `ArrowRight`, `PanelLeft`, `PanelRight`); content icons (`Search`, `Trash2`, `Settings`, etc.) must never be rotated.
- Strict Accessibility baseline: keyboard navigation, visible focus rings (`focus-visible:ring-2`), form labeling (`htmlFor`/`id`), overlay focus trapping, and contrast compliance.
- No modifications to existing store pages or admin page logic in Phase 1A.
- Verification gate: `npm run lint`, `npm run test`, and `npm run build` (`tsc -b && vite build`) must pass cleanly.

---

### Task 1: Semantic Design Tokens, Tailwind Theme & `components.json`

**Files:**
- Create: `web/components.json`
- Modify: `web/src/index.css`
- Modify: `web/tailwind.config.js`
- Test: `web/src/__tests__/tokens/design-tokens.test.ts`

**Interfaces:**
- Consumes: Tailwind CSS theme configuration, `@fontsource/tajawal`
- Produces: Semantic CSS variables in `:root`, Tailwind semantic utilities (`bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `bg-card`, `border-border`, `bg-destructive`, `bg-sidebar-background`, etc.)

- [ ] **Step 1: Write test verifying semantic tokens are exposed**

```typescript
// web/src/__tests__/tokens/design-tokens.test.ts
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Admin Semantic Design Tokens', () => {
  it('defines required semantic tokens in index.css', () => {
    const cssPath = path.resolve(__dirname, '../../index.css')
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    const requiredTokens = [
      '--background',
      '--foreground',
      '--card',
      '--card-foreground',
      '--primary',
      '--primary-foreground',
      '--destructive',
      '--destructive-foreground',
      '--success',
      '--warning',
      '--info',
      '--sidebar-background',
      '--sidebar-foreground',
      '--sidebar-primary',
      '--sidebar-border',
      '--border',
      '--input',
      '--ring',
      '--radius',
    ]

    for (const token of requiredTokens) {
      expect(cssContent).toContain(token)
    }

    // Check canonical primary HSL 32 95% 44%
    expect(cssContent).toMatch(/--primary:\s*32\s+95%\s+44%/)
  })

  it('contains valid components.json configuration', () => {
    const configPath = path.resolve(__dirname, '../../../components.json')
    expect(fs.existsSync(configPath)).toBe(true)
    const json = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    expect(json.tailwind.cssVariables).toBe(true)
    expect(json.aliases.ui).toBe('@/components/ui')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix web run test web/src/__tests__/tokens/design-tokens.test.ts`
Expected: FAIL (missing tokens and `components.json`)

- [ ] **Step 3: Implement `components.json`, `index.css` tokens, and `tailwind.config.js`**

Create `web/components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

Update `web/src/index.css` to declare the semantic `:root` tokens as per §2.1 of the design spec.
Update `web/tailwind.config.js` to map colors to `hsl(var(--...))` variables.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix web run test web/src/__tests__/tokens/design-tokens.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/components.json web/src/index.css web/tailwind.config.js web/src/__tests__/tokens/design-tokens.test.ts
git commit -m "feat(admin): configure semantic design tokens and components.json"
```

---

### Task 2: Core Layout & Feedback Primitives (`Card`, `Separator`, `ScrollArea`, `Breadcrumb`, `Skeleton`)

**Files:**
- Create: `web/src/components/ui/card.tsx`
- Create: `web/src/components/ui/separator.tsx`
- Create: `web/src/components/ui/scroll-area.tsx`
- Create: `web/src/components/ui/breadcrumb.tsx`
- Create: `web/src/components/ui/skeleton.tsx`
- Test: `web/src/__tests__/components/ui/layout-primitives.test.tsx`

**Interfaces:**
- Consumes: `@radix-ui/react-separator`, `@radix-ui/react-scroll-area`, `cn` from `@/lib/utils`
- Produces:
  - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
  - `Separator`
  - `ScrollArea`, `ScrollBar`
  - `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`
  - `Skeleton`

- [ ] **Step 1: Write test for layout and feedback primitives**

```typescript
// web/src/__tests__/components/ui/layout-primitives.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from '@/components/ui/breadcrumb'

describe('Layout and Feedback Primitives', () => {
  it('renders Card with header and content', () => {
    render(
      <Card data-testid="test-card">
        <CardHeader>
          <CardTitle>لوحة التحكم</CardTitle>
        </CardHeader>
        <CardContent>المحتوى</CardContent>
      </Card>
    )
    expect(screen.getByTestId('test-card')).toBeInTheDocument()
    expect(screen.getByText('لوحة التحكم')).toBeInTheDocument()
  })

  it('renders Separator with proper orientation', () => {
    render(<Separator data-testid="sep" />)
    expect(screen.getByTestId('sep')).toBeInTheDocument()
  })

  it('renders Skeleton with pulse animation', () => {
    render(<Skeleton data-testid="skel" className="h-4 w-20" />)
    expect(screen.getByTestId('skel')).toHaveClass('animate-pulse')
  })

  it('renders Breadcrumb with items', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>الرئيسية</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
    expect(screen.getByText('الرئيسية')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix web run test web/src/__tests__/components/ui/layout-primitives.test.tsx`
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement primitives**

Install `@radix-ui/react-separator` and `@radix-ui/react-scroll-area` if needed:
`npm --prefix web install @radix-ui/react-separator @radix-ui/react-scroll-area`
Implement:
- `card.tsx` with `rounded-2xl border bg-card text-card-foreground shadow-xs`.
- `separator.tsx` with Radix Separator.
- `scroll-area.tsx` with Radix ScrollArea.
- `breadcrumb.tsx` with accessible navigation markup and directional chevron mirroring for RTL.
- `skeleton.tsx` with `animate-pulse rounded-md bg-muted`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix web run test web/src/__tests__/components/ui/layout-primitives.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/ui/card.tsx web/src/components/ui/separator.tsx web/src/components/ui/scroll-area.tsx web/src/components/ui/breadcrumb.tsx web/src/components/ui/skeleton.tsx web/src/__tests__/components/ui/layout-primitives.test.tsx web/package.json web/package-lock.json
git commit -m "feat(ui): add Card, Separator, ScrollArea, Breadcrumb, and Skeleton primitives"
```

---

### Task 3: Interactive & Form Controls (`Button`, `Badge`, `Input`, `Label`, `Select`, `Tabs`)

**Files:**
- Create: `web/src/components/ui/badge.tsx`
- Create: `web/src/components/ui/input.tsx`
- Create: `web/src/components/ui/label.tsx`
- Create: `web/src/components/ui/select.tsx`
- Create: `web/src/components/ui/tabs.tsx`
- Modify: `web/src/components/ui/Button.tsx` (or standardize `button.tsx` with backward compatibility)
- Test: `web/src/__tests__/components/ui/form-primitives.test.tsx`

**Interfaces:**
- Consumes: `@radix-ui/react-label`, `@radix-ui/react-select`, `@radix-ui/react-tabs`, `cva`, `cn`
- Produces:
  - `Button`, `buttonVariants` (variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`)
  - `Badge`, `badgeVariants` (variants: `default`, `secondary`, `destructive`, `outline`, `success`, `warning`, `info`)
  - `Input` (accessible input with focus rings and semantic styling)
  - `Label`
  - `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
  - `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`

- [ ] **Step 1: Write test for interactive and form primitives**

```typescript
// web/src/__tests__/components/ui/form-primitives.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

describe('Form and Interactive Primitives', () => {
  it('renders Button with destructive variant and focus ring', () => {
    render(<Button variant="destructive">حذف</Button>)
    const btn = screen.getByRole('button', { name: 'حذف' })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveClass('bg-destructive')
    expect(btn).toHaveClass('focus-visible:ring-2')
  })

  it('renders Badge with status variants', () => {
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

  it('renders Input linked to Label for a11y', () => {
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
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix web run test web/src/__tests__/components/ui/form-primitives.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement form and interactive primitives**

Install `@radix-ui/react-label`, `@radix-ui/react-select`, `@radix-ui/react-tabs`:
`npm --prefix web install @radix-ui/react-label @radix-ui/react-select @radix-ui/react-tabs`
Implement:
- `badge.tsx` with standard variants including semantic `success`, `warning`, `info`, and `destructive`.
- `input.tsx` with `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- `label.tsx` using Radix Label with `peer-disabled:cursor-not-allowed`.
- `select.tsx` with Radix Select, supporting RTL chevrons.
- `tabs.tsx` with Radix Tabs.
- Update `Button.tsx` (and `button.tsx`) to support `destructive`, `default`, `outline`, `secondary`, `ghost`, `link`, maintaining backward-compatible `primary` alias for existing calls.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix web run test web/src/__tests__/components/ui/form-primitives.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/ui/badge.tsx web/src/components/ui/input.tsx web/src/components/ui/label.tsx web/src/components/ui/select.tsx web/src/components/ui/tabs.tsx web/src/components/ui/Button.tsx web/src/__tests__/components/ui/form-primitives.test.tsx web/package.json web/package-lock.json
git commit -m "feat(ui): add Badge, Input, Label, Select, Tabs, and update Button variants"
```

---

### Task 4: Overlays & Accessibility Primitives (`DropdownMenu`, `Dialog`, `Sheet`, `Tooltip`, `Avatar`)

**Files:**
- Create: `web/src/components/ui/dropdown-menu.tsx`
- Create: `web/src/components/ui/dialog.tsx`
- Create: `web/src/components/ui/sheet.tsx`
- Create: `web/src/components/ui/tooltip.tsx`
- Create: `web/src/components/ui/avatar.tsx`
- Test: `web/src/__tests__/components/ui/overlay-primitives.test.tsx`

**Interfaces:**
- Consumes: `@radix-ui/react-dropdown-menu`, `@radix-ui/react-dialog`, `@radix-ui/react-tooltip`, `@radix-ui/react-avatar`, `cva`, `cn`
- Produces:
  - `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`
  - `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
  - `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`
  - `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`
  - `Avatar`, `AvatarImage`, `AvatarFallback`

- [ ] **Step 1: Write test for overlay and a11y primitives**

```typescript
// web/src/__tests__/components/ui/overlay-primitives.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

describe('Overlay and A11y Primitives', () => {
  it('renders Avatar with fallback initials', () => {
    render(
      <Avatar>
        <AvatarFallback>KT</AvatarFallback>
      </Avatar>
    )
    expect(screen.getByText('KT')).toBeInTheDocument()
  })

  it('renders Dialog trigger and opens content', () => {
    render(
      <Dialog>
        <DialogTrigger>افتح النافذة</DialogTrigger>
        <DialogContent>
          <DialogTitle>عنوان النافذة</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('افتح النافذة')).toBeInTheDocument()
  })

  it('renders Sheet component without throwing', () => {
    render(
      <Sheet>
        <SheetTrigger>عرض التفاصيل</SheetTrigger>
        <SheetContent side="right">
          <SheetTitle>تفاصيل الطلب</SheetTitle>
        </SheetContent>
      </Sheet>
    )
    expect(screen.getByText('عرض التفاصيل')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix web run test web/src/__tests__/components/ui/overlay-primitives.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement overlay primitives**

Install `@radix-ui/react-tooltip` and `@radix-ui/react-avatar`:
`npm --prefix web install @radix-ui/react-tooltip @radix-ui/react-avatar`
Implement:
- `dialog.tsx` using `@radix-ui/react-dialog` with focus trapping, `Escape` key dismiss, and subtle backdrops.
- `sheet.tsx` supporting sliding sides (`right` for RTL start, `left` for RTL end, `top`, `bottom`).
- `dropdown-menu.tsx` with keyboard navigation, submenus, and separators.
- `tooltip.tsx` with TooltipProvider.
- `avatar.tsx` with image and fallback.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix web run test web/src/__tests__/components/ui/overlay-primitives.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/ui/dropdown-menu.tsx web/src/components/ui/dialog.tsx web/src/components/ui/sheet.tsx web/src/components/ui/tooltip.tsx web/src/components/ui/avatar.tsx web/src/__tests__/components/ui/overlay-primitives.test.tsx web/package.json web/package-lock.json
git commit -m "feat(ui): add Dialog, Sheet, DropdownMenu, Tooltip, and Avatar primitives"
```

---

### Task 5: Data & Visualization Primitives (`Table`, `Chart` with Recharts v3)

**Files:**
- Create: `web/src/components/ui/table.tsx`
- Create: `web/src/components/ui/chart.tsx`
- Test: `web/src/__tests__/components/ui/data-primitives.test.tsx`

**Interfaces:**
- Consumes: `recharts`, `cn` from `@/lib/utils`
- Produces:
  - `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`
  - `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartConfig`

- [ ] **Step 1: Write test for Table and Chart primitives**

```typescript
// web/src/__tests__/components/ui/data-primitives.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'

describe('Data and Visualization Primitives', () => {
  it('renders styled semantic Table', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>المنتج</TableHead>
            <TableHead>السعر</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>فستان كلاسيكي</TableCell>
            <TableCell>25,000 YER</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByText('فستان كلاسيكي')).toBeInTheDocument()
    expect(screen.getByText('25,000 YER')).toBeInTheDocument()
  })

  it('renders ChartContainer with config', () => {
    const config: ChartConfig = {
      sales: {
        label: 'المبيعات',
        color: 'hsl(var(--primary))',
      },
    }

    render(
      <ChartContainer config={config} className="h-40 w-full" data-testid="chart-box">
        <div data-testid="mock-chart">رسم بياني</div>
      </ChartContainer>
    )

    expect(screen.getByTestId('chart-box')).toBeInTheDocument()
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix web run test web/src/__tests__/components/ui/data-primitives.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement Table and Chart primitives**

Install `recharts`:
`npm --prefix web install recharts`
Implement:
- `table.tsx` with clean spacing, hover highlights (`hover:bg-muted/50`), and `text-start`.
- `chart.tsx` matching official shadcn Chart specifications for Recharts v3 (managing CSS variable themes, responsive container, tooltips, and legends).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix web run test web/src/__tests__/components/ui/data-primitives.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/ui/table.tsx web/src/components/ui/chart.tsx web/src/__tests__/components/ui/data-primitives.test.tsx web/package.json web/package-lock.json
git commit -m "feat(ui): add Table and official shadcn Chart primitives with Recharts"
```

---

### Task 6: Non-Regression & Verification Gate

**Files:**
- Modify/Verify: Whole repo
- Test: Full project test suites

- [ ] **Step 1: Run linter across the entire project**

Run: `npm --prefix web run lint`
Expected: 0 errors

- [ ] **Step 2: Run all unit and integration tests**

Run: `npm --prefix web run test`
Expected: All existing and new tests pass (0 failures)

- [ ] **Step 3: Run production build and type checking**

Run: `npm --prefix web run build`
Expected: `tsc -b` succeeds without any type errors, and Vite builds production bundles successfully.

- [ ] **Step 4: Verify zero diffs on existing pages**

Run: `git status -s web/src/pages`
Expected: Empty (zero existing pages touched during Phase 1A).

- [ ] **Step 5: Tag/Commit Phase 1A milestone completion**

```bash
git commit --allow-empty -m "chore(milestone): complete Phase 1A Admin Design System with 100% verified non-regression"
```
