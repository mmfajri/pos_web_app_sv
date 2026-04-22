# POS Minimarket — Frontend Documentation

## Overview

SvelteKit web application for the POS minimarket system. Provides the cashier invoice creation UI, transaction history viewing, and product catalog management.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | SvelteKit 2 |
| UI Library | Svelte 5 (with Svelte 4 compat syntax in some routes) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`), W3.CSS |
| Build Tool | Vite 6 |
| Adapter | `adapter-auto` |

---

## Project Structure

```
pos_web_app_sv/
├── src/
│   ├── app.html           — HTML shell
│   ├── app.css            — Global styles (Tailwind base import)
│   ├── app.d.ts           — SvelteKit type augmentation (currently blank)
│   ├── lib/
│   │   ├── components/    — Reusable UI components
│   │   ├── controllers/   — API call functions (one file per domain)
│   │   ├── models/        — TypeScript type definitions
│   │   └── utils/         — Shared constants and helpers
│   └── routes/            — File-based routing
│       ├── +layout.svelte
│       ├── +page.server.ts  — Root redirect → /login
│       ├── login/
│       ├── register/
│       ├── dashboard/
│       ├── invoice/
│       ├── product/
│       └── transaction-history/
└── static/
```

---

## Setup & Running

### Prerequisites
- Node.js 20+

### 1. Create the environment file

Create `pos_web_app_sv/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/pos_api_app
```

> Make sure the backend is running on that address. The `/pos_api_app` prefix is the controller route base.

### 2. Install dependencies & run

```bash
cd pos_web_app_sv
npm install
npm run dev
```

App runs at: `http://localhost:5173` (default Vite port)

### Build for production

```bash
npm run build
npm run preview
```

---

## Lib Structure

### `src/lib/utils/`

| File | Purpose |
|---|---|
| `const_variable.ts` | `API_BASE_URL`, `API_ENDPOINTS` (route suffixes), `API_STATUS_CODE`, `MESSAGE` |
| `ApiResponse.ts` | `ApiResponse<T>` interface: `{ data?, message, statusCode }` |
| `logout.ts` | `logout()` — navigates to `/login` |

**`API_ENDPOINTS`:**
```typescript
AUTH, EMPLOYEE, PRICE, PRODUCT, ROLE, TRANSACTION, UNIT, INVOICE
```

---

### `src/lib/models/`

| File | Types |
|---|---|
| `Product.ts` | `Product { priceId?, barcodeId, title, quantityType, amount? }` |
| `TransactionItems.ts` | `TransactionItem` (UI cart model), `TransactionItemApiModel` (from barcode lookup), `UnitTransactionItem { id?, name }` |

**`TransactionItem` (UI cart model):**
```typescript
{
  barcodeId: string;
  title: string;
  quantityType: string;  // unit name (e.g. "kg")
  quantity: number;
  price: number;         // unit price
  totalPrice: number;    // price × quantity
  discount: number;
  taxable: boolean;
  listUnit: UnitTransactionItem[];  // available units for this product
}
```

---

### `src/lib/controllers/`

Each file groups API calls for one domain. All use `fetch` directly with `API_BASE_URL`.

| File | Functions |
|---|---|
| `AuthController.ts` | `login(credentials)`, `register(data)` |
| `InvoiceController.ts` | `addItemByCode()`, `updateQuantity()`, `removeItem()`, `getSubtotal()`, `saveInvoiceTransaction()` |
| `ProductController.ts` | `getAllProductDropdown()`, `getProductByBarcodeDropdown()`, `getAllProducts()`, `getAllProductsPaginated()`, `createProduct()`, `updateProduct()`, `deleteProduct()` |
| `TransactionController.ts` | `getTransactionsPaginated()`, `getTransactionDetail()`, `updateTransactionItems()` |
| `UnitController.ts` | `getAllUnitsDropdown()`, `getUnitsByNameDropdown()` |

> Note: No auth token is currently attached to any API request (auth enforcement is out of scope — see Known Limitations).

---

### `src/lib/components/`

#### `DataTable.svelte`
Generic, reusable paginated sortable data table.

**Props:**
| Prop | Type | Description |
|---|---|---|
| `columns` | `Column<T>[]` | Column definitions with optional `format` callback |
| `data` | `T[]` | Current page data |
| `totalRecords` | number | Total count for pagination |
| `currentPage` | number | Active page (1-based) |
| `rowsPerPage` | number | Rows per page |
| `sortColumn` | string | Active sort column key |
| `sortColumnDir` | `"asc" \| "desc"` | Sort direction |
| `loading` | boolean | Shows loading state |
| `getRowKey` | `(row, index) => string \| number` | Unique key per row |

**Slots:** `header-actions`, `actions` (with `let:row`), `empty`

**Events:** `paramsChange` (emits `DataTableParams` when pagination/sort changes)

---

#### `dropdown.svelte`
Async searchable dropdown.

**Key props:** `fetchAllItems`, `searchItems`, `getDisplayText`, `getValue`, `getKey`, `readonly`, `disabled`

**Events:** `select`, `clear`

---

#### `Navbar.svelte`
Top navigation bar. Links: Dashboard, Invoice, Product Management, Transaction History, Logout.

**Props:** `onLogout: () => void`

---

#### `PasswordInput.svelte`
Password input with show/hide toggle.

---

## Routes

### `/` (root)
Immediately redirects to `/login` via `+page.server.ts` (302).

---

### `/login`
Login form (username + password). On success redirects to `/dashboard`.

---

### `/register`
Registration form (username, email, password, confirm password). Client-side validation: password match, minimum length. On success redirects to `/login`.

---

### `/dashboard`
Paginated, sortable list of all transactions. Action column links to `/dashboard/transaction/{id}` for editing.

---

### `/dashboard/transaction/[id]`
Edit transaction items for an existing transaction.
- Loads current items from `GET /Transaction/Detail?req={id}`
- Add items by barcode scan (`addItemByCode`)
- Edit quantity inline
- Remove items
- Save via `PUT /Transaction/UpdateTransactionItems` (delete-all + re-insert)

---

### `/invoice`
New invoice / cashier POS screen.

**Workflow:**
1. Select an invoice date (defaults to today)
2. Type a barcode and press Enter or click "Add Item" — fetches product info + unit list from `GET /Invoice/GetProductPriceByBarcode`
3. Edit quantities inline (total price updates reactively)
4. Click "Save Invoice" — POSTs to `POST /Invoice/SaveInvoiceTransaction`
5. On success: shows alert, clears the cart, stays on page

**Request shape sent to backend:**
```json
{
  "transactionDate": "2026-04-22T00:00:00.000Z",
  "accountPos": null,
  "totalTransaction": 25.50,
  "payAmount": 25.50,
  "listTransactionItems": [
    {
      "barcodeId": "8991234567890",
      "title": "Rice",
      "quantityType": "kg",
      "quantity": 2,
      "price": 10.00,
      "totalPrice": 20.00,
      "unitList": "kg;gram"
    }
  ]
}
```

> `payAmount` is automatically set equal to `totalTransaction` (no separate cash-tendered input).  
> `unitList` is stored as a semicolon-joined string of available unit names (snapshot at time of save).

---

### `/transaction-history`
Read-only paginated list of all saved transactions.

- Date filter input to narrow results
- "View" action link per row → `/transaction-history/{id}`

---

### `/transaction-history/[id]`
Read-only detail view for a single transaction.

- Loads all line items from `GET /Transaction/Detail?req={id}`
- Displays: Barcode, Title, Unit, Qty, Price, Total per row
- Shows grand total at the bottom
- "Back to Transaction History" navigation link

---

## Data Flow: Invoice Save

```
User enters barcode
  → addItemByCode() → GET /Invoice/GetProductPriceByBarcode
  → TransactionItem pushed to cart state

User edits qty
  → updateQuantity() → recalculates totalPrice locally (no API call)

User clicks Save Invoice
  → saveInvoiceTransaction(items, date)
  → POST /Invoice/SaveInvoiceTransaction
  → Backend: saves Transaction + TransactionItems in one DB transaction
  → On success: alert + cart cleared
```

---

## Data Flow: Transaction History

```
Navigate to /transaction-history
  → getTransactionsPaginated() → GET /Transaction?pageNumber=...&sortColumn=...
  → DataTable renders paginated list

User clicks "View" on a row
  → Navigate to /transaction-history/{id}
  → getTransactionDetail(id) → GET /Transaction/Detail?req={id}
  → Read-only items table rendered
```

---

## Known Limitations

- **No authentication persistence** — no token is stored (localStorage or cookies) and no token is sent with API requests. All API calls are unauthenticated.
- **`logout()` only redirects** — does not clear any stored session data.
- **Mixed Svelte syntax** — `/invoice` uses Svelte 5 runes (`$state`, `$derived`, `onclick`); other routes use Svelte 4 style (`export let`, `on:event`). Both work but are inconsistent.
- **`app.d.ts` is blank** — `App.Locals`, `App.PageData` not configured. No server-side session context.
- **No `.env` file committed** — must be created manually. See Setup section.
- **Misc and Tax** fields in the invoice footer are display-only (`$0.00` / `0%`) — not functional.
