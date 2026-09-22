# Katteyes Admin Redesign — Phase 1 Design Spec

## 1. Overview & Vision
This document outlines the architectural specifications for the modernization and luxury redesign of the Katteyes Fashion Admin Dashboard. The current admin interface is a rudimentary prototype with minimal layout, sparse information density, and missing core modules.

The transformation is structured into iterative, risk-managed phases. **Phase 1** focuses on establishing the design foundation, the modern administrative shell, and the central analytics dashboard.

Phase 1 is divided into three sequential milestones:
- **Phase 1A — Admin Design System & Primitives (Foundation)**: Establishing semantic design tokens via CSS variables, standardizing shadcn/ui configuration with `components.json`, and providing the complete suite of atomic UI primitives.
- **Phase 1B — Admin Shell (Navigation & Layout)**: Modern, collapsible, responsive sidebar, administrative header with breadcrumbs and user controls, and a structured layout container.
- **Phase 1C — Dashboard Overview (`/admin`)**: Real-time business metrics (KPIs), Recharts-powered sales and order charts, top-selling products, stock alerts, and recent orders.

---

## 2. Phase 1A: Admin Design System & Tokens

### 2.1 Semantic Design Tokens (CSS Variables)
To ensure the design system remains brand-agnostic and easily maintainable, components MUST NOT hardcode color names (e.g. `amber-600` or `zinc-900`) directly. Instead, all components consume semantic tokens configured as CSS variables in `src/index.css` and extended in `tailwind.config.js`.

The Katteyes brand identity (Luxury Amber/Gold) is assigned to the `--primary` semantic token.

```css
/* src/index.css */
@layer base {
  :root {
    /* Surfaces */
    --background: 210 20% 98%;          /* #F8F9FA Canvas */
    --foreground: 222 47% 11%;           /* Slate 900 Near-black */
    --card: 0 0% 100%;                  /* #FFFFFF Pure white */
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    /* Brand Primary (Katteyes Luxury Amber/Gold) */
    --primary: 38 92% 50%;               /* #E5A83B / #D97706 */
    --primary-foreground: 0 0% 100%;

    /* Secondary & Muted */
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222 47% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 38 92% 95%;
    --accent-foreground: 38 92% 35%;

    /* Status Indicators */
    --success: 142 71% 45%;              /* Emerald 600 */
    --success-foreground: 0 0% 100%;
    --warning: 38 92% 50%;               /* Amber 500 */
    --warning-foreground: 0 0% 100%;
    --danger: 0 84.2% 60.2%;             /* Rose 500 */
    --danger-foreground: 0 0% 100%;
    --info: 199 89% 48%;                 /* Sky 500 */
    --info-foreground: 0 0% 100%;

    /* Borders & Inputs */
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 38 92% 50%;

    /* Geometry */
    --radius: 1rem;                     /* 16px default card radius */
  }
}
```

### 2.2 Configuration (`components.json`)
A standard `components.json` is created in the project root of `web/` to define paths, style conventions, and aliases compatible with Vite, React 19, and Tailwind CSS:

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

### 2.3 UI Primitives Suite
The foundational UI primitives in `web/src/components/ui/` will be generated/standardized using shadcn conventions, backed by Radix UI primitives, Lucide React icons, and RTL responsiveness:

1. **Containers & Layout Elements:**
   - `Card` (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`)
   - `Separator` (horizontal and vertical dividers)
   - `ScrollArea` (custom smooth scrolling for sidebars and tables)
   - `Breadcrumb` (`BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`)
2. **Interactive Controls:**
   - `Button` (semantic variants: `default` [primary], `secondary`, `outline`, `ghost`, `destructive`, `link`)
   - `Badge` (variants: `default`, `secondary`, `outline`, `success`, `warning`, `danger`, `info`)
   - `Input` & `Label` (form controls with clean focus rings and RTL text alignment)
   - `Select` (accessible dropdown selection via Radix Select)
   - `Tabs` (`TabsList`, `TabsTrigger`, `TabsContent` for section switching)
3. **Overlays & Menus:**
   - `DropdownMenu` (context menus, action menus `⋮`, user account menu)
   - `Dialog` (modal dialogs for confirmations and additions)
   - `Sheet` (slide-out side drawer for mobile navigation and detail inspectors)
   - `Tooltip` (hover hints for icons and collapsed states)
   - `Avatar` (`AvatarImage`, `AvatarFallback` for user identity)
4. **Data Presentation & Feedback:**
   - `Table` (`TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`)
   - `Skeleton` (animated placeholder blocks for luxury loading states)
   - `Chart` (`ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`) built for Recharts v3.

*(Note: Generalized DataTable abstraction with TanStack Table is deliberately deferred to the Orders & Products phase where concrete data requirements exist).*

### 2.4 RTL & Responsive Standards
- Full support for `dir="rtl"` using standard logical utilities (`start`, `end`, `ms-`, `me-`).
- Icon rotation / directional mirroring for navigation arrows and chevrons.
- Strict responsive breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`).

---

## 3. Phase 1B: Admin Shell (Navigation & Layout) Preview

*(Detailed spec to be reviewed after completion and verification of Phase 1A)*
- **Structured Sidebar:** Grouped navigation:
  - *Overview:* Dashboard (`/admin`)
  - *Commerce:* Orders (`/admin/orders`), Products (`/admin/products`), Categories (`/admin/categories`), Inventory (`/admin/inventory`)
  - *Management:* Customers (`/admin/customers`), Employees (`/admin/employees`), Reports (`/admin/reports`), Settings (`/admin/settings`)
- **Top Admin Header:** Collapsible sidebar trigger, breadcrumbs reflecting current route, quick search shortcut, active user profile dropdown with logout action.
- **Main Container:** Responsive padding (`p-4 md:p-6 lg:p-8`), max-width bounding for ultra-wide monitors, consistent background surface `#F8F9FA`.

---

## 4. Phase 1C: Dashboard Overview Preview

*(Detailed spec to be reviewed prior to Phase 1C execution)*
- **Backend API Expansion:** Expand `DashboardController@stats` in Laravel to aggregate:
  - Total revenue & period comparison
  - Order volume & status breakdown
  - Low stock variant alerts
  - Top selling products
  - 30-day daily sales revenue time-series
- **Frontend Dashboard Page (`/admin`):**
  - KPI Stat Cards with percentage badges and trend indicators
  - Area Chart for Sales Overview (Recharts v3 + shadcn Chart)
  - Donut/Bar Chart for Orders by Status
  - Low-stock warning widget
  - Quick Recent Orders table with status badges and deep-link to order details

---

## 5. Non-Regression & Verification Strategy
1. **Isolation Guarantee:** Phase 1A strictly introduces tokens, `components.json`, and atomic UI components in `src/components/ui/`. No existing storefront or admin page logic is modified in 1A.
2. **Automated Verification:**
   - `npm run lint` (zero lint errors)
   - `npm run test` (all existing Vitest test suites must pass)
   - `npm run build` (successful TypeScript compilation and Vite bundling)
