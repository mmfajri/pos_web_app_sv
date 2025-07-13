<script lang="ts">
  let invoiceDate = "2025-07-13";
  let customer = "Johnny's Lumber Supply";
  let invoiceNo = "38A";

  let items = [
    { dept: "PM", catg: "OFF", desc: "8 x 9.5 Soft Mousepad", qty: 4, price: 8.99, amount: 35.96, t: "T" },
    { dept: "OFF", catg: "PENS", desc: "Ball Point Pen-Fine Pt. Blue", qty: 1, price: 0.99, amount: 0.99, t: "T" },
    { dept: "OFF", catg: "ENVL", desc: "Envelope, #10 Window Env. 500", qty: 3, price: 14.99, amount: 44.97, t: "T" },
    { dept: "OFF", catg: "SUP", desc: "Standard Stapler", qty: 3, price: 7.59, amount: 22.77, t: "T" },
    { dept: "OFF", catg: "SUP", desc: "Staples - Jumbo Box", qty: 1, price: 1.99, amount: 1.99, t: "T" },
    { dept: "HW", catg: "PRIN", desc: "Printer, Laser C3PO", qty: 1, price: 299.49, amount: 299.49, t: "T" },
    { dept: "HW", catg: "COMP", desc: "Cable, Parallel Printer", qty: 1, price: 8.99, amount: 8.99, t: "T" },
  ];

  // totals
  $: subtotal = items.reduce((sum, item) => sum + item.amount, 0).toFixed(2);
</script>

<div class="border rounded-lg shadow bg-white w-full">
  <!-- Header -->
  <div class="p-4 border-b">
    <h2 class="text-lg font-semibold">Sales Invoice from Sales Order on {invoiceDate}</h2>
    <div class="mt-2 grid grid-cols-2 gap-4 text-sm">
      <div>
        <label class="font-medium">Customer:</label>
        <input type="text" bind:value={customer} class="border rounded px-2 py-1 w-full mt-1" />
      </div>
      <div class="flex items-end gap-2">
        <div>
          <label class="font-medium">No.:</label>
          <input type="text" bind:value={invoiceNo} class="border rounded px-2 py-1 w-20 mt-1" />
        </div>
        <div>
          <label class="font-medium">Date:</label>
          <input type="date" bind:value={invoiceDate} class="border rounded px-2 py-1 mt-1" />
        </div>
      </div>
    </div>
  </div>

  <!-- Table -->
  <div class="overflow-auto max-h-[400px]">
    <table class="min-w-full text-sm">
      <thead class="bg-gray-100 sticky top-0">
        <tr>
          <th class="border px-2 py-1 text-left">Dept</th>
          <th class="border px-2 py-1 text-left">Catg</th>
          <th class="border px-2 py-1 text-left">Description</th>
          <th class="border px-2 py-1 text-right">Qty</th>
          <th class="border px-2 py-1 text-right">Price</th>
          <th class="border px-2 py-1 text-right">Amount</th>
          <th class="border px-2 py-1 text-center">T</th>
        </tr>
      </thead>
      <tbody>
        {#each items as item}
          <tr>
            <td class="border px-2 py-1">{item.dept}</td>
            <td class="border px-2 py-1">{item.catg}</td>
            <td class="border px-2 py-1">{item.desc}</td>
            <td class="border px-2 py-1 text-right">{item.qty}</td>
            <td class="border px-2 py-1 text-right">${item.price.toFixed(2)}</td>
            <td class="border px-2 py-1 text-right">${item.amount.toFixed(2)}</td>
            <td class="border px-2 py-1 text-center">{item.t}</td>
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
