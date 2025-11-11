<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import { logout } from "$lib/utils/logout";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { API_BASE_URL, API_ENDPOINTS } from "$lib/utils/const_variable";
  import type { ApiResponse } from "$lib/utils/ApiResponse";

  // Product interface
  interface Product {
    id?: number;
    barcodeID: string;
    title: string;
    quantityType: string;
    pricePerQty: number;
  }

  interface ProductModel {
    id?: number;
    barcodeID: string;
    title: string;
    unit: string;
    amount: number;
  }

  let error: string | null = null;
  let loading: boolean = false;

  // Form data
  let formData: Product = {
    barcodeID: "",
    title: "",
    quantityType: "",
    pricePerQty: 0,
  };

  // Product list
  let products: Product[] = [];
  let editingId: number | null = null; // Fixed: use | instead of ||

  // Load products from API
  async function fetchProducts(barcodeID?: string) {
    // Fixed parameter syntax
    loading = true;
    try {
      let url: string = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT}`; // Fixed: use backticks and correct variable name
      if (barcodeID) {
        url += `?barcodeID=${encodeURIComponent(barcodeID)}`; // Fixed: added ? and fixed string interpolation
      }
      const response: Response = await fetch(url); // Fixed: use url variable, not string 'url'
      if (response.ok) {
        debugger;
        const apiResponse: ApiResponse = await response.json();
        products = apiResponse.data;
        error = null;
      } else {
        error = `Failed to fetch products: ${response.status}`;
        console.error("Failed to fetch products:", response.status);
      }
    } catch (err: unknown) {
      error = "Network error. Please check your connection and try again.";
      console.error("Fetch products error:", err);
    } finally {
      loading = false;
    }
  }

  // Load products on component mount
  onMount(() => {
    fetchProducts();
  });

  // Handle form submission
  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (editingId !== null) {
      // Update existing product
      await updateProduct();
    } else {
      // Add new product
      await createProduct();
    }
  }

  // Create new product
  async function createProduct() {
    const createProductModel: ProductModel = {
      barcodeID: formData.barcodeID,
      title: formData.title,
      unit: formData.quantityType,
      amount: formData.pricePerQty,
    };

    try {
      loading = true;
      const response: Response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCT}/Create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createProductModel),
      });

      const result: ApiResponse = await response.json();

      if (response.ok) {
        console.log("Add Product successful:", result);
        resetForm();
        // Refresh the product list
        await fetchProducts();
      } else {
        // error = result.message || result.errors?.join(", ") || `Add Product failed with status: ${response.status}`;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        error = "Network error. Please check your connection and try again.";
        console.error("Registration error:", err.message);
      } else {
        error = "An unexpected error occurred";
        console.error("Unknown error:", err);
      }
    } finally {
      loading = false;
    }
  }

  // Update existing product
  async function updateProduct() {
    const updateProductModel: ProductModel = {
      barcodeID: formData.barcodeID,
      title: formData.title,
      unit: formData.quantityType,
      amount: formData.pricePerQty,
    };

    try {
      loading = true;
      const response: Response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCT}/Update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateProductModel),
      });

      const result: ApiResponse = await response.json();

      if (response.ok) {
        console.log("Update Product successful:", result);
        resetForm();
        // Refresh the product list
        await fetchProducts();
      } else {
        // error = result.message || result.errors?.join(", ") || `Update Product failed with status: ${response.status}`;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        error = "Network error. Please check your connection and try again.";
        console.error("Update error:", err.message);
      } else {
        error = "An unexpected error occurred";
        console.error("Unknown error:", err);
      }
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
        const response: Response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCT}/Delete/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          console.log("Delete Product successful");
          // Refresh the product list
          await fetchProducts();
        } else {
          error = `Delete Product failed with status: ${response.status}`;
          console.error("Failed to delete product:", response.status);
        }
      } catch (err: unknown) {
        error = "Network error. Please check your connection and try again.";
        console.error("Delete error:", err);
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
      pricePerQty: 0,
    };
    editingId = null;
    error = null;
  }

  // Quantity type options
  const quantityTypes = ["pcs", "ball", "kg", "gram", "liter", "ml", "pack", "box"];
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
          <select
            id="quantityType"
            bind:value={formData.quantityType}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select quantity type</option>
            {#each quantityTypes as type}
              <option value={type}>{type}</option>
            {/each}
          </select>
        </div>

        <!-- Price per Quantity -->
        <div>
          <label for="pricePerQty" class="block text-sm font-medium text-gray-700 mb-1">Price per Quantity *</label>
          <input
            id="pricePerQty"
            type="number"
            bind:value={formData.pricePerQty}
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

      {#if loading && products.length === 0}
        <div class="text-center py-8 text-gray-500">Loading products...</div>
      {:else if products.length === 0}
        <div class="text-center py-8 text-gray-500">No products found. Add your first product!</div>
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
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
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
                    ${product.pricePerQty.toFixed(2)}
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
  /* Additional styling if needed */
  input:focus,
  select:focus {
    outline: none;
    ring: 2px;
  }
</style>
