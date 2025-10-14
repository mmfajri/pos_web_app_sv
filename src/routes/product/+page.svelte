<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import { logout } from "$lib/utils/logout";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  // Product interface
  interface Product {
    id?: number;
    barcodeID: string;
    title: string;
    quantityType: string;
    pricePerQty: number;
  }

  // Form data
  let formData: Product = {
    barcodeID: "",
    title: "",
    quantityType: "",
    pricePerQty: 0,
  };

  // Product list
  let products: Product[] = [];
  let editingId: number | null = null;

  // Load products from localStorage or API
  onMount(() => {
    const savedProducts = localStorage.getItem("products");
    if (savedProducts) {
      products = JSON.parse(savedProducts);
    }
  });

  // Save products to localStorage
  function saveProducts() {
    localStorage.setItem("products", JSON.stringify(products));
  }

  // Handle form submission
  function handleSubmit(event: Event) {
    event.preventDefault();

    if (editingId !== null) {
      // Update existing product
      const index = products.findIndex((p) => p.id === editingId);
      if (index !== -1) {
        products[index] = { ...formData, id: editingId };
      }
      editingId = null;
    } else {
      // Add new product
      const newProduct: Product = {
        ...formData,
        id: Date.now(), // Simple ID generation
      };
      products = [...products, newProduct];
    }

    saveProducts();
    resetForm();
  }

  // Edit product
  function editProduct(product: Product) {
    formData = { ...product };
    editingId = product.id!;
  }

  // Delete product
  function deleteProduct(id: number) {
    if (confirm("Are you sure you want to delete this product?")) {
      products = products.filter((p) => p.id !== id);
      saveProducts();
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
            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {editingId ? "Update Product" : "Add Product"}
          </button>

          {#if editingId}
            <button
              type="button"
              on:click={resetForm}
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
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

      {#if products.length === 0}
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
                        class="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        on:click={() => deleteProduct(product.id!)}
                        class="text-red-600 hover:text-red-900 font-medium"
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
