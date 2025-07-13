<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import { logout } from "$lib/utils/logout";
  import { SvelteDate } from "svelte/reactivity";

  let invoiceDate = new SvelteDate();
</script>

<Navbar onLogout={logout}></Navbar>

<div class="border rounded-lg shadow bg-white w-full">
  <div class="p-4 border-b">
    <h2 class="text-lg font-semibold">Invoices Date {invoiceDate}</h2>
    <div class="mt-2 grid grid-cols-2 gap-4 text-sm">
      <div>
        <label for="date-invoice" class="font-medium">Date :</label>
        <input type="date" bind:value={invoiceDate} class="border rounded px-2 py-1 mt-1" />
      </div>
    </div>
  </div>
</div>
