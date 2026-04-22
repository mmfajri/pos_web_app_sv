<script lang="ts">
  import { onMount } from "svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import DataTable from "$lib/components/DataTable.svelte";
  import type { Column, DataTableParams } from "$lib/components/DataTable.svelte";
  import { logout } from "$lib/utils/logout";
  import {
    getTransactionsPaginated,
    type TransactionListItem,
  } from "$lib/controllers/TransactionController";

  let data: TransactionListItem[] = [];
  let totalRecords = 0;
  let currentPage = 1;
  let rowsPerPage = 10;
  let sortColumn = "id";
  let sortColumnDir: "asc" | "desc" = "desc";
  let loading = false;
  let dateFilter = "";

  const columns: Column<TransactionListItem>[] = [
    { key: "id", label: "ID", sortable: true },
    {
      key: "transactionDate",
      label: "Date",
      sortable: true,
      format: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      key: "totalAmmount",
      label: "Total Amount",
      sortable: true,
      format: (v: number) => `$${(v ?? 0).toFixed(2)}`,
    },
  ];

  async function loadData(params?: DataTableParams) {
    loading = true;
    try {
      const result = await getTransactionsPaginated({
        sortColumn: params?.sortColumn ?? sortColumn,
        sortColumnDir: params?.sortColumnDir ?? sortColumnDir,
        rowsPerPage: params?.rowsPerPage ?? rowsPerPage,
        pageNumber: params?.pageNumber ?? currentPage,
        transactionDate: dateFilter || undefined,
      });
      data = result.data;
      totalRecords = result.totalRecords;
      currentPage = result.currentPage;
    } catch (e) {
      console.error("Failed to load transactions:", e);
    } finally {
      loading = false;
    }
  }

  function handleParamsChange(event: CustomEvent<DataTableParams>) {
    const params = event.detail;
    sortColumn = params.sortColumn;
    sortColumnDir = params.sortColumnDir;
    rowsPerPage = params.rowsPerPage;
    currentPage = params.pageNumber;
    loadData(params);
  }

  function handleDateFilter() {
    currentPage = 1;
    loadData();
  }

  function clearDateFilter() {
    dateFilter = "";
    currentPage = 1;
    loadData();
  }

  onMount(() => loadData());
</script>

<Navbar onLogout={logout}></Navbar>
<main class="p-4">
  <h1 class="text-2xl font-bold mb-4">Transaction History</h1>

  <div class="flex items-center gap-3 mb-4">
    <label for="date-filter" class="text-sm font-medium text-gray-700">Filter by Date:</label>
    <input
      id="date-filter"
      type="date"
      bind:value={dateFilter}
      class="border rounded px-2 py-1 text-sm"
    />
    <button
      on:click={handleDateFilter}
      class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
    >
      Filter
    </button>
    {#if dateFilter}
      <button
        on:click={clearDateFilter}
        class="text-gray-500 text-sm hover:underline"
      >
        Clear
      </button>
    {/if}
  </div>

  <DataTable
    {columns}
    {data}
    {totalRecords}
    {currentPage}
    {rowsPerPage}
    {sortColumn}
    {sortColumnDir}
    {loading}
    getRowKey={(row) => row.id}
    on:paramsChange={handleParamsChange}
  >
    <svelte:fragment slot="header-actions">
      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
    </svelte:fragment>
    <svelte:fragment slot="actions" let:row>
      <td class="px-4 py-3 text-sm">
        <a
          href="/transaction-history/{row.id}"
          class="text-blue-600 hover:underline font-medium"
        >
          View
        </a>
      </td>
    </svelte:fragment>
  </DataTable>
</main>
