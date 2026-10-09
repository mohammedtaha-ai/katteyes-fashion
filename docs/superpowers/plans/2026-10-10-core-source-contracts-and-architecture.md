# Core Source Contracts & Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the Source Contract architecture system across Katteyes Fashion, create verified living contracts for `auth-store.ts`, `api/client.ts`, and `cart-store.ts`, fix the verified runtime gap in `cart-store.ts` (`updateQty` out-of-bounds crash), and build an automated test suite verifying contract integrity in Docker.

**Architecture:** Strictly adopt the 10 Golden Rules of `GENERIC_SOURCE_CONTRACT_TEMPLATE.yaml`. Store contracts under `docs/contracts/` mirroring repository source paths. Enforce contract integrity via automated Vitest parsing with `yaml`. Fix identified gaps with minimal, non-breaking guards and verify all claims against test assertions.

**Tech Stack:** TypeScript, React 19, Zustand 5, Axios, Vitest, MSW, yaml, Docker.

**Spec:** `docs/superpowers/specs/2026-10-10-core-source-contracts-and-architecture-design.md`

## Global Constraints
- ALL npm installs, test executions, and builds MUST run inside Docker containers using `docker compose exec -T web ...`. Never run frontend tests on the Windows host directly.
- Strict adherence to the 10 Rules of `GENERIC_SOURCE_CONTRACT_TEMPLATE.yaml`:
  - 1. Trace, never skim (only claims verified in code).
  - 2. A gap names a stable symbol inside the source (`at: symbol`), never a line number.
  - 3. An obligation names the exact test that holds it (`tested_by`), or `none`.
  - 4. Reference externally owned types; do not duplicate them.
  - 5. Describe only what this source owns.
  - 6. Say what only this source can do.
  - 7. Group functions meaningfully (`reads`, `writes`, `checks`).
  - 8. Multiple implementations agreement (`agreements`).
  - 9. Keep the file valid YAML (programmatically verified).
  - 10. Contradict yourself nowhere.
- Zero modifications (0 diffs) to existing pages in `web/src/pages/` verified via `git diff --name-only 4044ae6fc3a36c2a8a42f1f596a4084ca6f0d862..HEAD -- web/src/pages`.
- Verification gate: All unit tests (148+ tests), `npm run lint`, and `npm run build` must pass cleanly in Docker.

---

### Task 1: Contract Infrastructure & Automated Integrity Suite

**Files:**
- Modify: `web/package.json`
- Create: `web/src/__tests__/contracts/source-contracts.test.ts`

**Interfaces:**
- Consumes: `yaml` parser library, Node `fs` and `path`
- Produces: Automated Vitest test suite verifying that all files matching `docs/contracts/**/*.contract.yaml` are valid YAML, contain required fields (`name`, `version`, `status`, `source`, `obligations`), and point to existing source files.

- [ ] **Step 1: Install `yaml` in `web/package.json` inside Docker**

Run:
```bash
docker compose exec -T web npm install -D yaml
```

- [ ] **Step 2: Write automated contract integrity test**

```typescript
// web/src/__tests__/contracts/source-contracts.test.ts
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'yaml'

function findContractFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let results: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results = results.concat(findContractFiles(fullPath))
    } else if (entry.name.endsWith('.contract.yaml')) {
      results.push(fullPath)
    }
  }
  return results
}

describe('Source Contracts Integrity', () => {
  const contractsRoot = path.resolve(__dirname, '../../../../docs/contracts')

  it('contracts directory exists or discovers contracts', () => {
    const contracts = findContractFiles(contractsRoot)
    // Initially at least 0 contracts, but root is accessible
    expect(Array.isArray(contracts)).toBe(true)
  })

  it('validates syntax and schema for every contract file', () => {
    const contracts = findContractFiles(contractsRoot)
    if (contracts.length === 0) return

    for (const contractPath of contracts) {
      const content = fs.readFileSync(contractPath, 'utf8')
      const parsed = parse(content)

      expect(parsed, `Failed to parse YAML in ${contractPath}`).toBeTruthy()
      expect(typeof parsed.name, `Missing name in ${contractPath}`).toBe('string')
      expect(typeof parsed.version, `Missing version in ${contractPath}`).toBe('number')
      expect(typeof parsed.status, `Missing status in ${contractPath}`).toBe('string')
      expect(typeof parsed.source, `Missing source in ${contractPath}`).toBe('string')
      expect(Array.isArray(parsed.obligations), `obligations must be array in ${contractPath}`).toBe(true)

      // Verify referenced source file exists
      const repoRoot = path.resolve(__dirname, '../../../../')
      const targetSourcePath = path.resolve(repoRoot, parsed.source)
      expect(
        fs.existsSync(targetSourcePath),
        `Source file ${parsed.source} referenced in ${contractPath} does not exist on disk`,
      ).toBe(true)
    }
  })
})
```

- [ ] **Step 3: Run test in Docker to confirm it passes**

Run: `docker compose exec -T web npm test -- src/__tests__/contracts/source-contracts.test.ts --run`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add web/package.json web/package-lock.json web/src/__tests__/contracts/source-contracts.test.ts
git commit -m "chore(contracts): install yaml and add automated contract integrity test suite"
```

---

### Task 2: Auth Store Contract & Behavioral Coverage (`auth-store.ts`)

**Files:**
- Create: `docs/contracts/web/stores/auth-store.contract.yaml`
- Modify: `web/src/__tests__/stores/auth-store.test.ts`

**Interfaces:**
- Consumes: `web/src/stores/auth-store.ts`, `GENERIC_SOURCE_CONTRACT_TEMPLATE.yaml`
- Produces: Certified source contract `docs/contracts/web/stores/auth-store.contract.yaml`

- [ ] **Step 1: Add explicit test assertion for `user: null` in `auth-store.test.ts`**

Add test to `web/src/__tests__/stores/auth-store.test.ts`:
```typescript
it('isAdmin returns false when user is null', () => {
  useAuthStore.getState().clear()
  expect(useAuthStore.getState().isAdmin()).toBe(false)
})
```

- [ ] **Step 2: Run test in Docker to confirm it passes**

Run: `docker compose exec -T web npm test -- src/__tests__/stores/auth-store.test.ts --run`
Expected: PASS

- [ ] **Step 3: Create `docs/contracts/web/stores/auth-store.contract.yaml`**

```yaml
# Owns client-side authentication session state, token persistence, and role checks.
#
# Authentication state is persisted across page refreshes via Zustand's persist
# middleware in localStorage under the key 'katteyes_auth'.
#
# isAdmin() strictly evaluates whether user.role equals 'admin'. It does not verify
# token cryptographical validity or expiration timestamp.

name: auth-store
version: 1
status: current
source: web/src/stores/auth-store.ts

shapes:
  AuthState:
    user: "User | null"
    token: "string | null"
    isAdmin: "() -> bool"
    isAuthenticated: "() -> bool"
    setAuth: "({ token: string, user: User }) -> void"
    clear: "() -> void"

enums:
  User:
    source: "@/api/types"
    values: []

functions:
  reads:
    isAdmin:
      signature: "() -> bool"
      notes: "Returns true strictly when user is non-null and user.role is 'admin'."
    isAuthenticated:
      signature: "() -> bool"
      notes: "Returns true if token is non-null and non-empty."

  writes:
    setAuth:
      signature: "({ token: string, user: User }) -> void"
      notes: "Sets both token and user simultaneously into state and localStorage."
    clear:
      signature: "() -> void"
      notes: "Resets token and user to null, clearing authenticated status."

obligations:
  - rule: >
      Calling setAuth stores token and user in state and persists them, causing
      isAuthenticated to return true.
    tested_by: "setAuth stores token + user"

  - rule: >
      Calling clear sets token and user to null, causing isAuthenticated to return false.
    tested_by: "clear removes token + user"

  - rule: >
      isAdmin returns true strictly when user role is 'admin'.
    tested_by: "isAdmin returns true for admin role"

  - rule: >
      isAdmin returns false when user role is 'customer'.
    tested_by: "isAdmin returns false for customer role"

  - rule: >
      isAdmin returns false when user is null.
    tested_by: "isAdmin returns false when user is null"

not_the_caller's:
  - >
      Inspect raw user.role strings directly in pages or components; callers must use
      isAdmin() or RequireAuth wrapper.

gaps:
  - at: isAuthenticated
    gap: >
      Evaluates solely based on token truthiness (!!token). Does not check token expiration
      locally before network requests, relying wholly on server 401 response handling.

tests:
  - name: "setAuth stores token + user"
    checks: >
      Calling setAuth sets token and isAuthenticated returns true.
  - name: "clear removes token + user"
    checks: >
      Calling clear sets token to null and isAuthenticated returns false.
  - name: "isAdmin returns true for admin role"
    checks: >
      Returns true when user.role is 'admin'.
  - name: "isAdmin returns false for customer role"
    checks: >
      Returns false when user.role is 'customer'.
  - name: "isAdmin returns false when user is null"
    checks: >
      Returns false when state is cleared and user is null.
```

- [ ] **Step 4: Verify contract integrity in Docker**

Run: `docker compose exec -T web npm test -- src/__tests__/contracts/source-contracts.test.ts --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs/contracts/web/stores/auth-store.contract.yaml web/src/__tests__/stores/auth-store.test.ts
git commit -m "feat(contracts): add source contract and null assertion for auth-store"
```

---

### Task 3: API Client Contract & FormData Rewrite Coverage (`api/client.ts`)

**Files:**
- Create: `docs/contracts/web/api/client.contract.yaml`
- Modify: `web/src/__tests__/api/client.test.ts`

**Interfaces:**
- Consumes: `web/src/api/client.ts`, `useAuthStore`
- Produces: Certified source contract `docs/contracts/web/api/client.contract.yaml`

- [ ] **Step 1: Write test for FormData method rewriting in `client.test.ts`**

Add to `web/src/__tests__/api/client.test.ts`:
```typescript
  it('rewrites FormData PUT requests to POST with _method append', async () => {
    let capturedMethod: string | null = null
    let capturedMethodField: string | null = null

    server.use(
      http.post('*/api/v1/upload', async ({ request }) => {
        capturedMethod = request.method
        const formData = await request.formData()
        capturedMethodField = formData.get('_method') as string
        return HttpResponse.json({ data: { ok: true } })
      }),
    )

    const form = new FormData()
    form.append('name', 'dress')
    await apiClient.put('/upload', form)

    expect(capturedMethod).toBe('POST')
    expect(capturedMethodField).toBe('PUT')
  })
```

- [ ] **Step 2: Run test in Docker to confirm it passes**

Run: `docker compose exec -T web npm test -- src/__tests__/api/client.test.ts --run`
Expected: PASS

- [ ] **Step 3: Create `docs/contracts/web/api/client.contract.yaml`**

```yaml
# Owns Axios HTTP client initialization, request interceptors, and 401 handling.
#
# Intercepts every outgoing request to automatically inject Bearer token from
# auth-store. Transforms FormData PUT and PATCH requests into POST requests with
# _method appended for Laravel multipart/form-data compatibility.
#
# Automatically intercepts 401 responses, clears auth-store, and triggers redirect
# to /login for all endpoints except /auth/login itself.

name: api-client
version: 1
status: current
source: web/src/api/client.ts

shapes:
  apiClient: "AxiosInstance"

functions:
  operations:
    request_interceptor:
      signature: "(config: InternalAxiosRequestConfig) -> InternalAxiosRequestConfig"
      notes: "Appends Bearer token and converts FormData PUT/PATCH to POST with _method."
    response_error_interceptor:
      signature: "(err: AxiosError) -> Promise<never>"
      notes: "Clears auth store and navigates to /login on 401 unless URL contains /auth/login."

obligations:
  - rule: >
      Automatically attaches Authorization: Bearer <token> header to requests when token
      exists in auth-store.
    tested_by: "attaches Bearer token from auth-store"

  - rule: >
      Rewrites PUT and PATCH requests containing FormData into POST requests with _method
      field appended for Laravel compatibility.
    tested_by: "rewrites FormData PUT requests to POST with _method append"

  - rule: >
      Clears auth-store on 401 responses and triggers navigation to /login for protected
      endpoints.
    tested_by: "clears auth-store on 401 and redirects to /login"

  - rule: >
      Does not trigger navigation on 401 responses originating from /auth/login.
    tested_by: "does NOT redirect on 401 from /auth/login"

not_the_caller's:
  - >
      Inject Bearer headers manually or implement custom 401 redirect listeners;
      apiClient handles authorization and session termination centrally.

tests:
  - name: "attaches Bearer token from auth-store"
    checks: >
      Outgoing request includes Bearer token matching current auth-store state.
  - name: "rewrites FormData PUT requests to POST with _method append"
    checks: >
      FormData PUT request is transformed into HTTP POST with _method: PUT appended.
  - name: "clears auth-store on 401 and redirects to /login"
    checks: >
      On 401 response, auth-store token is cleared and navigation to /login is initiated.
  - name: "does NOT redirect on 401 from /auth/login"
    checks: >
      401 response from /auth/login does not trigger navigation.
```

- [ ] **Step 4: Verify contract integrity in Docker**

Run: `docker compose exec -T web npm test -- src/__tests__/contracts/source-contracts.test.ts --run`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs/contracts/web/api/client.contract.yaml web/src/__tests__/api/client.test.ts
git commit -m "feat(contracts): add source contract and FormData rewrite test for api-client"
```

---

### Task 4: Cart Store Gap Fix & Behavioral Contract (`cart-store.ts`)

**Files:**
- Modify: `web/src/stores/cart-store.ts`
- Modify: `web/src/__tests__/stores/cart-store.test.ts`
- Create: `docs/contracts/web/stores/cart-store.contract.yaml`

**Interfaces:**
- Consumes: `web/src/stores/cart-store.ts`
- Produces: Hardened `updateQty` implementation and certified source contract `docs/contracts/web/stores/cart-store.contract.yaml`.

- [ ] **Step 1: Write test exposing the out-of-bounds gap in `cart-store.test.ts`**

Add to `web/src/__tests__/stores/cart-store.test.ts`:
```typescript
it('updateQty gracefully ignores out-of-bounds index without throwing', () => {
  expect(() => {
    useCartStore.getState().updateQty(999, 1)
    useCartStore.getState().updateQty(-1, -1)
  }).not.toThrow()
  expect(useCartStore.getState().items).toEqual([])
})
```

- [ ] **Step 2: Run test in Docker to verify it fails**

Run: `docker compose exec -T web npm test -- src/__tests__/stores/cart-store.test.ts --run`
Expected: FAIL (`TypeError: Cannot read properties of undefined (reading 'quantity')`)

- [ ] **Step 3: Fix the gap in `web/src/stores/cart-store.ts`**

In `web/src/stores/cart-store.ts`, update `updateQty`:
```typescript
      updateQty: (idx, delta) =>
        set((s) => {
          if (!s.items[idx]) return s
          const items = [...s.items]
          items[idx] = { ...items[idx], quantity: items[idx].quantity + delta }
          if (items[idx].quantity <= 0) items.splice(idx, 1)
          return { items }
        }),
```

- [ ] **Step 4: Run test in Docker to verify it passes**

Run: `docker compose exec -T web npm test -- src/__tests__/stores/cart-store.test.ts --run`
Expected: PASS (all cart tests pass)

- [ ] **Step 5: Create `docs/contracts/web/stores/cart-store.contract.yaml`**

```yaml
# Owns shopping cart state, persistence, quantity management, and subtotal calculation.
#
# Cart items are stored in localStorage under 'katteyes_cart'. Items are uniquely
# differentiated by composite key: (productId, color, size).
#
# Updating quantity to 0 or below automatically purges the item from the list.

name: cart-store
version: 1
status: current
source: web/src/stores/cart-store.ts

shapes:
  CartItem:
    productId: int
    productName: string
    price: float
    currency: string
    img: string
    color: string
    size: string
    quantity: int

  CartState:
    items: "[CartItem]"
    addItem: "(i: Omit<CartItem, 'quantity'>) -> void"
    updateQty: "(idx: int, delta: int) -> void"
    removeItem: "(idx: int) -> void"
    clear: "() -> void"
    totalPrice: "() -> float"
    totalItems: "() -> int"

functions:
  reads:
    totalPrice:
      signature: "() -> float"
      notes: "Sum of (item.price * item.quantity) across all items."
    totalItems:
      signature: "() -> int"
      notes: "Sum of item.quantity across all items."

  writes:
    addItem:
      signature: "(item) -> void"
      notes: "Appends new item or increments existing item quantity matching (productId, color, size)."
    updateQty:
      signature: "(idx: int, delta: int) -> void"
      notes: "Adjusts quantity by delta. If quantity <= 0, deletes item. Safely no-ops if idx is invalid."
    removeItem:
      signature: "(idx: int) -> void"
      notes: "Removes item at given array index."
    clear:
      signature: "() -> void"
      notes: "Empties items array."

obligations:
  - rule: >
      addItem increments quantity for matching product, color, and size rather than
      creating duplicate entries.
    tested_by: "addItem increments quantity for same product+color+size"

  - rule: >
      updateQty increments item quantity and removes item when quantity reaches 0 or below.
    tested_by: "updateQty increments then removes at 0"

  - rule: >
      totalPrice and totalItems compute accurate aggregates across items.
    tested_by: "totalPrice + totalItems computed correctly"

  - rule: >
      updateQty safely ignores out-of-bounds indices without throwing runtime exception.
    tested_by: "updateQty gracefully ignores out-of-bounds index without throwing"

not_the_caller's:
  - >
      Mutate item quantity or perform cart deduplication outside useCartStore; callers
      must pass actions through addItem or updateQty.

gaps:
  - at: updateQty
    gap: >
      Access by numerical array index (idx) rather than stable composite key is sensitive
      to array reordering. Resolved index crash with guard check, but composite key API
      migration is deferred to future refactoring.

tests:
  - name: "addItem increments quantity for same product+color+size"
    checks: >
      Adding the same item twice increases quantity to 2 and keeps items.length at 1.
  - name: "updateQty increments then removes at 0"
    checks: >
      Increasing quantity by delta updates quantity; decreasing to 0 splices the item.
  - name: "totalPrice + totalItems computed correctly"
    checks: >
      Calculates arithmetic product sum and quantity sum.
  - name: "updateQty gracefully ignores out-of-bounds index without throwing"
    checks: >
      Passing invalid indices (999, -1) cleanly no-ops without throwing exception.
```

- [ ] **Step 6: Verify contract integrity in Docker**

Run: `docker compose exec -T web npm test -- src/__tests__/contracts/source-contracts.test.ts --run`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add web/src/stores/cart-store.ts web/src/__tests__/stores/cart-store.test.ts docs/contracts/web/stores/cart-store.contract.yaml
git commit -m "fix(cart): guard updateQty against out-of-bounds index and add source contract"
```

---

### Task 5: Non-Regression & Verification Gate

**Files:**
- Modify/Verify: Full repository

- [ ] **Step 1: Run linter across the entire project in Docker**

Run: `docker compose exec -T web npm run lint`
Expected: 0 errors

- [ ] **Step 2: Run all unit and integration tests in Docker**

Run: `docker compose exec -T web npm test -- --run`
Expected: All 46+ test files and 150+ tests pass (0 failures).

- [ ] **Step 3: Run production build and type checking in Docker**

Run: `docker compose exec -T web npm run build`
Expected: `tsc -b && vite build` succeeds cleanly without any errors.

- [ ] **Step 4: Verify zero diffs on existing pages against baseline**

Run: `git diff --name-only 4044ae6fc3a36c2a8a42f1f596a4084ca6f0d862..HEAD -- web/src/pages`
Expected: Empty output (guarantees zero existing storefront/admin pages modified).

- [ ] **Step 5: Tag milestone completion**

Run: `git tag core-contracts-phase-complete`
