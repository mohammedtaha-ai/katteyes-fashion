# Katteyes Admin Phase 1A — Design System & Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the foundational Katteyes Admin Design System, including semantic CSS variable tokens, standard shadcn `components.json` configuration (new-york style with RTL), unified `radix-ui` normalization, and the complete suite of atomic UI primitives with strict RTL, accessibility (WCAG AA), and React 19 compatibility.

**Architecture:** Normalize on the modern unified `radix-ui` package (supported natively in React 19) since audit confirms zero legacy imports exist in `web/src`. Configure semantic tokens in `src/index.css` mapped through `tailwind.config.js` with canonical Hexes as source of truth and derived HSLs ensuring all status pairs strictly satisfy WCAG AA (>= 4.5:1). Retain `Button.tsx` as canonical in Phase 1A to eliminate NTFS casing collision hazards on Windows and maintain zero diffs on existing pages.

**Tech Stack:** React 19, Vite, Tailwind CSS, Unified `radix-ui`, Lucide React, Class Variance Authority (CVA), Recharts v3, Vitest, `@testing-library/user-event`.

**Spec:** `docs/superpowers/specs/2026-09-22-admin-redesign-phase1-design.md`

## Global Constraints
- Canonical Brand Primary: `#D97706` (`32.13 94.62% 43.73%`), paired with near-black `--primary-foreground: 222 47% 11%` (~5.2:1 contrast, satisfying WCAG AA >= 4.5:1).
- All semantic status foreground/background pairs strictly satisfy WCAG AA (>= 4.5:1) verified via automated contrast calculations:
  - `--destructive: 0 72.22% 50.59%` (`#DC2626`) with `--destructive-foreground: 0 0% 100%` (5.50:1).
  - `--success: 142.43 71.81% 29.22%` (`#15803D`) with `--success-foreground: 0 0% 100%` (5.04:1).
  - `--warning: 37.69 92.13% 50.20%` (`#F59E0B`) with `--warning-foreground: 222 47% 11%` (7.55:1).
  - `--info: 201.27 96.34% 32.16%` (`#0369A1`) with `--info-foreground: 0 0% 100%` (5.95:1).
- Zero hardcoded color names (e.g. `amber-600` or `zinc-900`) inside reusable UI primitives; all use semantic tokens (`bg-primary`, `text-primary-foreground`, `bg-card`, `border-border`, etc.).
- Dedicated Sidebar semantic variables must be defined (`--sidebar-background`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-border`, etc.).
- Explicit definition of `shadow-xs: "0 1px 3px rgba(0,0,0,0.05)"` in `tailwind.config.js`.
- Configuration in `components.json` must include `"style": "new-york"`, `"baseColor": "zinc"`, `"rtl": true`, and `"iconLibrary": "lucide"`.
- **Constraint on Button.tsx:** Retain canonical `Button.tsx` (uppercase) throughout Phase 1A to avoid Windows NTFS case collision hazards and ensure 100% zero diffs on existing pages. `shadcn add button` is strictly forbidden during Phase 1A. Lowercase migration is deferred to a dedicated future refactor.
- Directional icon mirroring applies exclusively to directional icons (`ChevronLeft`, `ChevronRight`, `ArrowLeft`, `ArrowRight`, `PanelLeft`, `PanelRight`); content icons (`Search`, `Trash2`, `Settings`, etc.) must never be rotated.
- Strict Accessibility baseline verified with real behavioral tests (`@testing-library/user-event`): keyboard navigation, Escape overlay dismissal, focus management and restoration, form labeling (`htmlFor`/`id`), and non-color state indicators.
- Baseline non-regression verification: `git diff --name-only 4044ae6fc3a36c2a8a42f1f596a4084ca6f0d862..HEAD -- web/src/pages` must be empty.
- Verification gate: `npm run lint`, `npm run test`, and `npm run build` (`tsc -b && vite build`) must pass cleanly.

---

### Task 0: Determine and Normalize Radix Strategy & Prerequisites

**Files:**
- Modify: `web/package.json`
- Test: Audit and environment check

**Interfaces:**
- Consumes: `web/src` codebase and `package.json`
- Produces: Normalized Radix UI strategy using unified `radix-ui` package, and installed `@testing-library/user-event` devDependency.

- [ ] **Step 1: Audit codebase for existing Radix imports**

Run audit:
Check for any existing imports: `grep -rn '@radix-ui/react-\|from "radix-ui"' web/src`
Verify: Zero results found in `web/src`. Since zero existing code depends on individual `@radix-ui/react-*` packages, adopt unified `radix-ui` cleanly.

- [ ] **Step 2: Install unified `radix-ui` and `@testing-library/user-event`**

Run:
```bash
npm --prefix web install radix-ui
npm --prefix web install --save-dev @testing-library/user-event
```
Remove unreferenced individual `@radix-ui/react-*` dependencies from `web/package.json` to keep dependencies clean and unified.

- [ ] **Step 3: Commit**

```bash
git add web/package.json web/package-lock.json
git commit -m "chore(deps): adopt unified radix-ui and install @testing-library/user-event"
```

---

### Task 1: Semantic Design Tokens, Tailwind Theme & `components.json`

**Files:**
- Create: `web/components.json`
- Modify: `web/src/index.css`
- Modify: `web/tailwind.config.js`
- Test: `web/src/__tests__/tokens/design-tokens.test.ts`

**Interfaces:**
- Consumes: Tailwind CSS theme configuration, `@fontsource/tajawal`
- Produces: Semantic CSS variables in `:root`, Tailwind semantic utilities (`bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `bg-card`, `border-border`, `bg-destructive`, `bg-sidebar-background`, `shadow-xs`, etc.)

- [ ] **Step 1: Write ESM-safe test verifying CSS variables, exact WCAG contrast calculations, and Tailwind theme mappings**

```typescript
// web/src/__tests__/tokens/design-tokens.test.ts
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import tailwindConfig from '../../../tailwind.config.js'

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrast(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = getLuminance(...rgb1)
  const l2 = getLuminance(...rgb2)
  const brightest = Math.max(l1, l2)
  const darkest = Math.min(l1, l2)
  return (brightest + 0.05) / (darkest + 0.05)
}

describe('Admin Semantic Design Tokens & WCAG Contrast', () => {
  it('defines required semantic tokens in index.css with exact calibrated values', () => {
    const cssPath = fileURLToPath(new URL('../../index.css', import.meta.url))
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    // Exact regex assertions for calibrated HSL values
    expect(cssContent).toMatch(/--primary\s*:\s*32\.13\s+94\.62%\s+43\.73%\s*;/)
    expect(cssContent).toMatch(/--primary-foreground\s*:\s*222\s+47%\s+11%\s*;/)
    expect(cssContent).toMatch(/--destructive\s*:\s*0\s+72\.22%\s+50\.59%\s*;/)
    expect(cssContent).toMatch(/--destructive-foreground\s*:\s*0\s+0%\s+100%\s*;/)
    expect(cssContent).toMatch(/--success\s*:\s*142\.43\s+71\.81%\s+29\.22%\s*;/)
    expect(cssContent).toMatch(/--success-foreground\s*:\s*0\s+0%\s+100%\s*;/)
    expect(cssContent).toMatch(/--warning\s*:\s*37\.69\s+92\.13%\s+50\.20%\s*;/)
    expect(cssContent).toMatch(/--warning-foreground\s*:\s*222\s+47%\s+11%\s*;/)
    expect(cssContent).toMatch(/--info\s*:\s*201\.27\s+96\.34%\s+32\.16%\s*;/)
    expect(cssContent).toMatch(/--info-foreground\s*:\s*0\s+0%\s+100%\s*;/)
    expect(cssContent).toMatch(/--sidebar-background\s*:\s*0\s+0%\s+100%\s*;/)
    expect(cssContent).toMatch(/--sidebar-foreground\s*:\s*222\s+47%\s+11%\s*;/)
    expect(cssContent).toMatch(/--sidebar-primary\s*:\s*32\.13\s+94\.62%\s+43\.73%\s*;/)
    expect(cssContent).toMatch(/--radius\s*:\s*1rem\s*;/)
  })

  it('guarantees WCAG AA contrast (>= 4.5:1) across all solid semantic pairs', () => {
    const white: [number, number, number] = [255, 255, 255]
    const nearBlack: [number, number, number] = [15, 23, 42] // #0F172A

    const primaryHex: [number, number, number] = [217, 119, 6] // #D97706
    const destructiveHex: [number, number, number] = [220, 38, 38] // #DC2626
    const successHex: [number, number, number] = [21, 128, 61] // #15803D
    const warningHex: [number, number, number] = [245, 158, 11] // #F59E0B
    const infoHex: [number, number, number] = [3, 105, 161] // #0369A1

    expect(getContrast(primaryHex, nearBlack)).toBeGreaterThanOrEqual(4.5)
    expect(getContrast(destructiveHex, white)).toBeGreaterThanOrEqual(4.5)
    expect(getContrast(successHex, white)).toBeGreaterThanOrEqual(4.5)
    expect(getContrast(warningHex, nearBlack)).toBeGreaterThanOrEqual(4.5)
    expect(getContrast(infoHex, white)).toBeGreaterThanOrEqual(4.5)
  })

  it('contains valid components.json configuration with new-york style, zinc baseColor, and rtl: true', () => {
    const configPath = fileURLToPath(new URL('../../../components.json', import.meta.url))
    expect(fs.existsSync(configPath)).toBe(true)
    const json = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    expect(json.style).toBe('new-york')
    expect(json.tailwind.baseColor).toBe('zinc')
    expect(json.rtl).toBe(true)
    expect(json.iconLibrary).toBe('lucide')
    expect(json.tailwind.cssVariables).toBe(true)
    expect(json.aliases.ui).toBe('@/components/ui')
  })

  it('asserts Tailwind config resolves semantic colors and shadow-xs', () => {
    const extendColors = tailwindConfig.theme?.extend?.colors as any
    expect(extendColors).toBeDefined()
    expect(extendColors.primary?.DEFAULT).toContain('var(--primary)')
    expect(extendColors.primary?.foreground).toContain('var(--primary-foreground)')
    expect(extendColors.background).toContain('var(--background)')
    expect(extendColors.foreground).toContain('var(--foreground)')
    expect(extendColors.card?.DEFAULT).toContain('var(--card)')
    expect(extendColors.border).toContain('var(--border)')
    expect(extendColors.sidebar?.background).toContain('var(--sidebar-background)')

    const extendShadows = tailwindConfig.theme?.extend?.boxShadow as any
    expect(extendShadows?.xs).toBe('0 1px 3px rgba(0,0,0,0.05)')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix web run test -- src/__tests__/tokens/design-tokens.test.ts`
Expected: FAIL (missing tokens, `components.json`, and tailwind mappings)

- [ ] **Step 3: Implement `components.json`, `index.css` tokens, and `tailwind.config.js`**

Create `web/components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "rtl": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

Update `web/src/index.css` with semantic `:root` tokens including near-black `--primary-foreground`, sidebar tokens, and calibrated status pairs.
Update `web/tailwind.config.js` with `hsl(var(--...))` mappings and `boxShadow: { xs: "0 1px 3px rgba(0,0,0,0.05)" }`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix web run test -- src/__tests__/tokens/design-tokens.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/components.json web/src/index.css web/tailwind.config.js web/src/__tests__/tokens/design-tokens.test.ts
git commit -m "feat(admin): configure semantic tokens, shadow-xs, and components.json (new-york style with rtl)"
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
- Consumes: `radix-ui` (Separator, ScrollArea), `cn` from `@/lib/utils`
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
  it('renders Card with header and content using semantic classes', () => {
    render(
      <Card data-testid="test-card">
        <CardHeader>
          <CardTitle>لوحة التحكم</CardTitle>
        </CardHeader>
        <CardContent>المحتوى</CardContent>
      </Card>
    )
    const card = screen.getByTestId('test-card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('bg-card')
    expect(card).toHaveClass('shadow-xs')
    expect(screen.getByText('لوحة التحكم')).toBeInTheDocument()
  })

  it('renders Separator with proper orientation', () => {
    render(<Separator data-testid="sep" />)
    expect(screen.getByTestId('sep')).toBeInTheDocument()
    expect(screen.getByTestId('sep')).toHaveClass('bg-border')
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

Run: `npm --prefix web run test -- src/__tests__/components/ui/layout-primitives.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement primitives using unified `radix-ui`**

Implement `card.tsx`, `separator.tsx`, `scroll-area.tsx`, `breadcrumb.tsx`, and `skeleton.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix web run test -- src/__tests__/components/ui/layout-primitives.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/ui/card.tsx web/src/components/ui/separator.tsx web/src/components/ui/scroll-area.tsx web/src/components/ui/breadcrumb.tsx web/src/components/ui/skeleton.tsx web/src/__tests__/components/ui/layout-primitives.test.tsx
git commit -m "feat(ui): add Card, Separator, ScrollArea, Breadcrumb, and Skeleton primitives via unified radix-ui"
```

---

### Task 3: Interactive & Form Controls (`Button.tsx`, `badge.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `tabs.tsx`)

**Files:**
- Modify: `web/src/components/ui/Button.tsx` (canonical uppercase, updated with semantic tokens & backward-compatible variants)
- Create: `web/src/components/ui/badge.tsx`
- Create: `web/src/components/ui/input.tsx`
- Create: `web/src/components/ui/label.tsx`
- Create: `web/src/components/ui/select.tsx`
- Create: `web/src/components/ui/tabs.tsx`
- Test: `web/src/__tests__/components/ui/form-primitives.test.tsx`

**Interfaces:**
- Consumes: `radix-ui` (Label, Select, Tabs), `cva`, `cn`
- Produces:
  - `Button.tsx`: `Button`, `buttonVariants` (variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, plus alias `primary`)
  - `badge.tsx`: `Badge`, `badgeVariants` (variants: `default`, `secondary`, `destructive`, `outline`, `success`, `warning`, `info`)
  - `input.tsx`: `Input`
  - `label.tsx`: `Label`
  - `select.tsx`: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
  - `tabs.tsx`: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`

- [ ] **Step 1: Write behavioral test for form controls, Select, Tabs, and Button with userEvent**

```typescript
// web/src/__tests__/components/ui/form-primitives.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix web run test -- src/__tests__/components/ui/form-primitives.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement primitives**

Update `Button.tsx` in place with semantic variants (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, plus `primary` alias).
Implement `badge.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, and `tabs.tsx` using unified `radix-ui`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix web run test -- src/__tests__/components/ui/form-primitives.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/ui/Button.tsx web/src/components/ui/badge.tsx web/src/components/ui/input.tsx web/src/components/ui/label.tsx web/src/components/ui/select.tsx web/src/components/ui/tabs.tsx web/src/__tests__/components/ui/form-primitives.test.tsx
git commit -m "feat(ui): update canonical Button and add badge, input, label, select, and tabs via unified radix-ui"
```

---

### Task 4: Overlays & Accessibility Primitives with UserEvent (`dialog.tsx`, `sheet.tsx`, `dropdown-menu.tsx`, `tooltip.tsx`, `avatar.tsx`)

**Files:**
- Create: `web/src/components/ui/dropdown-menu.tsx`
- Create: `web/src/components/ui/dialog.tsx`
- Create: `web/src/components/ui/sheet.tsx`
- Create: `web/src/components/ui/tooltip.tsx`
- Create: `web/src/components/ui/avatar.tsx`
- Test: `web/src/__tests__/components/ui/overlay-primitives.test.tsx`

**Interfaces:**
- Consumes: `radix-ui` (Dialog, DropdownMenu, Tooltip, Avatar), `cva`, `cn`
- Produces:
  - `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuSeparator`
  - `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
  - `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`
  - `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`
  - `Avatar`, `AvatarImage`, `AvatarFallback`

- [ ] **Step 1: Write comprehensive behavioral A11y tests for overlays with userEvent**

```typescript
// web/src/__tests__/components/ui/overlay-primitives.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix web run test -- src/__tests__/components/ui/overlay-primitives.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement overlay primitives using unified `radix-ui`**

Implement `dialog.tsx`, `sheet.tsx`, `dropdown-menu.tsx`, `tooltip.tsx`, and `avatar.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix web run test -- src/__tests__/components/ui/overlay-primitives.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/ui/dropdown-menu.tsx web/src/components/ui/dialog.tsx web/src/components/ui/sheet.tsx web/src/components/ui/tooltip.tsx web/src/components/ui/avatar.tsx web/src/__tests__/components/ui/overlay-primitives.test.tsx
git commit -m "feat(ui): add accessible Dialog, Sheet, DropdownMenu, Tooltip, and Avatar primitives via unified radix-ui"
```

---

### Task 5: Data & Visualization Primitives (`table.tsx`, `chart.tsx` with Recharts v3)

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

Run: `npm --prefix web run test -- src/__tests__/components/ui/data-primitives.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement Table and Chart primitives**

Install `recharts` only if missing:
`npm --prefix web install recharts`
Implement:
- `table.tsx` with clean spacing, border styles, and RTL alignment.
- `chart.tsx` matching official shadcn Chart specifications for Recharts v3.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix web run test -- src/__tests__/components/ui/data-primitives.test.tsx`
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

- [ ] **Step 4: Verify zero diffs on existing pages against baseline commit**

Run: `git diff --name-only 4044ae6fc3a36c2a8a42f1f596a4084ca6f0d862..HEAD -- web/src/pages`
Expected: Empty output (confirms zero existing pages were modified during Phase 1A).

- [ ] **Step 5: Tag milestone completion**

Run: `git tag admin-phase-1a-complete`
