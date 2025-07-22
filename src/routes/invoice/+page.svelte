<script lang="ts">
  import type { Product } from "$lib/models/Product";
  import type { TransactionItem } from "$lib/models/TransactionItems";
  import { logout } from "$lib/utils/logout";
  import Navbar from "$lib/components/Navbar.svelte";
  import { addItemByCode, getSubtotal, removeItem, updateQuantity } from "$lib/controllers/TransactionController";

  let invoiceDate = $state(new Date());
  let codeInput = $state("");

  const products: Product[] = [
    { code: "A123", description: "Mousepad", price: 8.99, category: "OFF", product_name: "Razor MousePad" },
    { code: "B456", description: "Pen", price: 0.99, category: "PENS", product_name: "2B Exam Pencil" },
  ];

  let items = $state<TransactionItem[]>([]);

  const subtotal = $derived(() => getSubtotal(items).toFixed(2));

  function handleAdd() {
    const updated = addItemByCode(products, items, codeInput);
    if (updated.length !== items.length) {
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
</script>

<Navbar onLogout={logout}></Navbar>

<div class="flex flex-col min-h-screen">
  <main class="flex-1 overflow-y-auto p-4">
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
    </div>

    <div class="p-4">
      <input
        type="text"
        bind:value={codeInput}
        onkeydown={(e) => e.key == "Enter" && handleAdd()}
        class="border px-2 py-1 rounded mr-2"
        placeholder="Enter Product Code"
      />
      <button onclick={handleAdd} class="bg-blue-500 text-white px-3 py-1 rounded">Add Item</button>
    </div>

    <!-- Table -->
    <div class="overflow-auto max-h-[400px]">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-100 sticky top-0">
          <tr>
            <th class="border px-2 py-1 text-left">Code</th>
            <th class="border px-2 py-1 text-left">Product Name</th>
            <th class="border px-2 py-1 text-right">Qty</th>
            <th class="border px-2 py-1 text-right">Price</th>
            <th class="border px-2 py-1 text-right">Amount</th>
            <th class="border px-2 py-1 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {#each items as item, index}
            <tr>
              <td class="border px-2 py-1">{item.code}</td>
              <td class="border px-2 py-1">{item.product_name}</td>
              <td class="border px-2 py-1 text-right">
                <input
                  type="number"
                  class="w-16 text-right border px-1 rounded"
                  min="1"
                  bind:value={item.quantity}
                  onchange={() => handleQtyChange(index, item.quantity)}
                />
              </td>
              <td class="border px-2 py-1 text-right">${item.price.toFixed(2)}</td>
              <td class="border px-2 py-1 text-right">${item.amount.toFixed(2)}</td>
              <td class="border px-2 py-1 text-center">
                <button
                  onclick={() => handleRemove(index)}
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
  </main>

  <!-- Footer -->
  <footer class="bg-gray-100 border-t border-gray-300 p-4 shadow-inner sticky bottom-0 z-10">
    <div class="flex justify-end space-x-8 text-right">
      <div>
        <div>
          Subtotal : <strong>${subtotal()}</strong>
        </div>
        <div>
          Misc : <strong>$0.00</strong>
        </div>
        <div>
          Tax: <strong>0%</strong>
        </div>
        <div class="text-lg mt-2">
          Total: <strong class="text-xl">${subtotal()}</strong>
        </div>
      </div>
    </div>
  </footer>
</div>
