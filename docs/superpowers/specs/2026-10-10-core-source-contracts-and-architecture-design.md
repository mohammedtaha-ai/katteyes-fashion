# Core Source Contracts & Architecture Foundation Specification

**Goal:** Establish an enterprise-grade Source Contract architecture system across Katteyes Fashion, starting with the Core State & Client Foundation (`auth-store.ts`, `api/client.ts`, `cart-store.ts`), verifying behavior and obligations through automated tests in Docker, resolving verified gaps, and creating the contract-driven baseline for subsequent Admin (Phase 1B) and Storefront refactoring.

**Branch:** `feature/luxury-storefront-experience`
**Template Reference:** `GENERIC_SOURCE_CONTRACT_TEMPLATE.yaml`
**Target Contracts Root:** `docs/contracts/`

---

## 1. Context & Motivation

Katteyes Fashion has completed Phase 1A (Design System & Atomic Primitives with 147 passing tests in Docker). To ensure scalable, defect-free expansion into Phase 1B (Admin Shell & Navigation) and subsequent phases without technical debt or silent regressions, we adopt the **Source Contract / Code Map Specification**.

Each contract represents ONE source module as the code actually behaves, grounding all claims in verified implementation and test assertions rather than comments.

---

## 2. Architecture & File Structure

Contracts are organized under `docs/contracts/` mirroring the repository file tree:

```
docs/contracts/
└── web/
    ├── api/
    │   └── client.contract.yaml
    └── stores/
        ├── auth-store.contract.yaml
        └── cart-store.contract.yaml
```

Each contract follows the 10 Golden Rules defined in `GENERIC_SOURCE_CONTRACT_TEMPLATE.yaml`:
1. Trace, never skim.
2. A `gap` names a stable symbol inside the source (`at: symbol`), never a line number.
3. An `obligation` names the test that holds it (`tested_by`), or `none`.
4. Reference externally owned types; do not duplicate them.
5. Describe only what this source owns.
6. Say what only this source can do.
7. Group functions meaningfully (`reads`, `writes`, `checks`).
8. Multiple implementations of one rule must agree (`agreements`).
9. Keep the file valid YAML.
10. Contradict yourself nowhere.

---

## 3. Core Modules Under Contract (Sub-project 1 Scope)

### 3.1 `web/src/stores/auth-store.ts` (`auth-store.contract.yaml`)
- **Owns:** Client-side authentication session state, token persistence in `localStorage` under key `'katteyes_auth'`, and role evaluation helpers.
- **Shapes:**
  - `AuthState`:
    - `user: User | null`
    - `token: string | null`
    - `isAdmin: () => boolean`
    - `isAuthenticated: () => boolean`
    - `setAuth: (a: { token: string; user: User }) => void`
    - `clear: () => void`
- **Obligations:**
  - `setAuth` stores `token` and `user`, causing `isAuthenticated()` to return `true`. (`tested_by: setAuth stores token + user`)
  - `clear` removes `token` and `user`, causing `isAuthenticated()` to return `false`. (`tested_by: clear removes token + user`)
  - `isAdmin()` returns `true` strictly when `user?.role === 'admin'`. (`tested_by: isAdmin returns true for admin role`)
  - `isAdmin()` returns `false` when `user?.role === 'customer'` or `user` is `null`. (`tested_by: isAdmin returns false for customer role`)
- **Not The Caller's:**
  - Pages and components must NOT inspect `user.role === 'admin'` raw strings; they must use `isAdmin()` or `RequireAuth`.
- **Gaps Identified:**
  - `at: isAuthenticated`: Evaluates solely on truthiness of `token`. It does not perform local JWT expiration validation prior to dispatching network requests, relying wholly on server 401 response handling.

### 3.2 `web/src/api/client.ts` (`client.contract.yaml`)
- **Owns:** Axios HTTP client configuration, base URL resolution, request interceptor (Bearer token injection, FormData `_method: POST` override), and response interceptor (central 401 handling).
- **Obligations:**
  - Automatically attaches `Authorization: Bearer <token>` if token exists in `useAuthStore`. (`tested_by: attaches Bearer token from auth-store`)
  - Converts `PUT`/`PATCH` requests with `FormData` to `POST` with `_method` override for Laravel compatibility. (`tested_by: none` -> will be verified/added)
  - Intercepts `401 Unauthorized` responses from non-login endpoints, calls `useAuthStore.getState().clear()`, and navigates to `/login`. (`tested_by: clears auth-store on 401 and redirects to /login`)
  - Does NOT navigate on 401 responses originating from `/auth/login`. (`tested_by: does NOT redirect on 401 from /auth/login`)
- **Not The Caller's:**
  - Callers must NOT inject manual Authorization headers or write custom 401 redirect logic.

### 3.3 `web/src/stores/cart-store.ts` (`cart-store.contract.yaml`)
- **Owns:** Shopping cart item state, persistence under `'katteyes_cart'`, item addition and deduplication, quantity updates, item deletion, total items and price calculations.
- **Shapes:**
  - `CartItem`: `{ productId, productName, price, currency, img, color, size, quantity }`
  - `CartState`: `{ items, addItem, updateQty, removeItem, clear, totalPrice, totalItems }`
- **Obligations:**
  - `addItem` with identical `productId + color + size` increments existing item `quantity` by 1 rather than creating duplicates. (`tested_by: cart-store.test.ts`)
  - `updateQty` reducing `quantity` to `<= 0` removes the item. (`tested_by: cart-store.test.ts`)
  - `totalPrice` computes exact sum of `price * quantity`. (`tested_by: cart-store.test.ts`)
- **Gaps Identified & Resolution:**
  - `at: updateQty`: Currently accesses `items[idx].quantity` directly without bounds check. Calling with negative or out-of-range `idx` throws `TypeError: Cannot read properties of undefined`.
  - **Resolution:** Add non-breaking safe guard:
    ```typescript
    if (!s.items[idx]) return s
    ```
    Guarantees out-of-range index operations silently no-op without crashing the application.

---

## 4. Verification & Testing Strategy

1. **Automated Contract Integrity Suite:**
   - Create `web/src/__tests__/contracts/source-contracts.test.ts`.
   - Uses `yaml` parser to read and parse all files matching `docs/contracts/**/*.contract.yaml`.
   - Verifies:
     - Valid YAML syntax.
     - Presence of required fields: `name`, `version`, `status`, `source`, `obligations`.
     - Target source file in `source:` exists on filesystem.
2. **Behavioral Obligation Tests:**
   - Add unit test in `web/src/__tests__/stores/cart-store.test.ts` verifying safe handling of invalid index in `updateQty`.
   - Add unit test in `web/src/__tests__/api/client.test.ts` verifying `FormData` `_method` rewrite.
3. **Docker Non-Regression Gate:**
   - All tests pass in Docker: `docker compose exec -T web npm test -- --run`.
   - Production build succeeds in Docker: `docker compose exec -T web npm run build`.
   - Zero changes to storefront/admin pages: `git diff --name-only 4044ae6fc3a36c2a8a42f1f596a4084ca6f0d862..HEAD -- web/src/pages` is empty.

---

## 5. Next Steps
Upon user review and approval of this specification, proceed directly to the `writing-plans` skill to generate the step-by-step implementation plan.
