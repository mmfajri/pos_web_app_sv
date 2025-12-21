<script lang="ts">
  import type { TransactionItem, TransactionInvoice } from "$lib/models/TransactionItems";
  import { logout } from "$lib/utils/logout";
  import Navbar from "$lib/components/Navbar.svelte";
  import { getItemByBarcodeId, getSubtotal, removeItem, updateQuantity, saveTransactionInvoice } from "$lib/controllers/InvoiceController";
  import { DateTimeFormatter } from "$lib/utils/DatetimeFormatter";

  import "$lib/styles/no_spinner.css";

  let invoiceDate = $state(new Date());
  let codeInput = $state("");
  let items = $state<TransactionItem[]>([]);
  let payAmount = $state(0);

  const subtotal = $derived(() => getSubtotal(items).toFixed(2));
  const changeAmount = $derived(() => (payAmount - parseFloat(subtotal())).toFixed(2));

  // ✅ Format for date input (yyyy-MM-dd)
  const dateInputValue = $derived(() => DateTimeFormatter.toString(invoiceDate, "yyyy-MM-dd"));

  // Realtime Config - Update every second
  $effect(() => {
    const interval = setInterval(() => {
      invoiceDate = new Date();
    }, 1000);
    return () => clearInterval(interval);
  });

  async function SaveInvoice() {
    if (items.length === 0) {
      alert("No items to save");
      return;
    }

    if (payAmount < parseFloat(subtotal())) {
      alert("Pay amount must be greater than or equal to total");
      return;
    }

    // Convert listUnit array to comma-separated string for each item
    const itemsToSave: TransactionItem[] = items.map(item => ({
      ...item,
      listUnit: Array.isArray(item.listUnit) 
        ? item.listUnit.map(u => u.name).join(',')
        : item.listUnit
    }));

    const transactionData: TransactionInvoice = {
      transactionDate: DateTimeFormatter.toString(invoiceDate, "yyyy-MM-dd HH:mm:ss"),
      accountPos: 1, // You may want to make this dynamic
      totalTransaction: parseFloat(subtotal()),
      payAmount: payAmount,
      transactionItem: itemsToSave
    };

    const success = await saveTransactionInvoice(transactionData);
    
    if (success) {
      alert("Invoice saved successfully!");
      // Clear the form
      items = [];
      codeInput = "";
      payAmount = 0;
    } else {
      alert("Failed to save invoice");
    }
  }

  async function handleAdd() {
    // Check if item already exists in the list with same barcode
    const existingIndex = items.findIndex(
      (item) => item.barcodeId === codeInput,
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
        <!-- ✅ Display formatted date with time -->
        <div class="mt-2 grid grid-cols-2 text-sm">
          <div>
            <label for="date-invoice" class="font-medium">Date :</label>
            <!-- ✅ Show date in yyyy-MM-dd format for input -->
            <input type="date" value={dateInputValue()} class="py-1 mt-1" readonly />
            ||
            <input type="text" value={DateTimeFormatter.toString(invoiceDate, "HH:mm:ss")} class="py-1 mt-1" readonly />
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
                  class="no-spinner w-16 text-right border px-1 rounded"
                  min="1"
                  bind:value={item.quantity}
                  onchange={() => handleQtyChange(index, item.quantity)}
                />
              </td>
              <td class="border px-2 py-1 text-right">
                <input
                  type="number"
                  class="no-spinner w-20 text-right border px-1 rounded"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onchange={(e) => handlePriceChange(index, parseFloat(e.currentTarget.value))}
                />
              </td>
              <td class="border px-2 py-1 text-right font-semibold">${item.totalPrice.toFixed(2)}</td>
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
    <div class="flex justify-between items-end">
      <div>
        <button 
          onclick={SaveInvoice}
          class="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded shadow"
        >
          Save Invoice
        </button>
      </div>
      <div class="space-y-2 text-right">
        <div>
          Subtotal : <strong>${subtotal()}</strong>
        </div>
        <div>
          Misc : <strong>$0.00</strong>
        </div>
        <div>
          Tax: <strong>0%</strong>
        </div>
        <div class="text-lg mt-2 border-t pt-2">
          Total: <strong class="text-xl">${subtotal()}</strong>
        </div>
        <div class="flex items-center justify-end gap-2 mt-2">
          <label class="font-medium">Pay Amount:</label>
          <input
            type="number"
            class="no-spinner border rounded px-3 py-1 w-32 text-right"
            min="0"
            step="0.01"
            bind:value={payAmount}
            placeholder="0.00"
          />
        </div>
        <div class="text-lg {parseFloat(changeAmount()) < 0 ? 'text-red-600' : 'text-green-600'}">
          Change: <strong>${changeAmount()}</strong>
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  /* Remove spinner arrows from number inputs */
  input[type="number"].no-spinner {
    -moz-appearance: textfield !important;
  }

  input[type="number"].no-spinner::-webkit-outer-spin-button,
  input[type="number"].no-spinner::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0 !important;
  }
</style>
