<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import Navbar from "$lib/components/Navbar.svelte";
  import { logout } from "$lib/utils/logout";
  import {
    getTransactionDetail,
    type TransactionItemApiDetail,
  } from "$lib/controllers/TransactionController";

  let transactionId: number;
  let items: TransactionItemApiDetail[] = [];
  let loading = true;
  let errorMsg = "";

  $: transactionId = parseInt($page.params.id);

  function getTotal(): number {
    return parseFloat(
      items.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0).toFixed(2)
    );
  }

  onMount(async () => {
    try {
      items = await getTransactionDetail(transactionId);
      if (items.length === 0) {
        errorMsg = "No items found for this transaction.";
      }
    } catch (e) {
      errorMsg = "Failed to load transaction details.";
    } finally {
      loading = false;
    }
  });
</script>

<Navbar onLogout={logout}></Navbar>
<main class="p-4">
  <div class="flex items-center gap-3 mb-4">
    <button
      on:click={() => goto("/transaction-history")}
      class="text-blue-600 hover:underline text-sm font-medium"
    >
      ← Back to Transaction History
    </button>
  </div>

  <h1 class="text-2xl font-bold mb-4">Transaction #{transactionId} — Detail</h1>

  {#if loading}
    <p class="text-gray-500">Loading...</p>
  {:else if errorMsg}
    <p class="text-red-600">{errorMsg}</p>
  {:else}
    <div class="overflow-auto rounded-lg border shadow bg-white">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="border px-3 py-2 text-left">Barcode</th>
            <th class="border px-3 py-2 text-left">Title</th>
            <th class="border px-3 py-2 text-left">Unit</th>
            <th class="border px-3 py-2 text-right">Qty</th>
            <th class="border px-3 py-2 text-right">Price</th>
            <th class="border px-3 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {#each items as item}
            <tr class="hover:bg-gray-50">
              <td class="border px-3 py-2">{item.barcodeId}</td>
              <td class="border px-3 py-2">{item.titleProduct}</td>
              <td class="border px-3 py-2">{item.quantityType}</td>
              <td class="border px-3 py-2 text-right">{item.quantity}</td>
              <td class="border px-3 py-2 text-right">${(item.priceProduct ?? 0).toFixed(2)}</td>
              <td class="border px-3 py-2 text-right">${(item.totalPrice ?? 0).toFixed(2)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="flex justify-end mt-4">
      <div class="text-right">
        <span class="text-lg font-semibold">Total: </span>
        <span class="text-xl font-bold">${getTotal().toFixed(2)}</span>
      </div>
    </div>
  {/if}
</main>
