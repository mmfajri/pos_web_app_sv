<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import Dropdown from "$lib/components/dropdown.svelte";
  import DataTable, { type Column, type DataTableParams } from "$lib/components/DataTable.svelte";
  import { logout } from "$lib/utils/logout";
  import { getAllUnitsDropdown, getUnitsByNameDropdown, type Unit } from "$lib/controllers/UnitController";
  import {
    createProduct as createProductAPI,
    updateProduct as updateProductAPI,
    deleteProduct as deleteProductAPI,
    getAllProductDropdown as getAllProductDropdownAPI,
    getProductByBarcodeDropdown as getProductByBarcodeDropdownAPI,
    getAllProductsPaginated,
    type Product,
    type ProductModelDropdown,
  } from "$lib/controllers/ProductController";

  // ✅ Using Svelte 5 runes
  let error = $state<string | null>(null);
  let formLoading = $state(false); // For form operations (create, update, delete)
  let tableLoading = $state(false); // For table data loading

  // Form data
  let formData = $state<Product>({
    barcodeID: "",
    title: "",
    quantityType: "",
    amount: 0,
  });

  // DataTable columns configuration
  const columns: Column<Product>[] = [
    {
      key: "barcodeID",
      label: "Barcode ID",
      sortable: true,
    },
    {
      key: "title",
      label: "Product Title",
      sortable: true,
    },
    {
      key: "quantityType",
      label: "Quantity Type",
      sortable: true,
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      format: (value: number) => `$${value.toFixed(2)}`,
    },
  ];

  // Product list with pagination
  let products = $state<Product[]>([]);
  let totalRecords = $state(0);
  let currentPage = $state(1);
  let rowsPerPage = $state(10);
  let searchBarcodeID = $state("");

  let sortColumn = $state("");
  let sortColumnDir = $state<"asc" | "desc">("asc");

  let editingId = $state<number | null>(null);
  let isProductSelectedFromDropdown = $state(false);
  let dropdownKey = $state(0);

  // Load products with pagination
  async function fetchProducts() {
    console.log("[fetchProducts] START - tableLoading = true");
    tableLoading = true;
    error = null;

    try {
      console.log("[fetchProducts] API params:", {
        sortColumn,
        sortColumnDir,
        rowsPerPage,
        pageNumber: currentPage,
      });

      const response = await getAllProductsPaginated({
        sortColumn,
        sortColumnDir,
        rowsPerPage,
        pageNumber: currentPage,
        barcodeID: searchBarcodeID || undefined,
      });

      console.log("[fetchProducts] API response:", response);
      console.log("[fetchProducts] response.data:", response.data);
      console.log("[fetchProducts] response.data type:", typeof response.data, Array.isArray(response.data));

      products = response.data;
      totalRecords = response.totalRecords;
      currentPage = response.currentPage;

      console.log("[fetchProducts] Products assigned:", products);
      console.log("[fetchProducts] Products length:", products.length);
      console.log("[fetchProducts] totalRecords:", totalRecords);
      console.log("[fetchProducts] currentPage:", currentPage);
    } catch (err: unknown) {
      error = "Failed to load products. Please try again.";
      console.error("[fetchProducts] ERROR:", err);
      products = [];
      totalRecords = 0;
    } finally {
      console.log("[fetchProducts] FINALLY - tableLoading = false");
      tableLoading = false;
      console.log("[fetchProducts] END - tableLoading is now:", tableLoading);
    }
  }

  // Handle search
  function handleSearch() {
    currentPage = 1; // Reset to first page when searching
    fetchProducts();
  }

  // Handle search on Enter key
  function handleSearchKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      handleSearch();
    }
  }

  // Handle table params change (pagination, sorting)
  function handleTableParamsChange(event: CustomEvent<DataTableParams>) {
    console.log("[handleTableParamsChange] Event received:", event.detail);
    const params = event.detail;
    sortColumn = params.sortColumn;
    sortColumnDir = params.sortColumnDir;
    rowsPerPage = params.rowsPerPage;
    currentPage = params.pageNumber;

    console.log("[handleTableParamsChange] Calling fetchProducts");
    fetchProducts();
  }

  function refreshDropdown() {
    dropdownKey += 1;
  }

  function handleUnitSelect(event: CustomEvent<Unit>) {
    formData.quantityType = event.detail.name;
    console.log("Selected unit:", event.detail);
  }

  function handleProductSelect(event: CustomEvent<ProductModelDropdown>) {
    formData.barcodeID = event.detail.barcodeId || "";
    formData.title = event.detail.title || "";
    isProductSelectedFromDropdown = true;
    console.log("Selected product:", event.detail);
  }

  function handleUnitClear() {
    formData.quantityType = "";
  }

  function handleProductClear() {
    formData.barcodeID = "";
    formData.title = "";
    isProductSelectedFromDropdown = false;
  }

  async function searchUnits(term: string): Promise<Unit[]> {
    const unit = await getUnitsByNameDropdown(term);
    return unit ? [unit] : [];
  }

  async function searchProducts(term: string): Promise<ProductModelDropdown[]> {
    const product = await getProductByBarcodeDropdownAPI(term);
    return product ? [product] : [];
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (editingId !== null) {
      await updateProduct();
    } else {
      await createProduct();
    }
  }

  async function createProduct() {
    try {
      formLoading = true;
      await createProductAPI(formData);
      console.log("Product created successfully");
      resetForm();
      await fetchProducts();
      refreshDropdown();
    } catch (err: unknown) {
      if (err instanceof Error) {
        error = err.message;
      } else {
        error = "Failed to create product";
      }
      console.error("Create product error:", err);
    } finally {
      formLoading = false;
    }
  }

  async function updateProduct() {
    try {
      formLoading = true;
      await updateProductAPI(formData);
      console.log("Product updated successfully");
      resetForm();
      await fetchProducts();
      refreshDropdown();
    } catch (err: unknown) {
      if (err instanceof Error) {
        error = err.message;
      } else {
        error = "Failed to update product";
      }
      console.error("Update product error:", err);
    } finally {
      formLoading = false;
    }
  }

  function editProduct(product: Product) {
    formData = { ...product };
    editingId = product.priceID!;
  }

  async function deleteProduct(id: number) {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        formLoading = true;
        await deleteProductAPI(id);
        console.log("Product deleted successfully");
        await fetchProducts();
        refreshDropdown();
      } catch (err: unknown) {
        if (err instanceof Error) {
          error = err.message;
        } else {
          error = "Failed to delete product";
        }
        console.error("Delete product error:", err);
      } finally {
        formLoading = false;
      }
    }
  }

  function resetForm() {
    formData = {
      barcodeID: "",
      title: "",
      quantityType: "",
      amount: 0,
    };
    editingId = null;
    error = null;
    isProductSelectedFromDropdown = false;
  }
</script>

<Navbar onLogout={logout}></Navbar>

<main class="p-2">
  <!-- Title -->
  <h1 class="text-3xl font-bold underline mb-6">Product Management</h1>

  <div class="flex flex-col lg:flex-row gap-8">
    <!-- Left Section - Form Input -->
    <div class="flex-1">
      <h2 class="text-2xl font-semibold mb-4">
        {editingId ? "Edit Product" : "Add New Product"}
      </h2>

      {#if error}
        <p class="text-red-500 text-sm mb-4">{error}</p>
      {/if}

      <form on:submit={handleSubmit} class="space-y-4 bg-white p-6 rounded-lg shadow-md" autocomplete="off">
        <!-- Barcode ID -->
        <div>
          <label for="barcodeID" class="block text-sm font-medium text-gray-700 mb-1">
            Barcode ID *
            {#if editingId !== null}
              <span class="text-xs text-gray-500">(Cannot be changed when editing)</span>
            {:else if isProductSelectedFromDropdown}
              <span class="text-xs text-gray-500">(Selected from existing product)</span>
            {/if}
          </label>

          {#key dropdownKey}
            <Dropdown
              bind:value={formData.barcodeID}
              placeholder={editingId !== null || isProductSelectedFromDropdown
                ? "Barcode (locked)"
                : "Search or type barcode ID"}
              required={true}
              readonly={editingId !== null || isProductSelectedFromDropdown}
              fetchAllItems={getAllProductDropdownAPI}
              searchItems={searchProducts}
              getDisplayText={(product: ProductModelDropdown) => `${product.barcodeId} - ${product.title}`}
              getValue={(product: ProductModelDropdown) => product.barcodeId || ""}
              getKey={(product: ProductModelDropdown) => product.barcodeId || ""}
              on:select={handleProductSelect}
              on:clear={handleProductClear}
            />
          {/key}

          {#if isProductSelectedFromDropdown && editingId === null}
            <button
              type="button"
              on:click={handleProductClear}
              class="mt-2 text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none"
            >
              Change Product
            </button>
          {/if}
        </div>

        <!-- Title Product -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
            Product Title *
            {#if isProductSelectedFromDropdown && editingId === null}
              <span class="text-xs text-gray-500">(Auto-filled from selected product)</span>
            {:else if editingId !== null}
              <span class="text-xs text-gray-500">(Can be modified)</span>
            {/if}
          </label>
          <input
            id="title"
            type="text"
            bind:value={formData.title}
            required
            disabled={isProductSelectedFromDropdown && editingId === null}
            autocomplete="off"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter product title"
          />
        </div>

        <!-- Quantity Type -->
        <div>
          <label for="quantityType" class="block text-sm font-medium text-gray-700 mb-1">Quantity Type *</label>
          <Dropdown
            bind:value={formData.quantityType}
            placeholder="Search for quantity type (e.g., PC, Box, Kg...)"
            required={true}
            fetchAllItems={getAllUnitsDropdown}
            searchItems={searchUnits}
            getDisplayText={(unit: Unit) => unit.name}
            getValue={(unit: Unit) => unit.name}
            getKey={(unit: Unit) => unit.id}
            on:select={handleUnitSelect}
            on:clear={handleUnitClear}
          />
        </div>

        <!-- Amount -->
        <div>
          <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
          <input
            id="amount"
            type="number"
            bind:value={formData.amount}
            required
            min="0"
            step="0.01"
            autocomplete="off"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        <!-- Form Buttons -->
        <div class="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={formLoading}
            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {#if formLoading}
              Processing...
            {:else}
              {editingId ? "Update Product" : "Add Product"}
            {/if}
          </button>

          {#if editingId !== null}
            <button
              type="button"
              on:click={resetForm}
              disabled={formLoading}
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          {:else if formData.barcodeID || formData.title || formData.quantityType || formData.amount > 0}
            <button
              type="button"
              on:click={resetForm}
              disabled={formLoading}
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          {/if}
        </div>
      </form>
    </div>

    <!-- Right Section - Product List with DataTable -->
    <div class="flex-1">
      <h2 class="text-2xl font-semibold mb-4">Product List</h2>

      <!-- Search Bar -->
      <div class="mb-4 flex gap-2">
        <input
          type="text"
          bind:value={searchBarcodeID}
          on:keydown={handleSearchKeydown}
          placeholder="Search by Barcode ID..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          on:click={handleSearch}
          disabled={tableLoading}
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          Search
        </button>
        {#if searchBarcodeID}
          <button
            type="button"
            on:click={() => {
              searchBarcodeID = "";
              handleSearch();
            }}
            disabled={tableLoading}
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        {/if}
      </div>

      <DataTable
        {columns}
        data={products}
        {totalRecords}
        {currentPage}
        {rowsPerPage}
        bind:sortColumn
        bind:sortColumnDir
        loading={tableLoading}
        getRowKey={(row, index) => row.priceID ?? `temp-${index}`}
        on:paramsChange={handleTableParamsChange}
      >
        <!-- Custom actions column -->
        <svelte:fragment slot="actions" let:row>
          <td class="px-4 py-3 text-sm">
            <div class="flex gap-2">
              <button
                on:click={() => editProduct(row)}
                disabled={formLoading}
                class="text-blue-600 hover:text-blue-900 font-medium disabled:text-blue-300 disabled:cursor-not-allowed"
              >
                Edit
              </button>
              <button
                on:click={() => deleteProduct(row.priceID!)}
                disabled={formLoading}
                class="text-red-600 hover:text-red-900 font-medium disabled:text-red-300 disabled:cursor-not-allowed"
              >
                Delete
              </button>
            </div>
          </td>
        </svelte:fragment>

        <!-- Custom empty state -->
        <svelte:fragment slot="empty">
          <div class="flex flex-col items-center gap-2 py-8">
            <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p class="text-lg font-medium">No products found</p>
            <p class="text-sm text-gray-500">Add your first product using the form on the left</p>
          </div>
        </svelte:fragment>
      </DataTable>
    </div>
  </div>
</main>

<style>
  input:focus {
    outline: none;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>
