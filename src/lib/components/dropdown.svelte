<script lang="ts" generics="T">
  import { createEventDispatcher, onMount } from "svelte";

  // Generic props
  export let value: string = "";
  export let placeholder: string = "";
  export let required: boolean = false;
  export let disabled: boolean = false;

  // Function to fetch all items
  export let fetchAllItems: () => Promise<T[]>;

  // Function to search items (optional - if not provided, only local filtering is used)
  export let searchItems: ((term: string) => Promise<T[]>) | null = null;

  // Function to extract display text from item
  export let getDisplayText: (item: T) => string;

  // Function to extract value from item (optional - default to displayText)
  export let getValue: ((item: T) => string) | null = null;

  // Function to get unique key for each item
  export let getKey: (item: T) => string | number;

  const dispatch = createEventDispatcher<{
    select: T;
    clear: void;
  }>();

  let searchTerm: string = value;
  let showDropdown: boolean = false;
  let filteredItems: T[] = [];
  let allItems: T[] = [];
  let selectedItem: T | null = null;
  let isLoading: boolean = false;
  let inputElement: HTMLInputElement;
  let internalUpdate: boolean = false;

  // Sync searchTerm when value changes externally (from parent component)
  $: if (!internalUpdate && value !== searchTerm) {
    searchTerm = value;
  }

  // Load all items
  async function loadAllItems() {
    debugger;
    if (allItems.length > 0) return;

    isLoading = true;
    try {
      allItems = await fetchAllItems();
      filteredItems = allItems;
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      isLoading = false;
    }
  }

  // Search/filter items
  async function performSearch() {
    if (!searchTerm.trim()) {
      filteredItems = allItems;
      return;
    }

    isLoading = true;
    try {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredItems = allItems.filter((item) => getDisplayText(item).toLowerCase().includes(lowerSearchTerm));

      if (filteredItems.length === 0 && searchItems) {
        filteredItems = await searchItems(searchTerm);
      }
    } catch (error) {
      console.error("Search error:", error);
      filteredItems = [];
    } finally {
      isLoading = false;
    }
  }

  // Handle input changes
  function handleInput() {
    internalUpdate = true;
    value = searchTerm;
    showDropdown = true;
    performSearch();
    setTimeout(() => {
      internalUpdate = false;
    }, 0);
  }

  // Select an item
  function selectItem(item: T) {
    internalUpdate = true;
    selectedItem = item;
    const displayText = getDisplayText(item);
    searchTerm = displayText;
    value = getValue ? getValue(item) : displayText;
    showDropdown = false;
    setTimeout(() => {
      internalUpdate = false;
    }, 0);

    dispatch("select", item);
  }

  // Handle focus
  function handleFocus() {
    if (disabled) return;
    if (allItems.length === 0) {
      loadAllItems();
    }
    showDropdown = true;
  }

  // Handle blur
  function handleBlur() {
    setTimeout(() => {
      showDropdown = false;
    }, 200);
  }

  // Clear selection
  function clearSelection() {
    internalUpdate = true;
    searchTerm = "";
    value = "";
    selectedItem = null;
    filteredItems = allItems;
    showDropdown = false;
    setTimeout(() => {
      internalUpdate = false;
    }, 0);
    dispatch("clear");
  }

  // Initialize on mount - only load items when component is mounted
  onMount(() => {
    // Don't load items here, wait for user interaction
  });
</script>

<div class="relative">
  <div class="relative">
    <input
      bind:this={inputElement}
      type="text"
      bind:value={searchTerm}
      on:input={handleInput}
      on:focus={handleFocus}
      on:blur={handleBlur}
      {placeholder}
      {required}
      {disabled}
      class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      autocomplete="off"
    />

    <!-- Clear button -->
    {#if searchTerm && !disabled}
      <button
        type="button"
        on:click={clearSelection}
        aria-label="Clear selection"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        tabindex="-1"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    {/if}

    <!-- Dropdown icon -->
    {#if !searchTerm}
      <div class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    {/if}
  </div>

  <!-- Dropdown list -->
  {#if showDropdown && !disabled}
    <div
      class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
    >
      {#if isLoading}
        <div class="px-3 py-2 text-sm text-gray-500 text-center">
          <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span class="ml-2">Loading...</span>
        </div>
      {:else if filteredItems.length === 0}
        <div class="px-3 py-2 text-sm text-gray-500 text-center">No items found</div>
      {:else}
        {#each filteredItems as item (getKey(item))}
          <button
            type="button"
            on:click={() => selectItem(item)}
            class="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
            class:bg-blue-100={selectedItem && getKey(selectedItem) === getKey(item)}
            tabindex="0"
          >
            <slot name="item" {item}>
              {getDisplayText(item)}
            </slot>
          </button>
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  div::-webkit-scrollbar {
    width: 8px;
  }

  div::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  div::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  div::-webkit-scrollbar-thumb:hover {
    background: #555;
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
