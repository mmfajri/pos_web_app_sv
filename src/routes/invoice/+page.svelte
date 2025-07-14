<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import { logout } from "$lib/utils/logout";
  import { SvelteDate } from "svelte/reactivity";
  import type { TransactionItem } from "$lib/models/TransactionItems";
  import type { Product } from "$lib/models/Product";
  import { TransactionController } from "$lib/controllers/TransactionController";
  import { onMount } from "svelte";

  let invoiceDate = new SvelteDate();

  const products: Product[] = [
    { code: "A123", description: "Mousepad", price: 8.99, category: "OFF", product_name: "Razor MousePad" },
    { code: "B456", description: "Pen", price: 0.99, category: "PENS", product_name: "2B Exam Pencil" },
  ];

  const transactionController = new TransactionController(products);

  let items = transactionController.getItem();
  let codeInput: string = "";

  function handleAdd() {
    if (transactionController.addItemByCode(codeInput)) {
      codeInput = "";
      items = transactionController.getItem();
    } else {
      alert("Product code not found");
    }
  }

  function updateQty(index: number, qty: number) {
    transactionController.updateQuantity(index, qty);
    items = transactionController.getItem();
  }

  function removeItem(index: number) {
    transactionController.removeItem(index);
    items = transactionController.getItem();
  }

  // Sync to localStorage
  // onMount(() => {
  //  transactionController.load
  // })

  $: subtotal = transactionController.getSubTotal().toFixed(2);
</script>

<Navbar onLogout={logout}></Navbar>

<div class="border rounded-lg shadow bg-white w-full">
  <div class="p-4 border-b">
    <h2 class="text-lg font-semibold">Invoices Date {invoiceDate}</h2>
    <div class="mt-2 grid grid-cols-2 gap-4 text-sm">
      <div>
        <label for="date-invoice" class="font-medium">Date :</label>
        <input type="date" bind:value={invoiceDate} class="border rounded px-2 py-1 mt-1" readonly />
      </div>
    </div>
  </div>

  <!-- Table -->
  <div class="overflow-auto max-h-[400px]">
    <table class="min-w-full text-sm">
      <thead class="bg-gray-100 sticky top-0">
        <tr>
          <th class="border px-2 py-1 text-left">Product Name</th>
          <th class="border px-2 py-1 text-left">Category</th>
          <th class="border px-2 py-1 text-left">Description</th>
          <th class="border px-2 py-1 text-right">Qty</th>
          <th class="border px-2 py-1 text-right">Price</th>
          <th class="border px-2 py-1 text-right">Amount</th>
          <th class="border px-2 py-1 text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        {#each items as item, index}
          <tr>
            <td class="border px-2 py-1">{item}</td>
            <td class="border px-2 py-1">{item.code}</td>
            <td class="border px-2 py-1">{item.description}</td>
            <td class="border px-2 py-1 text-right">
              <input
                type="number"
                class="w-16 text-right border px-1 rounded"
                min="1"
                bind:value={item.quantity}
                on:change={() => updateQty(index, item.quantity)}
              />
            </td>
            <td class="border px-2 py-1 text-right">{item.quantity}</td>
            <td class="border px-2 py-1 text-right">${item.price.toFixed(2)}</td>
            <td class="border px-2 py-1 text-right">${item.amount.toFixed(2)}</td>
            <td class="border px-2 py-1 text-center">
              <button
                on:click={() => removeItem(index)}
                class="text-red-600 font-semibold hover:underlined"
                title="Remove"
              >
                X
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Footer -->
  <div class="flex justify-end p-4 border-t bg-gray-50">
    <div class="text-sm space-y-1 text-right">
      <div>
        <span class="font-medium">Subtotal:</span>
        <span class="ml-2">${subtotal}</span>
      </div>
      <div>
        <span class="font-medium">Misc:</span>
        <span class="ml-2">$0.00</span>
      </div>
      <div>
        <span class="font-medium">Tax:</span>
        <span class="ml-2">0%</span>
      </div>
      <div class="text-lg font-bold">
        Total: <span class="ml-2">${subtotal}</span>
      </div>
    </div>
  </div>
</div>
