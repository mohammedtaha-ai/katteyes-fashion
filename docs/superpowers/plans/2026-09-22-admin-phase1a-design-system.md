# Katteyes Admin Phase 1A — Design System & Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the foundational Katteyes Admin Design System, including semantic CSS variable tokens, standard shadcn `components.json` configuration (new-york style), and the complete suite of atomic UI primitives with strict RTL, accessibility (WCAG AA), and React 19 compatibility.

**Architecture:** Configure semantic tokens in `src/index.css` mapped through `tailwind.config.js` to ensure the UI remains brand-agnostic with Katteyes luxury amber (`#D97706` / `32 95% 44%`) as canonical primary paired with near-black text (`222 47% 11%`) for WCAG AA compliance (~5.6:1 contrast). Implement canonical shadcn UI primitives in `src/components/ui/` using individual `@radix-ui/react-*` packages to prevent mixing, retaining `Button.tsx` as canonical in Phase 1A to eliminate NTFS casing collision hazards on Windows and maintain zero diffs on existing pages.

**Tech Stack:** React 19, Vite, Tailwind CSS, Radix UI Primitives, Lucide React, Class Variance Authority (CVA), Recharts v3, Vitest, `@testing-library/user-event`.

**Spec:** `docs/superpowers/specs/2026-09-22-admin-redesign-phase1-design.md`

## Global Constraints
- Canonical Brand Primary: `#D97706` (`32 95% 44%`), paired with near-black `--primary-foreground: 222 47% 11%` (~5.6:1 contrast, satisfying WCAG AA >= 4.5:1).
- All semantic status foreground/background pairs strictly satisfy WCAG AA (>= 4.5:1):
  - `--destructive: 0 72% 51%` (`#DC2626`) with `--destructive-foreground: 0 0% 100%` (5.5:1).
  - `--success: 142 76% 36%` (`#15803D`) with `--success-foreground: 0 0% 100%` (5.25:1).
  - `--warning: 38 92% 50%` (`#F59E0B`) with `--warning-foreground: 222 47% 11%` (7.2:1).
  - `--info: 199 89% 38%` (`#0284C7`) with `--info-foreground: 0 0% 100%` (4.8:1).
- Zero hardcoded color names (e.g. `amber-600` or `zinc-900`) inside reusable UI primitives; all use semantic tokens (`bg-primary`, `text-primary-foreground`, `bg-card`, `border-border`, etc.).
- Dedicated Sidebar semantic variables must be defined (`--sidebar-background`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-border`, etc.).
- Explicit definition of `shadow-xs: "0 1px 3px rgba(0,0,0,0.05)"` in `tailwind.config.js`.
- Retain canonical `Button.tsx` (uppercase) throughout Phase 1A to avoid Windows NTFS case collision hazards and ensure 100% zero diffs on existing pages. Lowercase migration is deferred to a dedicated future step.
- Directional icon mirroring applies exclusively to directional icons (`ChevronLeft`, `ChevronRight`, `ArrowLeft`, `ArrowRight`, `PanelLeft`, `PanelRight`); content icons (`Search`, `Trash2`, `Settings`, etc.) must never be rotated.
- Strict Accessibility baseline verified with real behavioral tests (`@testing-library/user-event`): keyboard navigation, Escape overlay dismissal, focus management and restoration, form labeling (`htmlFor`/`id`), and non-color state indicators.
- Baseline non-regression verification: `git diff --name-only 4044ae6fc3a36c2a8a42f1f596a4084ca6f0d862..HEAD -- web/src/pages` must be empty.
- Verification gate: `npm run lint`, `npm run test`, and `npm run build` (`tsc -b && vite build`) must pass cleanly.
- Dependency hygiene: inspect `package.json` before installing packages; do not touch lockfile redundantly if already installed.

---

### Task 0: Radix UI & shadcn Strategy Verification & Prerequisites

**Files:**
- Modify: `web/package.json`
- Test: Environment check

**Interfaces:**
- Consumes: `web/package.json`
- Produces: Verified Radix UI strategy (individual `@radix-ui/react-*` packages) and installed `@testing-library/user-event` devDependency.

- [ ] **Step 1: Check existing Radix packages and test runner dependencies**

Run: `node -e "const pkg = require('./web/package.json'); console.log({ deps: Object.keys(pkg.dependencies).filter(k => k.includes('radix')), dev: Object.keys(pkg.devDependencies) })"`
Verify: Confirms individual `@radix-ui/react-*` packages are present (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, etc.) and `@testing-library/user-event` needs to be installed in devDependencies.

- [ ] **Step 2: Install `@testing-library/user-event` if missing**

Run: `npm --prefix web install --save-dev @testing-library/user-event`
Expected: Installs cleanly without peer dependency conflicts.

- [ ] **Step 3: Commit**

```bash
git add web/package.json web/package-lock.json
git commit -m "chore(deps): install @testing-library/user-event and verify Radix UI package strategy"
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

- [ ] **Step 1: Write ESM-safe test verifying CSS variables and Tailwind theme mappings**

```typescript
// web/src/__tests__/tokens/design-tokens.test.ts
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import tailwindConfig from '../../../tailwind.config.js'

describe('Admin Semantic Design Tokens & Tailwind Mappings', () => {
  it('defines required semantic tokens in index.css with exact calibrated values', () => {
    const cssPath = fileURLToPath(new URL('../../index.css', import.meta.url))
    const cssContent = fs.readFileSync(cssPath, 'utf-8')

    // Exact regex assertions to prevent false matches inside comments
    expect(cssContent).toMatch(/--primary\s*:\s*32\s+95%\s+44%\s*;/)
    expect(cssContent).toMatch(/--primary-foreground\s*:\s*222\s+47%\s+11%\s*;/)
    expect(cssContent).toMatch(/--destructive\s*:\s*0\s+72%\s+51%\s*;/)
    expect(cssContent).toMatch(/--destructive-foreground\s*:\s*0\s+0%\s+100%\s*;/)
    expect(cssContent).toMatch(/--success\s*:\s*142\s+76%\s+36%\s*;/)
    expect(cssContent).toMatch(/--success-foreground\s*:\s*0\s+0%\s+100%\s*;/)
    expect(cssContent).toMatch(/--warning\s*:\s*38\s+92%\s+50%\s*;/)
    expect(cssContent).toMatch(/--warning-foreground\s*:\s*222\s+47%\s+11%\s*;/)
    expect(cssContent).toMatch(/--info\s*:\s*199\s+89%\s+38%\s*;/)
    expect(cssContent).toMatch(/--info-foreground\s*:\s*0\s+0%\s+100%\s*;/)
    expect(cssContent).toMatch(/--sidebar-background\s*:\s*0\s+0%\s+100%\s*;/)
    expect(cssContent).toMatch(/--sidebar-foreground\s*:\s*222\s+47%\s+11%\s*;/)
    expect(cssContent).toMatch(/--sidebar-primary\s*:\s*32\s+95%\s+44%\s*;/)
    expect(cssContent).toMatch(/--radius\s*:\s*1rem\s*;/)
  })

  it('contains valid components.json configuration with new-york style and zinc baseColor', () => {
    const configPath = fileURLToPath(new URL('../../../components.json', import.meta.url))
    expect(fs.existsSync(configPath)).toBe(true)
    const json = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    expect(json.style).toBe('new-york')
    expect(json.tailwind.baseColor).toBe('zinc')
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
git commit -m "feat(admin): configure semantic tokens, shadow-xs, and components.json (new-york style)"
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

- [ ] **Step 3: Implement primitives**

Check `package.json` and install only if missing:
- `@radix-ui/react-separator`
- `@radix-ui/react-scroll-area`
Implement `card.tsx`, `separator.tsx`, `scroll-area.tsx`, `breadcrumb.tsx`, and `skeleton.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix web run test -- src/__tests__/components/ui/layout-primitives.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/ui/card.tsx web/src/components/ui/separator.tsx web/src/components/ui/scroll-area.tsx web/src/components/ui/breadcrumb.tsx web/src/components/ui/skeleton.tsx web/src/__tests__/components/ui/layout-primitives.test.tsx web/package.json web/package-lock.json
git commit -m "feat(ui): add Card, Separator, ScrollArea, Breadcrumb, and Skeleton primitives"
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
- Consumes: `@radix-ui/react-label`, `@radix-ui/react-select`, `@radix-ui/react-tabs`, `cva`, `cn`
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

Check `package.json` and install only if missing:
- `@radix-ui/react-label`
- `@radix-ui/react-select`
- `@radix-ui/react-tabs`

Update `Button.tsx` in place with semantic variants (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, plus `primary` alias).
Implement `badge.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, and `tabs.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix web run test -- src/__tests__/components/ui/form-primitives.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/ui/Button.tsx web/src/components/ui/badge.tsx web/src/components/ui/input.tsx web/src/components/ui/label.tsx web/src/components/ui/select.tsx web/src/components/ui/tabs.tsx web/src/__tests__/components/ui/form-primitives.test.tsx web/package.json web/package-lock.json
git commit -m "feat(ui): update canonical Button and add badge, input, label, select, and tabs"
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
- Consumes: `@radix-ui/react-dropdown-menu`, `@radix-ui/react-dialog`, `@radix-ui/react-tooltip`, `@radix-ui/react-avatar`, `cva`, `cn`
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

  it('opens Dialog on click, traps focus, and restores focus to trigger on Escape dismiss', async () => {
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

- [ ] **Step 3: Implement overlay primitives**

Check `package.json` and install only if missing:
- `@radix-ui/react-tooltip`
- `@radix-ui/react-avatar`

Implement `dialog.tsx`, `sheet.tsx`, `dropdown-menu.tsx`, `tooltip.tsx`, and `avatar.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix web run test -- src/__tests__/components/ui/overlay-primitives.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/components/ui/dropdown-menu.tsx web/src/components/ui/dialog.tsx web/src/components/ui/sheet.tsx web/src/components/ui/tooltip.tsx web/src/components/ui/avatar.tsx web/src/__tests__/components/ui/overlay-primitives.test.tsx web/package.json web/package-lock.json
git commit -m "feat(ui): add accessible Dialog, Sheet, DropdownMenu, Tooltip, and Avatar primitives"
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
