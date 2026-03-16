<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import { logout } from "$lib/utils/logout";
  import {
    getTransactionDetail,
    updateTransactionItems,
    type TransactionItemApiDetail,
    type UpdateTransactionItemRequest,
  } from "$lib/controllers/TransactionController";
  import { addItemByCode, getSubtotal, removeItem, updateQuantity } from "$lib/controllers/InvoiceController";
  import type { TransactionItem } from "$lib/models/TransactionItems";

  const transactionId = Number($page.params.id);

  let items: TransactionItem[] = [];
  let loading = true;
  let saving = false;
  let codeInput = "";
  let message = "";
  let messageType: "success" | "error" = "success";

  $: subtotal = getSubtotal(items).toFixed(2);

  onMount(async () => {
    await loadItems();
  });

  async function loadItems() {
    loading = true;
    message = "";
    try {
      const detail = await getTransactionDetail(transactionId);
      items = detail.map((d: TransactionItemApiDetail) => ({
        barcodeId: d.barcodeId ?? "",
        title: d.titleProduct ?? "",
        quantityType: d.quantityType ?? "",
        quantity: d.quantity ?? 0,
        price: d.priceProduct ?? 0,
        totalPrice: d.totalPrice ?? 0,
        discount: 0,
        taxable: false,
        listUnit: [],
      }));
    } catch (e) {
      console.error("Failed to load transaction items:", e);
      message = "Failed to load transaction items.";
      messageType = "error";
    } finally {
      loading = false;
    }
  }

  async function handleAdd() {
    const updated = await addItemByCode(items, codeInput);
    if (updated !== null && updated.length !== items.length) {
      items = updated;
      codeInput = "";
    } else {
      alert("Product Not Found");
    }
  }

  function handleQtyChange(index: number, qty: number) {
    items = updateQuantity(items, index, qty);
  }

  function handleRemove(index: number) {
    items = removeItem(items, index);
  }

  async function handleSave() {
    saving = true;
    message = "";
    try {
      const req: UpdateTransactionItemRequest = {
        transactionId: transactionId,
        listTransactionItem: items.map((item) => ({
          barcodeId: item.barcodeId,
          titleProduct: item.title,
          quantityType: item.quantityType,
          quantity: item.quantity,
          priceProduct: item.price,
          totalPrice: item.totalPrice,
        })),
      };
      await updateTransactionItems(req);
      message = "Transaction items updated successfully.";
      messageType = "success";
      await loadItems();
    } catch (e: any) {
      console.error("Failed to update transaction items:", e);
      message = e?.message || "Failed to update transaction items.";
      messageType = "error";
    } finally {
      saving = false;
    }
  }
</script>

<Navbar onLogout={logout}></Navbar>

<div class="flex flex-col min-h-screen">
  <main class="flex-1 overflow-y-auto p-4">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Edit Transaction #{transactionId} Items</h1>
      <a href="/dashboard" class="text-blue-600 hover:underline">&larr; Back to Transactions</a>
    </div>

    {#if message}
      <div
        class="mb-4 px-4 py-2 rounded {messageType === 'success'
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'}"
      >
        {message}
      </div>
    {/if}

    <div class="p-4 bg-white border rounded-lg shadow">
      <input
        type="text"
        bind:value={codeInput}
        on:keydown={(e) => e.key === "Enter" && handleAdd()}
        class="border px-2 py-1 rounded mr-2"
        placeholder="Enter Product Code"
      />
      <button on:click={handleAdd} class="bg-blue-500 text-white px-3 py-1 rounded">Add Item</button>
    </div>

    {#if loading}
      <div class="flex justify-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-500">Loading...</span>
      </div>
    {:else}
      <div class="overflow-auto max-h-[400px] mt-4">
        <table class="min-w-full text-sm bg-white rounded-lg shadow">
          <thead class="bg-gray-100 sticky top-0">
            <tr>
              <th class="border px-2 py-1 text-left">Barcode</th>
              <th class="border px-2 py-1 text-left">Title</th>
              <th class="border px-2 py-1 text-left">Qty Type</th>
              <th class="border px-2 py-1 text-right">Qty</th>
              <th class="border px-2 py-1 text-right">Price</th>
              <th class="border px-2 py-1 text-right">Amount</th>
              <th class="border px-2 py-1 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {#each items as item, index}
              <tr>
                <td class="border px-2 py-1">{item.barcodeId}</td>
                <td class="border px-2 py-1">{item.title}</td>
                <td class="border px-2 py-1">{item.quantityType}</td>
                <td class="border px-2 py-1 text-right">
                  <input
                    type="number"
                    class="w-16 text-right border px-1 rounded"
                    min="1"
                    bind:value={item.quantity}
                    on:change={() => handleQtyChange(index, item.quantity)}
                  />
                </td>
                <td class="border px-2 py-1 text-right">${item.price.toFixed(2)}</td>
                <td class="border px-2 py-1 text-right">${item.totalPrice.toFixed(2)}</td>
                <td class="border px-2 py-1 text-center">
                  <button
                    on:click={() => handleRemove(index)}
                    class="text-red-600 font-semibold hover:underline"
                    title="Remove"
                  >
                    X
                  </button>
                </td>
              </tr>
            {/each}
            {#if items.length === 0}
              <tr>
                <td colspan="7" class="border px-2 py-4 text-center text-gray-500">
                  No items. Add products using the barcode input above.
                </td>
              </tr>
            {/if}
          </tbody>
        </table>
      </div>
    {/if}
  </main>

  <footer class="bg-gray-100 border-t border-gray-300 p-4 shadow-inner sticky bottom-0 z-10">
    <div class="flex justify-between items-center">
      <button
        on:click={handleSave}
        disabled={saving}
        class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
      <div class="text-right">
        <div class="text-lg">
          Subtotal: <strong class="text-xl">${subtotal}</strong>
        </div>
      </div>
    </div>
  </footer>
</div>
