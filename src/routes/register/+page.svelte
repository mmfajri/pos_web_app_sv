<script lang="ts">
  import { goto } from "$app/navigation";

  let username: string = "";
  let email: string = "";
  let password: string = "";
  let confirmPassword: string = "";

  let error: string | null = null;
  let loading = false;

  function handleRegister(event: Event) {
    event.preventDefault();
    error = null;
    loading = true;

    // Simulate login
    setTimeout(() => {
      console.log("Register Data", { username, password });
      goto("/login");
    }, 1000);
  }

  function handleLogin(event: Event) {
    goto("/login");
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
  <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
    <h1 class="text-2xl font-bold mb-6 text-center">Register</h1>

    {#if error}
      <p class="text-red-500 text-sm mb-4">{error}</p>
    {/if}

    <form on:submit={handleRegister} class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input
          type="text"
          bind:value={username}
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-400"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="text"
          bind:value={email}
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-400"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          bind:value={password}
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-400"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input
          type="password"
          bind:value={confirmPassword}
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-400"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-150 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Registering" : "Registered"}
      </button>
    </form>
  </div>
</div>
