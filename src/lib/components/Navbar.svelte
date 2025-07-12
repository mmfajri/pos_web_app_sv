<script lang="ts">
  export let onLogout: () => void;
</script>

<nav class="bg-white shadow-md">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- LOGO -->
    <div class="flex-shrink-0 text-xl font-semibold text-blue-600">POS MANAGEMENT</div>
    <!-- LINKS -->
    <div class="space-x-6 hiddent md:flex">
      <a href="/dashboard" class="text-gray-700 hover:text-blue-600 font-medium">Dashboard</a>
      <a href="/product" class="text-gray-700 hover:text-blue-600 font-medium">Product</a>
      <a href="/transaction-history" class="text-gray-700 hover:text-blue-600 font-medium">Transaction History</a>
      <!-- LOGOUT -->
      <div class="flex items-center">
        <button
          on:click={onLogout}
          aria-label="Logout"
          class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
        >
          Log Out
        </button>
      </div>
    </div>
  </div>
</nav>
