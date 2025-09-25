<script lang="ts">
  // This 'export' keyword makes the value a prop that can be passed in from a parent component
  export let value: string = "";
  export let label: string = "";
  export let showPassword: boolean = false;
  export let id: string = "";
</script>

<div>
  <label for="id" class="block text-sm font-medium text-gray-700 mb-1">{label}</label>
  <div class="flex items-center space-x-2">
    <input
      {id}
      type={showPassword ? "text" : "password"}
      bind:value
      required
      class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-400"
    />
    <button
      type="button"
      on:click={() => (showPassword = !showPassword)}
      class="px-3 py-2 text-sm text-blue-500 hover:text-blue-800 whitespace-nowrap"
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>
</div>
