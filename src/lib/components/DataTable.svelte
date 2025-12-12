<script lang="ts" context="module">
  // Move exported types here
  export interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    format?: (value: any, row: T) => string;
  }

  export interface DataTableParams {
    sortColumn: string;
    sortColumnDir: 'asc' | 'desc';
    rowsPerPage: number;
    pageNumber: number;
  }

  export interface DataTableResponse<T> {
    data: T[];
    totalRecords: number;
    currentPage: number;
    totalPages: number;
  }
</script>

<script lang="ts" generics="T">
  import { createEventDispatcher } from 'svelte';

  // Props
  export let columns: Column<T>[] = [];
  export let data: T[] = [];
  export let totalRecords: number = 0;
  export let currentPage: number = 1;
  export let rowsPerPage: number = 10;
  export let sortColumn: string = '';
  export let sortColumnDir: 'asc' | 'desc' = 'asc';
  export let loading: boolean = false;
  export let rowsPerPageOptions: number[] = [5, 10, 25, 50, 100];

  // Optional: Custom row key
  export let getRowKey: (row: T, index: number) => string | number = (row, index) => index;

  const dispatch = createEventDispatcher<{
    paramsChange: DataTableParams;
  }>();

  // ✅ Set default sortColumn to first column if not provided
  let isInitialized = false;

  $: if (!isInitialized && columns.length > 0 && !sortColumn) {
    sortColumn = String(columns[0].key);
    isInitialized = true;
    // Use setTimeout to avoid triggering during initialization
    setTimeout(() => {
      emitParamsChange();
    }, 0);
  }

  // Computed values
  $: totalPages = Math.ceil(totalRecords / rowsPerPage);
  $: startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  $: endRecord = Math.min(currentPage * rowsPerPage, totalRecords);

  // Debug reactive data changes
  $: console.log("[DataTable] Data received:", data);
  $: console.log("[DataTable] Data length:", data?.length);
  $: console.log("[DataTable] totalRecords:", totalRecords);
  $: console.log("[DataTable] currentPage:", currentPage);
  $: console.log("[DataTable] loading:", loading);

  // Pagination range
  $: paginationRange = getPaginationRange(currentPage, totalPages);

  function getPaginationRange(current: number, total: number): number[] {
    const delta = 2; // Number of pages to show on each side
    const range: number[] = [];
    
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      range.unshift(-1); // Ellipsis
    }
    if (current + delta < total - 1) {
      range.push(-1); // Ellipsis
    }

    range.unshift(1); // First page
    if (total > 1) {
      range.push(total); // Last page
    }

    return range;
  }

  // Handle sorting
  function handleSort(column: Column<T>) {
    if (!column.sortable) return;

    const columnKey = String(column.key);
    
    if (sortColumn === columnKey) {
      // Toggle direction
      sortColumnDir = sortColumnDir === 'asc' ? 'desc' : 'asc';
    } else {
      // New column
      sortColumn = columnKey;
      sortColumnDir = 'asc';
    }

    emitParamsChange();
  }

  // Handle page change
  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;
    emitParamsChange();
  }

  // Handle rows per page change
  function handleRowsPerPageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    rowsPerPage = parseInt(select.value);
    currentPage = 1; // Reset to first page
    emitParamsChange();
  }

  // Emit params change event
  function emitParamsChange() {
    dispatch('paramsChange', {
      sortColumn,
      sortColumnDir,
      rowsPerPage,
      pageNumber: currentPage,
    });
  }

  // Get cell value
  function getCellValue(row: T, column: Column<T>): string {
    const value = (row as any)[column.key];
    
    if (column.format) {
      return column.format(value, row);
    }
    
    return value != null ? String(value) : '';
  }
</script>

<div class="datatable-container">
  <!-- Table -->
  <div class="overflow-x-auto bg-white rounded-lg shadow">
    <table class="w-full">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          {#each columns as column (column.key)}
            <th
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              class:cursor-pointer={column.sortable}
              class:select-none={column.sortable}
              on:click={() => handleSort(column)}
            >
              <div class="flex items-center gap-2">
                <span>{column.label}</span>
                {#if column.sortable}
                  <span class="sort-icon">
                    {#if sortColumn === String(column.key)}
                      {#if sortColumnDir === 'asc'}
                        <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" />
                        </svg>
                      {:else}
                        <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" />
                        </svg>
                      {/if}
                    {:else}
                      <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                      </svg>
                    {/if}
                  </span>
                {/if}
              </div>
            </th>
          {/each}
          <slot name="header-actions" />
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        {#if loading}
          <tr>
            <td colspan={columns.length + 1} class="px-4 py-8 text-center">
              <div class="flex items-center justify-center gap-2 text-gray-500">
                <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>Loading...</span>
              </div>
            </td>
          </tr>
        {:else if data.length === 0}
          <tr>
            <td colspan={columns.length + 1} class="px-4 py-8 text-center text-gray-500">
              <slot name="empty">
                <div class="flex flex-col items-center gap-2">
                  <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p>No data found</p>
                </div>
              </slot>
            </td>
          </tr>
        {:else}
          {#each data as row, index (getRowKey(row, index))}
            <tr class="hover:bg-gray-50">
              {#each columns as column (column.key)}
                <td class="px-4 py-3 text-sm text-gray-900">
                  <slot name="cell" {row} {column} value={getCellValue(row, column)}>
                    {getCellValue(row, column)}
                  </slot>
                </td>
              {/each}
              <slot name="actions" {row} {index} />
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-4 py-3 bg-white rounded-lg shadow">
    <!-- Rows per page -->
    <div class="flex items-center gap-2">
      <label for="rowsPerPage" class="text-sm text-gray-700">Rows per page:</label>
      <select
        id="rowsPerPage"
        bind:value={rowsPerPage}
        on:change={handleRowsPerPageChange}
        disabled={loading}
        class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {#each rowsPerPageOptions as option (option)}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </div>

    <!-- Record info -->
    <div class="text-sm text-gray-700">
      {#if totalRecords > 0}
        Showing {startRecord} to {endRecord} of {totalRecords} records
      {:else}
        No records
      {/if}
    </div>

    <!-- Pagination buttons -->
    <div class="flex items-center gap-1">
      <!-- Previous button -->
      <button
        type="button"
        on:click={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        class="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
      >
        Previous
      </button>

      <!-- Page numbers -->
      {#each paginationRange as page (page)}
        {#if page === -1}
          <span class="px-3 py-1 text-gray-500">...</span>
        {:else}
          <button
            type="button"
            on:click={() => handlePageChange(page)}
            disabled={loading}
            class="px-3 py-1 border rounded-md text-sm"
            class:bg-blue-600={page === currentPage}
            class:text-white={page === currentPage}
            class:border-blue-600={page === currentPage}
            class:border-gray-300={page !== currentPage}
            class:hover:bg-gray-50={page !== currentPage}
            class:disabled:opacity-50={loading}
            class:disabled:cursor-not-allowed={loading}
          >
            {page}
          </button>
        {/if}
      {/each}

      <!-- Next button -->
      <button
        type="button"
        on:click={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        class="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
      >
        Next
      </button>
    </div>
  </div>
</div>

<style>
  .cursor-pointer {
    cursor: pointer;
  }

  .select-none {
    user-select: none;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>