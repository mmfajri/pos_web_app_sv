<script lang="ts">
  // This 'export' keyword makes the value a prop that can be passed in from a parent component
  export let value: string = "";
  export let label: string = "";
  export let showPassword: boolean = false;
  export let id: string = "";
</script>

<div class="mb-4">
  <label for={id} class="block text-sm font-medium text-gray-700 mb-2">{label}</label>
  <div class="relative">
    <input
      {id}
      type={showPassword ? "text" : "password"}
      bind:value
      required
      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150 pr-14 md:pr-16"
      placeholder=" "
    />
    <button
      type="button"
      on:click={() => (showPassword = !showPassword)}
      class="absolute right-0 top-0 h-full px-3 md:px-4 flex items-center text-sm font-medium text-blue-500 hover:text-blue-700 transition duration-150"
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>
</div>
