<script lang="ts">
  import { goto } from "$app/navigation";
  import PasswordInput from "$lib/components/PasswordInput.svelte";
  import { register } from "$lib/controllers/AuthController";

  let username: string = "";
  let email: string = "";
  let password: string = "";
  let confirmPassword: string = "";
  let showPassword: boolean = false;
  let showConfirmPassword: boolean = false;

  let error: string | null = null;
  let loading: boolean = false;

  function GoBack() {
    goto("/login");
  }

  async function handleRegister(event: Event): Promise<void> {
    event.preventDefault();
    error = null;
    loading = true;

    // Client-side validation
    if (password !== confirmPassword) {
      error = "Passwords do not match";
      loading = false;
      return;
    }

    if (password.length < 6) {
      error = "Password must be at least 6 characters long";
      loading = false;
      return;
    }

    try {
      const result = await register({
        username: username.trim(),
        email: email.trim(),
        password: password,
      });

      console.log("Registration successful:", result);
      goto("/login");
    } catch (err: unknown) {
      if (err instanceof Error) {
        error = err.message;
      } else {
        error = "An unexpected error occurred";
      }
      console.error("Registration error:", err);
    } finally {
      loading = false;
    }
  }
</script>

<!-- The rest of your template remains the same -->
<div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
  <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
    <!-- Compact back link for mobile -->
    <div class="mb-1">
      <button
        on:click={GoBack}
        class="flex items-center text-gray-500 hover:text-gray-700 transition duration-150 text-xs md:text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3 w-3 md:h-4 md:w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Login
      </button>
    </div>

    <h1 class="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Register</h1>

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
          type="email"
          bind:value={email}
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-400"
        />
      </div>

      <div>
        <PasswordInput bind:value={password} bind:showPassword label="Password" id="password" />
      </div>

      <div>
        <PasswordInput
          bind:value={confirmPassword}
          bind:showPassword={showConfirmPassword}
          label="Confirm Password"
          id="confirmPassword"
        />
      </div>

      <button
        type="submit"
        class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-150 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
        <!-- Fixed typo -->
      </button>
    </form>
  </div>
</div>
