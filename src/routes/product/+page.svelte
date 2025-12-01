<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import Dropdown from "$lib/components/dropdown.svelte";
  import { logout } from "$lib/utils/logout";
  import { onMount } from "svelte";
  import { getAllUnits, getUnitsByName, type Unit } from "$lib/controllers/UnitController";
  import {
    getAllProducts,
    createProduct as createProductAPI,
    updateProduct as updateProductAPI,
    deleteProduct as deleteProductAPI,
    type Product,
  } from "$lib/controllers/ProductController";

  let error: string | null = null;
  let loading: boolean = false;

  // Form data
  let formData: Product = {
    barcodeID: "",
    title: "",
    quantityType: "",
    amount: 0,
  };

  // Product list
  let products: Product[] = [];
  let editingId: number | null = null;

  // Load products from API
  async function fetchProducts(barcodeID?: string) {
    loading = true;
    try {
      products = await getAllProducts(barcodeID);
      console.log('Products loaded:', products);
      error = null;
    } catch (err: unknown) {
      error = "Failed to load products. Please try again.";
      console.error("Fetch products error:", err);
    } finally {
      loading = false;
    }
  }

  // Handle unit selection from dropdown
  function handleUnitSelect(event: CustomEvent<Unit>) {
    formData.quantityType = event.detail.name;
    console.log("Selected unit:", event.detail);
  }

  // Handle unit clear
  function handleUnitClear() {
    formData.quantityType = "";
  }

  // Search function for units (optional)
  async function searchUnits(term: string): Promise<Unit[]> {
    const unit = await getUnitsByName(term);
    return unit ? [unit] : [];
  }

  // Load products on component mount
  onMount(() => {
    fetchProducts();
  });

  // Handle form submission
  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (editingId !== null) {
      await updateProduct();
    } else {
      await createProduct();
    }
  }

  // Create new product
  async function createProduct() {
    try {
      loading = true;
      await createProductAPI(formData);
      console.log("Product created successfully");
      resetForm();
      await fetchProducts();
    } catch (err: unknown) {
      if (err instanceof Error) {
        error = err.message;
      } else {
        error = "Failed to create product";
      }
      console.error("Create product error:", err);
    } finally {
      loading = false;
    }
  }

  // Update existing product
  async function updateProduct() {
    try {
      loading = true;
      await updateProductAPI(formData);
      console.log("Product updated successfully");
      resetForm();
      await fetchProducts();
    } catch (err: unknown) {
      if (err instanceof Error) {
        error = err.message;
      } else {
        error = "Failed to update product";
      }
      console.error("Update product error:", err);
    } finally {
      loading = false;
    }
  }

  // Edit product
  function editProduct(product: Product) {
    formData = { ...product };
    editingId = product.id!;
  }

  // Delete product
  async function deleteProduct(id: number) {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        loading = true;
        await deleteProductAPI(id);
        console.log("Product deleted successfully");
        await fetchProducts();
      } catch (err: unknown) {
        if (err instanceof Error) {
          error = err.message;
        } else {
          error = "Failed to delete product";
        }
        console.error("Delete product error:", err);
      } finally {
        loading = false;
      }
    }
  }

  // Reset form
  function resetForm() {
    formData = {
      barcodeID: "",
      title: "",
      quantityType: "",
      amount: 0,
    };
    editingId = null;
    error = null;
  }
</script>

<Navbar onLogout={logout}></Navbar>

<main class="p-2">
  <!-- Title -->
  <h1 class="text-3xl font-bold underline mb-6">Product Management</h1>

  <!-- Main Page - split into two sections vertically -->
  <div class="flex flex-col lg:flex-row gap-8">
    <!-- Left Section - Form Input -->
    <div class="flex-1">
      <h2 class="text-2xl font-semibold mb-4">
        {editingId ? "Edit Product" : "Add New Product"}
      </h2>

      {#if error}
        <p class="text-red-500 text-sm mb-4">{error}</p>
      {/if}

      <form on:submit={handleSubmit} class="space-y-4 bg-white p-6 rounded-lg shadow-md">
        <!-- Barcode ID -->
        <div>
          <label for="barcodeID" class="block text-sm font-medium text-gray-700 mb-1">Barcode ID *</label>
          <input
            id="barcodeID"
            type="text"
            bind:value={formData.barcodeID}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter barcode ID"
          />
        </div>

        <!-- Title Product -->
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Product Title *</label>
          <input
            id="title"
            type="text"
            bind:value={formData.title}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            fetchAllItems={getAllUnits}
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
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        <!-- Form Buttons -->
        <div class="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {#if loading}
              Processing...
            {:else}
              {editingId ? "Update Product" : "Add Product"}
            {/if}
          </button>

          {#if editingId}
            <button
              type="button"
              on:click={resetForm}
              disabled={loading}
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          {/if}
        </div>
      </form>
    </div>

    <!-- Right Section - Product List -->
    <div class="flex-1">
      <h2 class="text-2xl font-semibold mb-4">Product List</h2>

      {#if loading}
        <div class="text-center py-8 text-gray-500">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p>Loading products...</p>
        </div>
      {:else if products.length === 0}
        <div class="text-center py-8 text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
          <p>No products found. Add your first product!</p>
        </div>
      {:else}
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barcode ID
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Title
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity Type
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              {#each products as product (product.id)}
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-900">
                    {product.barcodeID}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-900">
                    {product.title}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-900">
                    {product.quantityType}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-900">
                    ${product.amount.toFixed(2)}
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <div class="flex gap-2">
                      <button
                        on:click={() => editProduct(product)}
                        disabled={loading}
                        class="text-blue-600 hover:text-blue-900 font-medium disabled:text-blue-300 disabled:cursor-not-allowed"
                      >
                        Edit
                      </button>
                      <button
                        on:click={() => deleteProduct(product.id!)}
                        disabled={loading}
                        class="text-red-600 hover:text-red-900 font-medium disabled:text-red-300 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
  input:focus {
    outline: none;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>
