<script lang="ts">
  import { goto } from "$app/navigation";
  import PasswordInput from "$lib/components/PasswordInput.svelte";

  let username: string = "";
  let password: string = "";
  let error: string | null = null;
  let loading = false;
  let showPassword: boolean = false;

  function handleLogin(event: Event) {
    event.preventDefault();
    error = null;
    loading = true;

    // Simulate login
    setTimeout(() => {
      console.log("Logging in:", { username, password });
      goto("/dashboard");
    }, 1000);
  }
  function handleRegister() {
    goto("/register");
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
  <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
    <h1 class="text-2xl font-bold mb-6 text-center">Login</h1>

    {#if error}
      <p class="text-red-500 text-sm mb-4">{error}</p>
    {/if}

    <form on:submit={handleLogin} class="space-y-5">
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
        <PasswordInput bind:value={password} bind:showPassword label="Password" id="password" />
      </div>

      <button
        type="submit"
        class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-150 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Log In"}
      </button>
    </form>
    <button on:click={handleRegister}>Dont Have Account ? Register here</button>
  </div>
</div>
