<script lang="ts">
  import type { TransactionItem } from "$lib/models/TransactionItems";
  import { logout } from "$lib/utils/logout";
  import Navbar from "$lib/components/Navbar.svelte";
  import { getItemByBarcodeId, getSubtotal, removeItem, updateQuantity } from "$lib/controllers/InvoiceController";

  import "$lib/styles/no_spinner.css";

  let invoiceDate = $state(new Date());
  let codeInput = $state("");
  let items = $state<TransactionItem[]>([]);

  const subtotal = $derived(() => getSubtotal(items).toFixed(2));

  async function handleAdd() {
    // Check if item already exists in the list
    const existingIndex = items.findIndex(
      (item) => item.barcodeId === codeInput && item.quantityType === item.quantityType,
    );

    if (existingIndex !== -1) {
      // Item exists - increase quantity by 1
      const newQuantity = items[existingIndex].quantity + 1;
      items = updateQuantity(items, existingIndex, newQuantity);
      codeInput = "";
    } else {
      // Item doesn't exist - add new item
      const updated = await getItemByBarcodeId(items, codeInput);
      if (updated !== null && updated.length !== items.length) {
        items = updated;
        codeInput = "";
      } else {
        alert("Product Not Found");
      }
    }
  }

  function handleQtyChange(index: number, qty: number) {
    items = updateQuantity(items, index, qty);
  }

  function handleRemove(index: number) {
    items = removeItem(items, index);
  }

  function handlePriceChange(index: number, newPrice: number) {
    items = items.map((item, i) => {
      if (i === index) {
        const updateTotalPrice = parseFloat((item.quantity * newPrice).toFixed(2));
        return {
          ...item,
          price: newPrice,
          totalPrice: updateTotalPrice,
        };
      }
      return item;
    });
  }

  // Handle unit change - fetch new price for the selected unit
  async function handleUnitChange(index: number, newUnit: string) {
    const item = items[index];

    // Call API with the new unit
    const updated = await getItemByBarcodeId([], item.barcodeId, newUnit);

    if (updated !== null && updated.length > 0) {
      const newItemData = updated[0];

      // Update the item at the index with new price and unit
      items[index] = {
        ...item,
        quantityType: newItemData.quantityType,
        price: newItemData.price,
        totalPrice: item.quantity * newItemData.price,
        listUnit: newItemData.listUnit,
      };

      // Trigger reactivity
      items = items;
    } else {
      alert("Failed to update unit");
    }
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
            <th class="border px-2 py-1 text-left">Barcode</th>
            <th class="border px-2 py-1 text-left">Title</th>
            <th class="border px-2 py-1 text-left">Unit</th>
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
              <td class="border px-2 py-1">
                {#if item.listUnit && item.listUnit.length > 1}
                  <!-- Dropdown if multiple units available -->
                  <select
                    class="border rounded px-1 py-1 text-sm w-full"
                    value={item.quantityType}
                    onchange={(e) => handleUnitChange(index, e.currentTarget.value)}
                  >
                    {#each item.listUnit as unit}
                      <option value={unit.name}>{unit.name}</option>
                    {/each}
                  </select>
                {:else}
                  <!-- Just display if only one unit -->
                  <span>{item.quantityType}</span>
                {/if}
              </td>
              <td class="border px-2 py-1 text-right">
                <input
                  type="number"
                  class="w-16 text-right border px-1 rounded"
                  min="1"
                  bind:value={item.quantity}
                  onchange={() => handleQtyChange(index, item.quantity)}
                />
              </td>
              <td class="border px-2 py-1 text-right">
                <input
                  type="number"
                  class="no-spinner max-w-20 text-right"
                  value={item.price}
                  onchange={(e) => handlePriceChange(index, parseFloat(e.currentTarget.value))}
                />
              </td>
              <td class="border px-2 py-1 text-right">${item.totalPrice.toFixed(2)}</td>
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
